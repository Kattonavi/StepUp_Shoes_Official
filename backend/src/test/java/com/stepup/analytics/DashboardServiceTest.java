package com.stepup.analytics;

import com.stepup.analytics.dto.DashboardSummaryResponse;
import com.stepup.analytics.service.DashboardService;
import com.stepup.audit.entity.AuditLog;
import com.stepup.audit.enums.AuditAction;
import com.stepup.audit.enums.AuditableEntityType;
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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("DashboardService Unit Tests")
class DashboardServiceTest {

    @Mock ProductRepository productRepository;
    @Mock CategoryRepository categoryRepository;
    @Mock UserRepository userRepository;
    @Mock PromotionRepository promotionRepository;
    @Mock AuditLogRepository auditLogRepository;

    @InjectMocks DashboardService dashboardService;

    @Test
    @DisplayName("getDashboard returns non-null response with all sections when database is empty")
    void getDashboard_emptyDatabase_returnsZeroMetrics() {
        stubAllRepositoriesEmpty();

        DashboardSummaryResponse result = dashboardService.getDashboard();

        assertThat(result).isNotNull();
        assertThat(result.products()).isNotNull();
        assertThat(result.products().total()).isZero();
        assertThat(result.products().active()).isZero();
        assertThat(result.categories()).isNotNull();
        assertThat(result.categories().total()).isZero();
        assertThat(result.users()).isNotNull();
        assertThat(result.users().total()).isZero();
        assertThat(result.activity()).isNotNull();
        assertThat(result.activity().recentLogs()).isEmpty();
        assertThat(result.activity().recentProducts()).isEmpty();
    }

    @Test
    @DisplayName("getDashboard returns correct product metrics from grouped queries")
    void getDashboard_withProducts_returnsCorrectMetrics() {
        // total + featured/new/onSale/visibleFalse still use scalar counts
        when(productRepository.countByDeletedAtIsNull()).thenReturn(10L);
        when(productRepository.countByDeletedAtIsNotNull()).thenReturn(3L);
        when(productRepository.countByIsFeaturedTrueAndDeletedAtIsNull()).thenReturn(4L);
        when(productRepository.countByIsNewTrueAndDeletedAtIsNull()).thenReturn(5L);
        when(productRepository.countByIsOnSaleTrueAndDeletedAtIsNull()).thenReturn(2L);
        when(productRepository.countByVisibleFalseAndDeletedAtIsNull()).thenReturn(2L);

        // Grouped queries derive active/draft/hidden and stock counts in single trips
        when(productRepository.countGroupedByStatus()).thenReturn(List.of(
                new Object[]{ProductStatus.ACTIVE, 7L},
                new Object[]{ProductStatus.DRAFT, 2L},
                new Object[]{ProductStatus.HIDDEN, 1L}
        ));
        when(productRepository.countGroupedByStockStatus()).thenReturn(List.of(
                new Object[]{StockStatus.AVAILABLE, 8L},
                new Object[]{StockStatus.OUT_OF_STOCK, 1L},
                new Object[]{StockStatus.ON_REQUEST, 1L}
        ));

        when(productRepository.findTop5ByDeletedAtIsNullOrderByUpdatedAtDesc()).thenReturn(List.of());
        stubCategoriesAndUsersEmpty();
        when(auditLogRepository.findTop10ByOrderByCreatedAtDesc()).thenReturn(List.of());
        when(auditLogRepository.countByDaySince(any())).thenReturn(List.of());

        DashboardSummaryResponse result = dashboardService.getDashboard();

        assertThat(result.products().total()).isEqualTo(10L);
        assertThat(result.products().active()).isEqualTo(7L);
        assertThat(result.products().draft()).isEqualTo(2L);
        assertThat(result.products().hidden()).isEqualTo(1L);
        assertThat(result.products().deleted()).isEqualTo(3L);
        assertThat(result.products().featured()).isEqualTo(4L);
        assertThat(result.products().outOfStock()).isEqualTo(1L);
    }

