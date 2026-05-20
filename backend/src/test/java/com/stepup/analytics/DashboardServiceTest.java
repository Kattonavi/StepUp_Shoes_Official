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
import com.stepup.users.UserRepository;
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
    @DisplayName("getDashboard returns correct product metrics")
    void getDashboard_withProducts_returnsCorrectMetrics() {
        when(productRepository.countByDeletedAtIsNull()).thenReturn(10L);
        when(productRepository.countByStatusAndDeletedAtIsNull(ProductStatus.ACTIVE)).thenReturn(7L);
        when(productRepository.countByStatusAndDeletedAtIsNull(ProductStatus.DRAFT)).thenReturn(2L);
        when(productRepository.countByStatusAndDeletedAtIsNull(ProductStatus.HIDDEN)).thenReturn(1L);
        when(productRepository.countByDeletedAtIsNotNull()).thenReturn(3L);
        when(productRepository.countByIsFeaturedTrueAndDeletedAtIsNull()).thenReturn(4L);
        when(productRepository.countByIsNewTrueAndDeletedAtIsNull()).thenReturn(5L);
        when(productRepository.countByIsOnSaleTrueAndDeletedAtIsNull()).thenReturn(2L);
        when(productRepository.countByStockStatusAndDeletedAtIsNull(StockStatus.OUT_OF_STOCK)).thenReturn(1L);
        when(productRepository.countByStockStatusAndDeletedAtIsNull(StockStatus.AVAILABLE)).thenReturn(8L);
        when(productRepository.countByStockStatusAndDeletedAtIsNull(StockStatus.ON_REQUEST)).thenReturn(1L);
        when(productRepository.countByVisibleFalseAndDeletedAtIsNull()).thenReturn(2L);
        when(productRepository.findTop5ByDeletedAtIsNullOrderByUpdatedAtDesc()).thenReturn(List.of());
        stubCategoriesAndUsersEmpty();
        when(auditLogRepository.findTop10ByOrderByCreatedAtDesc()).thenReturn(List.of());
        when(auditLogRepository.findByCreatedAtAfter(any())).thenReturn(List.of());

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
    @DisplayName("getDashboard returns correct chart data points")
    void getDashboard_buildCharts_containsAllLabels() {
        stubAllRepositoriesEmpty();

        DashboardSummaryResponse result = dashboardService.getDashboard();

        assertThat(result.productsByStatus()).hasSize(4);
        assertThat(result.productsByStockStatus()).hasSize(3);
        assertThat(result.usersByRole()).hasSize(4);
        assertThat(result.auditLogsLast7Days()).hasSize(7);
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
        when(auditLogRepository.findByCreatedAtAfter(any())).thenReturn(List.of());

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
        when(auditLogRepository.findByCreatedAtAfter(any())).thenReturn(List.of());

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

    // --- Helpers ---

    private void stubAllRepositoriesEmpty() {
        stubAllZeroCounts();
        when(auditLogRepository.findTop10ByOrderByCreatedAtDesc()).thenReturn(List.of());
        when(auditLogRepository.findByCreatedAtAfter(any())).thenReturn(List.of());
        when(productRepository.findTop5ByDeletedAtIsNullOrderByUpdatedAtDesc()).thenReturn(List.of());
    }

    private void stubAllZeroCounts() {
        when(productRepository.countByDeletedAtIsNull()).thenReturn(0L);
        when(productRepository.countByDeletedAtIsNotNull()).thenReturn(0L);
        when(productRepository.countByStatusAndDeletedAtIsNull(any())).thenReturn(0L);
        when(productRepository.countByStockStatusAndDeletedAtIsNull(any())).thenReturn(0L);
        when(productRepository.countByIsFeaturedTrueAndDeletedAtIsNull()).thenReturn(0L);
        when(productRepository.countByIsNewTrueAndDeletedAtIsNull()).thenReturn(0L);
        when(productRepository.countByIsOnSaleTrueAndDeletedAtIsNull()).thenReturn(0L);
        when(productRepository.countByVisibleFalseAndDeletedAtIsNull()).thenReturn(0L);
        when(categoryRepository.countByDeletedAtIsNull()).thenReturn(0L);
        when(categoryRepository.countByDeletedAtIsNullAndActiveTrue()).thenReturn(0L);
        when(categoryRepository.countByDeletedAtIsNullAndActiveFalse()).thenReturn(0L);
        when(categoryRepository.countByDeletedAtIsNotNull()).thenReturn(0L);
        when(userRepository.countByDeletedAtIsNull()).thenReturn(0L);
        when(userRepository.countByStatusAndDeletedAtIsNull(any())).thenReturn(0L);
        when(userRepository.countByRoleAndDeletedAtIsNull(any())).thenReturn(0L);
    }

    private void stubCategoriesAndUsersEmpty() {
        when(categoryRepository.countByDeletedAtIsNull()).thenReturn(0L);
        when(categoryRepository.countByDeletedAtIsNullAndActiveTrue()).thenReturn(0L);
        when(categoryRepository.countByDeletedAtIsNullAndActiveFalse()).thenReturn(0L);
        when(categoryRepository.countByDeletedAtIsNotNull()).thenReturn(0L);
        when(userRepository.countByDeletedAtIsNull()).thenReturn(0L);
        when(userRepository.countByStatusAndDeletedAtIsNull(any())).thenReturn(0L);
        when(userRepository.countByRoleAndDeletedAtIsNull(any())).thenReturn(0L);
    }
}
