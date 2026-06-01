package com.stepup.analytics.service;

import com.stepup.analytics.dto.ChartDataPoint;
import com.stepup.analytics.dto.DashboardActivityMetrics;
import com.stepup.analytics.dto.DashboardCategoriesMetrics;
import com.stepup.analytics.dto.DashboardProductsMetrics;
import com.stepup.analytics.dto.DashboardPromotionsMetrics;
import com.stepup.analytics.dto.DashboardStorefrontMetrics;
import com.stepup.analytics.dto.DashboardSummaryResponse;
import com.stepup.analytics.dto.DashboardUsersMetrics;
import com.stepup.analytics.dto.RecentAuditLogItem;
import com.stepup.analytics.dto.RecentProductItem;
import com.stepup.audit.entity.AuditLog;
import com.stepup.audit.repository.AuditLogRepository;
import com.stepup.storefront.dto.StorefrontSummaryResponse;
import com.stepup.storefront.service.StorefrontEventService;
import com.stepup.categories.repository.CategoryRepository;
import com.stepup.products.entity.Product;
import com.stepup.products.enums.ProductStatus;
import com.stepup.products.enums.StockStatus;
import com.stepup.products.repository.ProductRepository;
import com.stepup.promotions.repository.PromotionRepository;
import com.stepup.users.Role;
import com.stepup.users.UserRepository;
import com.stepup.users.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private static final DateTimeFormatter DAY_FORMATTER = DateTimeFormatter.ofPattern("MMM d").withZone(ZoneOffset.UTC);

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final PromotionRepository promotionRepository;
    private final AuditLogRepository auditLogRepository;
    private final StorefrontEventService storefrontEventService;

    public DashboardSummaryResponse getDashboard() {
        // Compute grouped counts once and reuse them for both the metric block and the chart.
        Map<ProductStatus, Long> productByStatus  = groupedProductStatus();
        Map<StockStatus, Long>   productByStock   = groupedProductStock();
        Map<UserStatus, Long>    usersByStatus    = groupedUserStatus();
        Map<Role, Long>          usersByRole      = groupedUserRole();

        return new DashboardSummaryResponse(
                buildProductsMetrics(productByStatus, productByStock),
                buildCategoriesMetrics(),
                buildUsersMetrics(usersByStatus, usersByRole),
                buildPromotionsMetrics(),
                buildActivityMetrics(),
                buildStorefrontMetrics(),
                buildProductsByStatusChart(productByStatus),
                buildProductsByStockChart(productByStock),
                buildUsersByRoleChart(usersByRole),
                buildAuditLogsLast7DaysChart()
        );
    }

    /** Interés de clientes en los últimos 30 días (storefront events). */
    private DashboardStorefrontMetrics buildStorefrontMetrics() {
        Instant from = Instant.now().minus(30, ChronoUnit.DAYS);
        StorefrontSummaryResponse s = storefrontEventService.getSummary(from);
        return new DashboardStorefrontMetrics(
                s.totalProductViews(),
                s.totalWhatsappClicks(),
                s.conversionRateApprox(),
                s.mostConsultedProductName(),
                s.mostConsultedProductSlug()
        );
    }

    private DashboardProductsMetrics buildProductsMetrics(
            Map<ProductStatus, Long> byStatus, Map<StockStatus, Long> byStock) {
        return new DashboardProductsMetrics(
                productRepository.countByDeletedAtIsNull(),
                byStatus.getOrDefault(ProductStatus.ACTIVE, 0L),
                byStatus.getOrDefault(ProductStatus.DRAFT, 0L),
                byStatus.getOrDefault(ProductStatus.HIDDEN, 0L),
                productRepository.countByDeletedAtIsNotNull(),
                productRepository.countByIsFeaturedTrueAndDeletedAtIsNull(),
                productRepository.countByIsNewTrueAndDeletedAtIsNull(),
                productRepository.countByIsOnSaleTrueAndDeletedAtIsNull(),
                byStock.getOrDefault(StockStatus.OUT_OF_STOCK, 0L),
                byStock.getOrDefault(StockStatus.AVAILABLE, 0L),
                byStock.getOrDefault(StockStatus.ON_REQUEST, 0L),
                productRepository.countByVisibleFalseAndDeletedAtIsNull()
        );
    }

    private DashboardPromotionsMetrics buildPromotionsMetrics() {
        return new DashboardPromotionsMetrics(
                promotionRepository.countByDeletedAtIsNull(),
                promotionRepository.countByActiveTrueAndDeletedAtIsNull()
        );
    }

    private DashboardCategoriesMetrics buildCategoriesMetrics() {
        return new DashboardCategoriesMetrics(
                categoryRepository.countByDeletedAtIsNull(),
                categoryRepository.countByDeletedAtIsNullAndActiveTrue(),
                categoryRepository.countByDeletedAtIsNullAndActiveFalse(),
                categoryRepository.countByDeletedAtIsNotNull()
        );
    }

    private DashboardUsersMetrics buildUsersMetrics(
            Map<UserStatus, Long> byStatus, Map<Role, Long> byRole) {
        return new DashboardUsersMetrics(
                userRepository.countByDeletedAtIsNull(),
                byStatus.getOrDefault(UserStatus.ACTIVE, 0L),
                byStatus.getOrDefault(UserStatus.BLOCKED, 0L),
                byStatus.getOrDefault(UserStatus.INACTIVE, 0L),
                byRole.getOrDefault(Role.OWNER, 0L),
                byRole.getOrDefault(Role.ADMIN, 0L),
                byRole.getOrDefault(Role.EDITOR, 0L),
                byRole.getOrDefault(Role.VIEWER, 0L)
        );
    }

    private DashboardActivityMetrics buildActivityMetrics() {
        List<RecentAuditLogItem> recentLogs = auditLogRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(this::toRecentAuditLogItem)
                .collect(Collectors.toList());

        List<RecentProductItem> recentProducts = productRepository.findTop5ByDeletedAtIsNullOrderByUpdatedAtDesc()
                .stream()
                .map(this::toRecentProductItem)
                .collect(Collectors.toList());

        return new DashboardActivityMetrics(recentLogs, recentProducts);
    }

    private List<ChartDataPoint> buildProductsByStatusChart(Map<ProductStatus, Long> byStatus) {
        List<ChartDataPoint> points = new ArrayList<>();
        points.add(new ChartDataPoint("Activo",    byStatus.getOrDefault(ProductStatus.ACTIVE, 0L)));
        points.add(new ChartDataPoint("Borrador",  byStatus.getOrDefault(ProductStatus.DRAFT, 0L)));
        points.add(new ChartDataPoint("Oculto",    byStatus.getOrDefault(ProductStatus.HIDDEN, 0L)));
        points.add(new ChartDataPoint("Eliminado", productRepository.countByDeletedAtIsNotNull()));
        return points;
    }

    private List<ChartDataPoint> buildProductsByStockChart(Map<StockStatus, Long> byStock) {
        List<ChartDataPoint> points = new ArrayList<>();
        points.add(new ChartDataPoint("Disponible",  byStock.getOrDefault(StockStatus.AVAILABLE, 0L)));
        points.add(new ChartDataPoint("Sin stock",   byStock.getOrDefault(StockStatus.OUT_OF_STOCK, 0L)));
        points.add(new ChartDataPoint("Bajo pedido", byStock.getOrDefault(StockStatus.ON_REQUEST, 0L)));
        return points;
    }

    private List<ChartDataPoint> buildUsersByRoleChart(Map<Role, Long> byRole) {
        List<ChartDataPoint> points = new ArrayList<>();
        points.add(new ChartDataPoint("Owner",  byRole.getOrDefault(Role.OWNER, 0L)));
        points.add(new ChartDataPoint("Admin",  byRole.getOrDefault(Role.ADMIN, 0L)));
        points.add(new ChartDataPoint("Editor", byRole.getOrDefault(Role.EDITOR, 0L)));
        points.add(new ChartDataPoint("Viewer", byRole.getOrDefault(Role.VIEWER, 0L)));
        return points;
    }

    /**
     * Builds the audit-logs 7-day chart from a single aggregated SQL query.
     * Replaces the previous approach that loaded all logs into memory.
     */
    private List<ChartDataPoint> buildAuditLogsLast7DaysChart() {
        Instant sevenDaysAgo = Instant.now().minus(7, ChronoUnit.DAYS);

        Map<LocalDate, Long> countByDay = new HashMap<>();
        for (Object[] row : auditLogRepository.countByDaySince(sevenDaysAgo)) {
            LocalDate day = toLocalDate(row[0]);
            Long count = ((Number) row[1]).longValue();
            if (day != null) {
                countByDay.put(day, count);
            }
        }

        return IntStream.range(0, 7)
                .mapToObj(i -> {
                    LocalDate date = LocalDate.now(ZoneOffset.UTC).minusDays(6 - i);
                    String label = DAY_FORMATTER.format(date.atStartOfDay(ZoneOffset.UTC));
                    return new ChartDataPoint(label, countByDay.getOrDefault(date, 0L));
                })
                .collect(Collectors.toList());
    }

    // ─── Grouped-count helpers ───────────────────────────────────────────────

    private Map<ProductStatus, Long> groupedProductStatus() {
        Map<ProductStatus, Long> map = new EnumMap<>(ProductStatus.class);
        for (Object[] row : productRepository.countGroupedByStatus()) {
            map.put((ProductStatus) row[0], (Long) row[1]);
        }
        return map;
    }

    private Map<StockStatus, Long> groupedProductStock() {
        Map<StockStatus, Long> map = new EnumMap<>(StockStatus.class);
        for (Object[] row : productRepository.countGroupedByStockStatus()) {
            map.put((StockStatus) row[0], (Long) row[1]);
        }
        return map;
    }

    private Map<UserStatus, Long> groupedUserStatus() {
        Map<UserStatus, Long> map = new EnumMap<>(UserStatus.class);
        for (Object[] row : userRepository.countGroupedByStatus()) {
            map.put((UserStatus) row[0], (Long) row[1]);
        }
        return map;
    }

    private Map<Role, Long> groupedUserRole() {
        Map<Role, Long> map = new EnumMap<>(Role.class);
        for (Object[] row : userRepository.countGroupedByRole()) {
            map.put((Role) row[0], (Long) row[1]);
        }
        return map;
    }

    private static LocalDate toLocalDate(Object value) {
        if (value == null) return null;
        if (value instanceof java.sql.Date sqlDate) return sqlDate.toLocalDate();
        if (value instanceof java.time.LocalDate ld) return ld;
        if (value instanceof java.util.Date d)
            return d.toInstant().atZone(ZoneOffset.UTC).toLocalDate();
        return null;
    }

    private RecentAuditLogItem toRecentAuditLogItem(AuditLog log) {
        return new RecentAuditLogItem(
                log.getId(),
                log.getActorEmail(),
                log.getActorRole(),
                log.getAction().name(),
                log.getEntityType().name(),
                log.getEntityId(),
                log.getDescription(),
                log.getCreatedAt()
        );
    }

    private RecentProductItem toRecentProductItem(Product product) {
        return new RecentProductItem(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getStatus().name(),
                product.getStockStatus().name(),
                product.getPrice(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}