    @Test
    @DisplayName("getDashboard charts contain expected number of points")
    void getDashboard_buildCharts_containsAllLabels() {
        stubAllRepositoriesEmpty();

        DashboardSummaryResponse result = dashboardService.getDashboard();

        assertThat(result.productsByStatus()).hasSize(4);
        assertThat(result.productsByStockStatus()).hasSize(3);
        assertThat(result.usersByRole()).hasSize(4);
        assertThat(result.auditLogsLast7Days()).hasSize(7);
    }

    @Test
    @DisplayName("auditLogsLast7Days fills missing days with zero using grouped query")
    void getDashboard_auditChart_fillsZeros() {
        stubAllRepositoriesEmpty();

        DashboardSummaryResponse result = dashboardService.getDashboard();

        // Every chart point should have a non-null label and a count (0 when no events)
        result.auditLogsLast7Days().forEach(p -> {
            assertThat(p.label()).isNotBlank();
            assertThat(p.value()).isZero();
        });
    }

    @Test
    @DisplayName("getDashboard maps recent audit logs correctly")
    void getDashboard_withRecentLogs_mapsFieldsCorrectly() {
        stubAllZeroCounts();
        when(productRepository.findTop5ByDeletedAtIsNullOrderByUpdatedAtDesc()).thenReturn(List.of());

        AuditLog log = AuditLog.builder()
                .id(UUID.randomUUID())
                .actorEmail("admin@stepup.com")
                .actorRole("ADMIN")
                .action(AuditAction.SOFT_DELETE)
                .entityType(AuditableEntityType.PRODUCT)
                .entityId(UUID.randomUUID())
                .description("Product deleted")
                .createdAt(Instant.now())
                .build();

        when(auditLogRepository.findTop10ByOrderByCreatedAtDesc()).thenReturn(List.of(log));
        when(auditLogRepository.countByDaySince(any())).thenReturn(List.of());

        DashboardSummaryResponse result = dashboardService.getDashboard();

        assertThat(result.activity().recentLogs()).hasSize(1);
        assertThat(result.activity().recentLogs().get(0).actorEmail()).isEqualTo("admin@stepup.com");
        assertThat(result.activity().recentLogs().get(0).action()).isEqualTo("SOFT_DELETE");
        assertThat(result.activity().recentLogs().get(0).entityType()).isEqualTo("PRODUCT");
    }

    @Test
    @DisplayName("getDashboard maps recent products correctly")
    void getDashboard_withRecentProducts_mapsFieldsCorrectly() {
        stubAllZeroCounts();
        when(auditLogRepository.findTop10ByOrderByCreatedAtDesc()).thenReturn(List.of());
        when(auditLogRepository.countByDaySince(any())).thenReturn(List.of());

        Product product = Product.builder()
                .id(UUID.randomUUID())
                .name("Air Max 90")
                .slug("air-max-90")
                .status(ProductStatus.ACTIVE)
                .stockStatus(StockStatus.AVAILABLE)
                .price(new BigDecimal("149.99"))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(productRepository.findTop5ByDeletedAtIsNullOrderByUpdatedAtDesc()).thenReturn(List.of(product));

        DashboardSummaryResponse result = dashboardService.getDashboard();

        assertThat(result.activity().recentProducts()).hasSize(1);
        assertThat(result.activity().recentProducts().get(0).name()).isEqualTo("Air Max 90");
        assertThat(result.activity().recentProducts().get(0).status()).isEqualTo("ACTIVE");
    }

