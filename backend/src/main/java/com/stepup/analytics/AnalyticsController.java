package com.stepup.analytics;

import com.stepup.analytics.dto.DashboardSummaryResponse;
import com.stepup.analytics.service.DashboardService;
import com.stepup.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final DashboardService dashboardService;

    /**
     * Dashboard summary: products, categories, users metrics + charts + recent activity.
     * Requires any authenticated admin user (any role).
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> dashboard() {
        DashboardSummaryResponse summary = dashboardService.getDashboard();
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @GetMapping("/products")
    public ResponseEntity<String> productAnalytics() {
        // TODO(phase-6B): analíticas por producto (requiere AnalyticsEvent + tracking público)
        return ResponseEntity.ok("TODO(phase-6B): GET /analytics/products — not yet implemented");
    }

    @PostMapping("/events")
    public ResponseEntity<String> registerEvent() {
        // TODO(phase-6B): registrar evento de analítica (public endpoint — anónimo)
        return ResponseEntity.ok("TODO(phase-6B): POST /analytics/events — not yet implemented");
    }
}
