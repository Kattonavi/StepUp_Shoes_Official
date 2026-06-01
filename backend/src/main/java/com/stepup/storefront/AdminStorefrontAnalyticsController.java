package com.stepup.storefront;

import com.stepup.common.response.ApiResponse;
import com.stepup.storefront.dto.ProductPerformanceRow;
import com.stepup.storefront.dto.RecentEventRow;
import com.stepup.storefront.dto.StorefrontSummaryResponse;
import com.stepup.storefront.dto.TopCategoryRow;
import com.stepup.storefront.dto.TopProductRow;
import com.stepup.storefront.service.StorefrontEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Analytics del storefront para el admin. Requiere usuario autenticado
 * (cualquier rol admin, incluido VIEWER, puede leer).
 *
 * Rango por `range`: today | 7d | 30d | month | all.
 */
@RestController
@RequestMapping("/api/v1/admin/analytics")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AdminStorefrontAnalyticsController {

    private final StorefrontEventService service;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<StorefrontSummaryResponse>> summary(
            @RequestParam(defaultValue = "30d") String range) {
        return ResponseEntity.ok(ApiResponse.ok(service.getSummary(rangeStart(range))));
    }

    @GetMapping("/top-products")
    public ResponseEntity<ApiResponse<List<TopProductRow>>> topProducts(
            @RequestParam(defaultValue = "30d") String range,
            @RequestParam(defaultValue = "views") String by) {
        Instant from = rangeStart(range);
        List<TopProductRow> rows = "whatsapp".equalsIgnoreCase(by)
                ? service.topProductsByWhatsapp(from)
                : service.topProductsByViews(from);
        return ResponseEntity.ok(ApiResponse.ok(rows));
    }

    @GetMapping("/top-categories")
    public ResponseEntity<ApiResponse<List<TopCategoryRow>>> topCategories(
            @RequestParam(defaultValue = "30d") String range) {
        return ResponseEntity.ok(ApiResponse.ok(service.topCategories(rangeStart(range))));
    }

    @GetMapping("/recent-events")
    public ResponseEntity<ApiResponse<List<RecentEventRow>>> recentEvents(
            @RequestParam(defaultValue = "30d") String range) {
        return ResponseEntity.ok(ApiResponse.ok(service.recentEvents(rangeStart(range))));
    }

    @GetMapping("/product-performance")
    public ResponseEntity<ApiResponse<List<ProductPerformanceRow>>> productPerformance(
            @RequestParam(defaultValue = "30d") String range) {
        return ResponseEntity.ok(ApiResponse.ok(service.productPerformance(rangeStart(range))));
    }

    /** Traduce el rango a un Instant de inicio (UTC). `all` → época. */
    private static Instant rangeStart(String range) {
        Instant now = Instant.now();
        return switch (range == null ? "30d" : range.toLowerCase()) {
            case "today" -> LocalDate.now(ZoneOffset.UTC).atStartOfDay(ZoneOffset.UTC).toInstant();
            case "7d"    -> now.minus(7, ChronoUnit.DAYS);
            case "month" -> LocalDate.now(ZoneOffset.UTC).withDayOfMonth(1)
                    .atStartOfDay(ZoneOffset.UTC).toInstant();
            case "all"   -> Instant.EPOCH;
            default      -> now.minus(30, ChronoUnit.DAYS); // 30d
        };
    }
}
