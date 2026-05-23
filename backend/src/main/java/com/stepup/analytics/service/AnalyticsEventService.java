package com.stepup.analytics.service;

import com.stepup.analytics.dto.AnalyticsEventsSummaryResponse;
import com.stepup.analytics.dto.ChartDataPoint;
import com.stepup.analytics.dto.TopAnalyticsItemResponse;
import com.stepup.analytics.dto.TrackEventRequest;
import com.stepup.analytics.dto.TrackEventResponse;
import com.stepup.analytics.entity.AnalyticsEvent;
import com.stepup.analytics.enums.AnalyticsEventType;
import com.stepup.analytics.repository.AnalyticsEventRepository;
import com.stepup.analytics.repository.AnalyticsEventSpecification;
import com.stepup.categories.entity.Category;
import com.stepup.categories.repository.CategoryRepository;
import com.stepup.common.security.RateLimitService;
import com.stepup.common.util.RequestUtils;
import com.stepup.products.repository.ProductRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsEventService {

    private static final DateTimeFormatter DAY_FORMATTER =
            DateTimeFormatter.ofPattern("MMM d").withZone(ZoneOffset.UTC);

    // Keys that must never be stored in event metadata (PII / security)
    private static final Set<String> BLOCKED_METADATA_KEYS = Set.of(
            "email", "phone", "fullname", "name", "password", "token",
            "refreshtoken", "accesstoken", "jwt", "secret", "apikey"
    );

    /** Max keys allowed in a single event's metadata blob. */
    private static final int MAX_METADATA_KEYS = 20;
    /** Max length per metadata string value. */
    private static final int MAX_METADATA_VALUE_LENGTH = 200;

    private final AnalyticsEventRepository repository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final RateLimitService rateLimitService;

    // ─── Public: track event ─────────────────────────────────────────────────

    @Transactional
    public TrackEventResponse trackEvent(TrackEventRequest req, HttpServletRequest httpRequest) {
        try {
            // Rate-limit key: ipHash + sessionId (sessionId falls back to "anon"
            // so callers without a session still get bucketed per IP).
            String ipHash = RequestUtils.getClientIpHashOrUnknown(httpRequest);
            String session = req.sessionId() != null && !req.sessionId().isBlank()
                    ? req.sessionId() : "anon";
            String rateKey = ipHash + ":" + session;
            if (!rateLimitService.check(RateLimitService.Endpoint.ANALYTICS, rateKey)) {
                // Drop silently — analytics must never disrupt UX. The frontend
                // sees tracked=false and moves on.
                return new TrackEventResponse(false);
            }

            String userAgent = RequestUtils.getUserAgent(httpRequest, 500);

            // Denormalize product info if slug provided without name
            String productName = req.productSlug() != null
                    ? productRepository.findBySlugAndDeletedAtIsNull(req.productSlug())
                            .map(p -> p.getName())
                            .orElse(null)
                    : null;

            // Denormalize category info if slug provided.
            // Single lookup — name and id come from the same Optional<Category>.
            Optional<Category> category = req.categorySlug() != null
                    ? categoryRepository.findBySlugAndDeletedAtIsNull(req.categorySlug())
                    : Optional.empty();
            String categoryName = category.map(Category::getName).orElse(null);
            UUID categoryId = category.map(Category::getId).orElse(null);

            AnalyticsEvent event = AnalyticsEvent.builder()
                    .eventType(req.eventType())
                    .productId(req.productId())
                    .productSlug(truncate(req.productSlug(), 180))
                    .productName(productName)
                    .categoryId(categoryId)
                    .categorySlug(truncate(req.categorySlug(), 180))
                    .categoryName(categoryName)
                    .searchQuery(truncate(req.searchQuery(), 120))
                    .source(truncate(req.source(), 80))
                    .path(truncate(req.path(), 500))
                    .referrer(truncate(req.referrer(), 500))
                    .userAgent(userAgent)
                    .ipHash(ipHash.equals("unknown") ? null : ipHash)
                    .sessionId(truncate(req.sessionId(), 120))
                    .metadata(sanitizeMetadata(req.metadata()))
                    .build();

            repository.save(event);
            return new TrackEventResponse(true);
        } catch (Exception e) {
            // Never fail the user's request due to analytics errors
            return new TrackEventResponse(false);
        }
    }

    // ─── Admin: list events ───────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<AnalyticsEvent> listEvents(
            AnalyticsEventType eventType,
            UUID productId,
            String productSlug,
            UUID categoryId,
            String categorySlug,
            Instant from,
            Instant to,
            int page,
            int size
    ) {
        Specification<AnalyticsEvent> spec = AnalyticsEventSpecification.buildFilter(
                eventType, productId, productSlug, categoryId, categorySlug, from, to
        );
        return repository.findAll(spec,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    // ─── Admin: summary ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AnalyticsEventsSummaryResponse getSummary() {
        Instant todayStart = LocalDate.now(ZoneOffset.UTC).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant sevenDaysAgo = Instant.now().minus(7, ChronoUnit.DAYS);

        // Single grouped query — derives total + all per-type counts.
        // Falls back to 0 for event types that have never been recorded.
        Map<String, Long> eventsByType = buildEventsByType();

        long total = eventsByType.values().stream().mapToLong(Long::longValue).sum();
        long productViews = eventsByType.getOrDefault(AnalyticsEventType.PRODUCT_VIEW.name(), 0L);
        long waClicks     = eventsByType.getOrDefault(AnalyticsEventType.WHATSAPP_CLICK.name(), 0L);
        long contacts     = eventsByType.getOrDefault(AnalyticsEventType.CONTACT_FORM_SUBMIT.name(), 0L);
        long searches     = eventsByType.getOrDefault(AnalyticsEventType.SEARCH.name(), 0L);
        long catalogViews = eventsByType.getOrDefault(AnalyticsEventType.CATALOG_VIEW.name(), 0L);

        // Time-windowed counts still need their own queries (range filter not in group-by).
        long today     = repository.countByCreatedAtAfter(todayStart);
        long last7Days = repository.countByCreatedAtAfter(sevenDaysAgo);

        List<TopAnalyticsItemResponse> topProducts = repository
                .findTopProductsByViews(PageRequest.of(0, 10))
                .stream()
                .map(row -> new TopAnalyticsItemResponse(
                        (String) row[0],
                        (String) row[1],
                        (Long) row[2]
                ))
                .collect(Collectors.toList());

        List<TopAnalyticsItemResponse> topCategories = repository
                .findTopCategoriesByViews(PageRequest.of(0, 10))
                .stream()
                .map(row -> new TopAnalyticsItemResponse(
                        (String) row[0],
                        (String) row[1],
                        (Long) row[2]
                ))
                .collect(Collectors.toList());

        List<TopAnalyticsItemResponse> topSearches = repository
                .findTopSearches(PageRequest.of(0, 10))
                .stream()
                .map(row -> new TopAnalyticsItemResponse(
                        (String) row[0],
                        null,
                        (Long) row[1]
                ))
                .collect(Collectors.toList());

        List<ChartDataPoint> chart = buildLast7DaysChart(sevenDaysAgo);

        return new AnalyticsEventsSummaryResponse(
                total, today, last7Days, productViews, waClicks,
                contacts, searches, catalogViews,
                topProducts, topCategories, topSearches,
                eventsByType, chart
        );
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Map<String, Long> buildEventsByType() {
        Map<String, Long> map = new LinkedHashMap<>();
        List<Object[]> rows = repository.countGroupedByEventType();
        for (Object[] row : rows) {
            AnalyticsEventType type = (AnalyticsEventType) row[0];
            Long count = (Long) row[1];
            map.put(type.name(), count);
        }
        return map;
    }

    /**
     * Builds the 7-day chart from a single aggregated SQL query (date_trunc + count)
     * and fills in missing days with 0. Never loads individual events into memory.
     */
    private List<ChartDataPoint> buildLast7DaysChart(Instant sevenDaysAgo) {
        Map<LocalDate, Long> byDay = new HashMap<>();
        for (Object[] row : repository.countByDaySince(sevenDaysAgo)) {
            LocalDate day = toLocalDate(row[0]);
            Long count = ((Number) row[1]).longValue();
            if (day != null) {
                byDay.put(day, count);
            }
        }
        return IntStream.range(0, 7)
                .mapToObj(i -> {
                    LocalDate date = LocalDate.now(ZoneOffset.UTC).minusDays(6 - i);
                    return new ChartDataPoint(DAY_FORMATTER.format(date.atStartOfDay(ZoneOffset.UTC)),
                            byDay.getOrDefault(date, 0L));
                })
                .collect(Collectors.toList());
    }

    /** Native PG queries return java.sql.Date — convert to LocalDate defensively. */
    private static LocalDate toLocalDate(Object value) {
        if (value == null) return null;
        if (value instanceof java.sql.Date sqlDate) return sqlDate.toLocalDate();
        if (value instanceof java.time.LocalDate ld) return ld;
        if (value instanceof java.util.Date d)
            return d.toInstant().atZone(ZoneOffset.UTC).toLocalDate();
        return null;
    }

    /**
     * Cleans event metadata before persisting:
     *   - drops PII keys (email, phone, token, etc.)
     *   - caps total keys to MAX_METADATA_KEYS
     *   - truncates any string value to MAX_METADATA_VALUE_LENGTH
     *
     * Nested maps/arrays are accepted as-is — Jackson will write JSON, but
     * the size of the column is bounded by the metadata column type.
     */
    private Map<String, Object> sanitizeMetadata(Map<String, Object> metadata) {
        if (metadata == null || metadata.isEmpty()) return null;
        Map<String, Object> clean = new HashMap<>();
        for (Map.Entry<String, Object> entry : metadata.entrySet()) {
            if (clean.size() >= MAX_METADATA_KEYS) break;
            String key = entry.getKey().toLowerCase();
            if (BLOCKED_METADATA_KEYS.contains(key)) continue;
            Object value = entry.getValue();
            if (value instanceof String s && s.length() > MAX_METADATA_VALUE_LENGTH) {
                value = s.substring(0, MAX_METADATA_VALUE_LENGTH);
            }
            clean.put(entry.getKey(), value);
        }
        return clean.isEmpty() ? null : clean;
    }

    private String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() > max ? s.substring(0, max) : s;
    }
}