    @Test
    @DisplayName("usersByRole chart uses values from grouped query")
    void getDashboard_usersChartFromGroupedQuery() {
        stubAllZeroCounts();
        when(productRepository.findTop5ByDeletedAtIsNullOrderByUpdatedAtDesc()).thenReturn(List.of());
        when(auditLogRepository.findTop10ByOrderByCreatedAtDesc()).thenReturn(List.of());
        when(auditLogRepository.countByDaySince(any())).thenReturn(List.of());

        // Override the empty role stub with real values
        when(userRepository.countGroupedByRole()).thenReturn(List.of(
                new Object[]{Role.OWNER, 1L},
                new Object[]{Role.ADMIN, 3L},
                new Object[]{Role.EDITOR, 2L},
                new Object[]{Role.VIEWER, 5L}
        ));

        DashboardSummaryResponse result = dashboardService.getDashboard();

        assertThat(result.usersByRole()).hasSize(4);
        assertThat(result.usersByRole().get(0).value()).isEqualTo(1L); // Owner
        assertThat(result.usersByRole().get(1).value()).isEqualTo(3L); // Admin
        assertThat(result.usersByRole().get(2).value()).isEqualTo(2L); // Editor
        assertThat(result.usersByRole().get(3).value()).isEqualTo(5L); // Viewer
        // And users metrics block reflects the same numbers
        assertThat(result.users().admins()).isEqualTo(3L);
        assertThat(result.users().viewers()).isEqualTo(5L);
    }

    // --- Helpers ---

    private void stubAllRepositoriesEmpty() {
        stubAllZeroCounts();
        when(auditLogRepository.findTop10ByOrderByCreatedAtDesc()).thenReturn(List.of());
        when(auditLogRepository.countByDaySince(any())).thenReturn(List.of());
        when(productRepository.findTop5ByDeletedAtIsNullOrderByUpdatedAtDesc()).thenReturn(List.of());
    }

    private void stubAllZeroCounts() {
        when(productRepository.countByDeletedAtIsNull()).thenReturn(0L);
        when(productRepository.countByDeletedAtIsNotNull()).thenReturn(0L);
        when(productRepository.countByIsFeaturedTrueAndDeletedAtIsNull()).thenReturn(0L);
        when(productRepository.countByIsNewTrueAndDeletedAtIsNull()).thenReturn(0L);
        when(productRepository.countByIsOnSaleTrueAndDeletedAtIsNull()).thenReturn(0L);
        when(productRepository.countByVisibleFalseAndDeletedAtIsNull()).thenReturn(0L);
        when(productRepository.countGroupedByStatus()).thenReturn(List.of());
        when(productRepository.countGroupedByStockStatus()).thenReturn(List.of());

        when(categoryRepository.countByDeletedAtIsNull()).thenReturn(0L);
        when(categoryRepository.countByDeletedAtIsNullAndActiveTrue()).thenReturn(0L);
        when(categoryRepository.countByDeletedAtIsNullAndActiveFalse()).thenReturn(0L);
        when(categoryRepository.countByDeletedAtIsNotNull()).thenReturn(0L);

        when(userRepository.countByDeletedAtIsNull()).thenReturn(0L);
        when(userRepository.countGroupedByStatus()).thenReturn(List.of());
        when(userRepository.countGroupedByRole()).thenReturn(List.of());

        when(promotionRepository.countByDeletedAtIsNull()).thenReturn(0L);
        when(promotionRepository.countByActiveTrueAndDeletedAtIsNull()).thenReturn(0L);
    }

    private void stubCategoriesAndUsersEmpty() {
        when(categoryRepository.countByDeletedAtIsNull()).thenReturn(0L);
        when(categoryRepository.countByDeletedAtIsNullAndActiveTrue()).thenReturn(0L);
        when(categoryRepository.countByDeletedAtIsNullAndActiveFalse()).thenReturn(0L);
        when(categoryRepository.countByDeletedAtIsNotNull()).thenReturn(0L);
        when(userRepository.countByDeletedAtIsNull()).thenReturn(0L);
        when(userRepository.countGroupedByStatus()).thenReturn(List.of());
        when(userRepository.countGroupedByRole()).thenReturn(List.of());
        when(promotionRepository.countByDeletedAtIsNull()).thenReturn(0L);
        when(promotionRepository.countByActiveTrueAndDeletedAtIsNull()).thenReturn(0L);
    }
}
