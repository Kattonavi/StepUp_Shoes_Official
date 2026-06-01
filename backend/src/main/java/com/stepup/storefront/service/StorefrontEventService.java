package com.stepup.storefront.service;

import com.stepup.common.security.RateLimitService;
import com.stepup.common.util.HashUtils;
import com.stepup.common.util.RequestUtils;
import com.stepup.products.entity.Product;
import com.stepup.products.enums.ProductStatus;
import com.stepup.products.repository.ProductRepository;
import com.stepup.storefront.dto.ProductPerformanceRow;
import com.stepup.storefront.dto.RecentEventRow;
import com.stepup.storefront.dto.StorefrontEventRequest;
import com.stepup.storefront.dto.StorefrontSummaryResponse;
import com.stepup.storefront.dto.TopCategoryRow;
import com.stepup.storefront.dto.TopProductRow;
import com.stepup.storefront.entity.StorefrontEvent;
import com.stepup.storefront.enums.StorefrontEventType;
import com.stepup.storefront.repository.StorefrontEventRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Ingesta y agregación de eventos del storefront.
 *
 * Privacidad: solo se almacenan hashes anónimos (sessionHash, userAgentHash).
 * Nunca IP en texto, email, teléfono ni nombre del visitante.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StorefrontEventService {

    private static final int MAX_METADATA_ENTRIES = 20;
    private static final int TOP_LIMIT = 10;

    private final StorefrontEventRepository repository;
    private final ProductRepository productRepository;
    private final RateLimitService rateLimitService;

    // ─── Ingest ───────────────────────────────────────────────────────────────

    /**
     * Registra un evento. Fire-and-forget desde el frontend: nunca debe romper
     * la UX. Si el rate-limit se excede o algo falla, se ignora silenciosamente.
     */
    @Transactional
    public void track(StorefrontEventRequest req, HttpServletRequest httpRequest) {
        try {
            String ipHash = RequestUtils.getClientIpHashOrUnknown(httpRequest);
            String session = req.sessionId() != null && !req.sessionId().isBlank()
                    ? req.sessionId() : "anon";
            String rateKey = ipHash + ":" + session;
            if (!rateLimitService.check(RateLimitService.Endpoint.ANALYTICS, rateKey)) {
                return; // demasiados eventos desde este origen — descartar sin error
            }

            String ua = RequestUtils.getUserAgent(httpRequest, 512);

            StorefrontEvent event = StorefrontEvent.builder()
                    .eventType(req.eventType())
                    .productId(req.productId())
                    .productSlug(truncate(req.productSlug(), 255))
                    .productName(truncate(req.productName(), 255))
                    .categoryId(req.categoryId())
                    .categorySlug(truncate(req.categorySlug(), 255))
                    .categoryName(truncate(req.categoryName(), 255))
                    .promotionId(req.promotionId())
                    .promotionTitle(truncate(req.promotionTitle(), 255))
                    .selectedSize(truncate(req.selectedSize(), 50))
                    .stockStatus(truncate(req.stockStatus(), 50))
                    .sourcePage(truncate(req.sourcePage(), 255))
                    .metadata(sanitizeMetadata(req.metadata()))
                    .userAgentHash(ua != null && !ua.isBlank() ? HashUtils.sha256(ua) : null)
                    .sessionHash("anon".equals(session) ? null : HashUtils.sha256(session))
                    .build();

            repository.save(event);
        } catch (Exception ex) {
            // Tracking jamás debe propagar un error al cliente.
            log.debug("Storefront event ignored: {}", ex.getClass().getSimpleName());
        }
    }

    // ─── Analytics (admin) ────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public StorefrontSummaryResponse getSummary(Instant from) {
        long productViews = repository.countByEventTypeAndCreatedAtGreaterThanEqual(
                StorefrontEventType.PRODUCT_VIEW, from);
        long whatsappClicks = repository.countByEventTypeAndCreatedAtGreaterThanEqual(
                StorefrontEventType.WHATSAPP_CLICK, from);
        long promotionClicks = repository.countByEventTypeAndCreatedAtGreaterThanEqual(
                StorefrontEventType.PROMOTION_CLICK, from);

        double conversion = productViews > 0
                ? round2((double) whatsappClicks / productViews) : 0.0;

        List<TopProductRow> byViews = topProductsByViews(from);
        List<TopProductRow> byWhatsapp = topProductsByWhatsapp(from);
        List<TopCategoryRow> topCats = topCategories(from);

        TopProductRow mostViewed = byViews.isEmpty() ? null : byViews.get(0);
        TopProductRow mostConsulted = byWhatsapp.isEmpty() ? null : byWhatsapp.get(0);
        TopCategoryRow topCategory = topCats.isEmpty() ? null : topCats.get(0);

        return new StorefrontSummaryResponse(
                productViews,
                whatsappClicks,
                promotionClicks,
                conversion,
                mostViewed != null ? mostViewed.productName() : null,
                mostViewed != null ? mostViewed.productSlug() : null,
                mostConsulted != null ? mostConsulted.productName() : null,
                mostConsulted != null ? mostConsulted.productSlug() : null,
                topCategory != null ? topCategory.categoryName() : null
        );
    }

    @Transactional(readOnly = true)
    public List<TopProductRow> topProductsByViews(Instant from) {
        Map<UUID, Long> whatsapp = whatsappByProductMap(from);
        List<TopProductRow> rows = new ArrayList<>();
        for (Object[] r : repository.viewsByProduct(from)) {
            UUID productId = (UUID) r[0];
            long views = ((Number) r[4]).longValue();
            long wa = whatsapp.getOrDefault(productId, 0L);
            rows.add(new TopProductRow(
                    productId,
                    (String) r[1],
                    (String) r[2],
                    (String) r[3],
                    views,
                    wa,
                    views > 0 ? round2((double) wa / views) : 0.0,
                    (Instant) r[5]
            ));
            if (rows.size() >= TOP_LIMIT) break;
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public List<TopProductRow> topProductsByWhatsapp(Instant from) {
        // Construye filas a partir de las vistas (que traen nombre/slug) y ordena
        // por consultas WhatsApp. Productos con WhatsApp pero sin vistas en el
        // rango quedan cubiertos por el mapa de whatsapp; les damos 0 vistas.
        Map<UUID, Long> whatsapp = whatsappByProductMap(from);
        if (whatsapp.isEmpty()) return List.of();

        Map<UUID, TopProductRow> byProduct = new HashMap<>();
        for (Object[] r : repository.viewsByProduct(from)) {
            UUID productId = (UUID) r[0];
            long views = ((Number) r[4]).longValue();
            long wa = whatsapp.getOrDefault(productId, 0L);
            byProduct.put(productId, new TopProductRow(
                    productId, (String) r[1], (String) r[2], (String) r[3],
                    views, wa, views > 0 ? round2((double) wa / views) : 0.0,
                    (Instant) r[5]));
        }
        // Asegurar productos con WhatsApp pero sin fila de vistas.
        for (Map.Entry<UUID, Long> e : whatsapp.entrySet()) {
            byProduct.computeIfAbsent(e.getKey(), id ->
                    new TopProductRow(id, null, null, null, 0, e.getValue(), 0.0, null));
        }
        return byProduct.values().stream()
                .sorted(Comparator.comparingLong(TopProductRow::whatsappClicks).reversed())
                .limit(TOP_LIMIT)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TopCategoryRow> topCategories(Instant from) {
        Map<UUID, Long> whatsapp = new HashMap<>();
        for (Object[] r : repository.whatsappByCategory(from)) {
            whatsapp.put((UUID) r[0], ((Number) r[1]).longValue());
        }
        List<TopCategoryRow> rows = new ArrayList<>();
        for (Object[] r : repository.viewsByCategory(from)) {
            UUID categoryId = (UUID) r[0];
            rows.add(new TopCategoryRow(
                    categoryId,
                    (String) r[1],
                    (String) r[2],
                    ((Number) r[3]).longValue(),
                    whatsapp.getOrDefault(categoryId, 0L)
            ));
            if (rows.size() >= TOP_LIMIT) break;
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public List<RecentEventRow> recentEvents(Instant from) {
        return repository.findTop25ByCreatedAtGreaterThanEqualOrderByCreatedAtDesc(from)
                .stream()
                .map(e -> new RecentEventRow(
                        e.getEventType().name(),
                        e.getProductName(),
                        e.getProductSlug(),
                        e.getCategoryName(),
                        e.getPromotionTitle(),
                        e.getSelectedSize(),
                        e.getCreatedAt()))
                .toList();
    }

    /**
     * Rendimiento de productos publicados (ACTIVE + visibles) con sus vistas y
     * consultas en el rango. Incluye productos con 0 interacciones para
     * identificar "publicados sin interés".
     */
    @Transactional(readOnly = true)
    public List<ProductPerformanceRow> productPerformance(Instant from) {
        Map<UUID, Long> views = new HashMap<>();
        for (Object[] r : repository.viewsByProduct(from)) {
            views.put((UUID) r[0], ((Number) r[4]).longValue());
        }
        Map<UUID, Long> whatsapp = whatsappByProductMap(from);

        List<Product> published =
                productRepository.findByStatusAndVisibleTrueAndDeletedAtIsNull(ProductStatus.ACTIVE);

        return published.stream()
                .map(p -> new ProductPerformanceRow(
                        p.getId(),
                        p.getName(),
                        p.getSlug(),
                        p.getStatus().name(),
                        Boolean.TRUE.equals(p.getVisible()),
                        views.getOrDefault(p.getId(), 0L),
                        whatsapp.getOrDefault(p.getId(), 0L)))
                // Menos interacción primero — los "sin interés" suben al principio.
                .sorted(Comparator
                        .comparingLong(ProductPerformanceRow::views)
                        .thenComparingLong(ProductPerformanceRow::whatsappClicks))
                .toList();
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private Map<UUID, Long> whatsappByProductMap(Instant from) {
        Map<UUID, Long> map = new HashMap<>();
        for (Object[] r : repository.whatsappByProduct(from)) {
            map.put((UUID) r[0], ((Number) r[1]).longValue());
        }
        return map;
    }

    private static Map<String, Object> sanitizeMetadata(Map<String, Object> metadata) {
        if (metadata == null || metadata.isEmpty()) return null;
        Map<String, Object> clean = new HashMap<>();
        int count = 0;
        for (Map.Entry<String, Object> e : metadata.entrySet()) {
            if (count++ >= MAX_METADATA_ENTRIES) break;
            String key = truncate(e.getKey(), 60);
            Object value = e.getValue();
            // Solo escalares simples — nada de objetos anidados arbitrarios.
            if (value instanceof String s) {
                clean.put(key, truncate(s, 255));
            } else if (value instanceof Number || value instanceof Boolean) {
                clean.put(key, value);
            }
        }
        return clean.isEmpty() ? null : clean;
    }

    private static String truncate(String value, int max) {
        if (value == null) return null;
        String trimmed = value.strip();
        if (trimmed.isEmpty()) return null;
        return trimmed.length() <= max ? trimmed : trimmed.substring(0, max);
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
