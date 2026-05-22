package com.stepup.analytics.service;

import com.stepup.analytics.dto.ChartDataPoint;
import com.stepup.analytics.dto.DashboardActivityMetrics;
import com.stepup.analytics.dto.DashboardCategoriesMetrics;
import com.stepup.analytics.dto.DashboardProductsMetrics;
import com.stepup.analytics.dto.DashboardPromotionsMetrics;
import com.stepup.analytics.dto.DashboardSummaryResponse;
import com.stepup.analytics.dto.DashboardUsersMetrics;
import com.stepup.analytics.dto.RecentAuditLogItem;
import com.stepup.analytics.dto.RecentProductItem;
import com.stepup.audit.entity.AuditLog;
import com.stepup.audit.repository.AuditLogRepository;
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

    public DashboardSummaryResponse getDashboard() {
        return new DashboardSummaryResponse(
                buildProductsMetrics(),
                buildCategoriesMetrics(),
                buildUsersMetrics(),
                buildPromotionsMetrics(),
                buildActivityMetrics(),
                buildProductsByStatusChart(),
                buildProductsByStockChart(),
                buildUsersByRoleChart(),
                buildAuditLogsLast7DaysChart()
        );
    }

    private DashboardProductsMetrics buildProductsMetrics() {
        return new DashboardProductsMetrics(
                productRepository.countByDeletedAtIsNull(),
                productRepository.countByStatusAndDeletedAtIsNull(ProductStatus.ACTIVE),
                productRepository.countByStatusAndDeletedAtIsNull(ProductStatus.DRAFT),
                productRepository.countByStatusAndDeletedAtIsNull(ProductStatus.HIDDEN),
                productRepository.countByDeletedAtIsNotNull(),
                productRepository.countByIsFeaturedTrueAndDeletedAtIsNull(),
                productRepository.countByIsNewTrueAndDeletedAtIsNull(),
                productRepository.countByIsOnSaleTrueAndDeletedAtIsNull(),
                productRepository.countByStockStatusAndDeletedAtIsNull(StockStatus.OUT_OF_STOCK),
                productRepository.countByStockStatusAndDeletedAtIsNull(StockStatus.AVAILABLE),
                productRepository.countByStockStatusAndDeletedAtIsNull(StockStatus.ON_REQUEST),
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

    private DashboardUsersMetrics buildUsersMetrics() {
        return new DashboardUsersMetrics(
                userRepository.countByDeletedAtIsNull(),
                userRepository.countByStatusAndDeletedAtIsNull(UserStatus.ACTIVE),
                userRepository.countByStatusAndDeletedAtIsNull(UserStatus.BLOCKED),
                userRepository.countByStatusAndDeletedAtIsNull(UserStatus.INACTIVE),
                userRepository.countByRoleAndDeletedAtIsNull(Role.OWNER),
                userRepository.countByRoleAndDeletedAtIsNull(Role.ADMIN),
                userRepository.countByRoleAndDeletedAtIsNull(Role.EDITOR),
                userRepository.countByRoleAndDeletedAtIsNull(Role.VIEWER)
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

    private List<ChartDataPoint> buildProductsByStatusChart() {
        List<ChartDataPoint> points = new ArrayList<>();
        points.add(new ChartDataPoint("Activo", productRepository.countByStatusAndDeletedAtIsNull(ProductStatus.ACTIVE)));
        points.add(new ChartDataPoint("Borrador", productRepository.countByStatusAndDeletedAtIsNull(ProductStatus.DRAFT)));
        points.add(new ChartDataPoint("Oculto", productRepository.countByStatusAndDeletedAtIsNull(ProductStatus.HIDDEN)));
        points.add(new ChartDataPoint("Eliminado", productRepository.countByDeletedAtIsNotNull()));
        return points;
    }

    private List<ChartDataPoint> buildProductsByStockChart() {
        List<ChartDataPoint> points = new ArrayList<>();
        points.add(new ChartDataPoint("Disponible", productRepository.countByStockStatusAndDeletedAtIsNull(StockStatus.AVAILABLE)));
        points.add(new ChartDataPoint("Sin stock", productRepository.countByStockStatusAndDeletedAtIsNull(StockStatus.OUT_OF_STOCK)));
        points.add(new ChartDataPoint("Bajo pedido", productRepository.countByStockStatusAndDeletedAtIsNull(StockStatus.ON_REQUEST)));
        return points;
    }

    private List<ChartDataPoint> buildUsersByRoleChart() {
        List<ChartDataPoint> points = new ArrayList<>();
        points.add(new ChartDataPoint("Owner", userRepository.countByRoleAndDeletedAtIsNull(Role.OWNER)));
        points.add(new ChartDataPoint("Admin", userRepository.countByRoleAndDeletedAtIsNull(Role.ADMIN)));
        points.add(new ChartDataPoint("Editor", userRepository.countByRoleAndDeletedAtIsNull(Role.EDITOR)));
        points.add(new ChartDataPoint("Viewer", userRepository.countByRoleAndDeletedAtIsNull(Role.VIEWER)));
        return points;
    }

    private List<ChartDataPoint> buildAuditLogsLast7DaysChart() {
        Instant sevenDaysAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        List<AuditLog> logs = auditLogRepository.findByCreatedAtAfter(sevenDaysAgo);

        Map<LocalDate, Long> countByDay = logs.stream()
                .collect(Collectors.groupingBy(
                        log -> LocalDate.ofInstant(log.getCreatedAt(), ZoneOffset.UTC),
                        Collectors.counting()
                ));

        return IntStream.range(0, 7)
                .mapToObj(i -> {
                    LocalDate date = LocalDate.now(ZoneOffset.UTC).minusDays(6 - i);
                    String label = DAY_FORMATTER.format(date.atStartOfDay(ZoneOffset.UTC));
                    return new ChartDataPoint(label, countByDay.getOrDefault(date, 0L));
                })
                .collect(Collectors.toList());
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
