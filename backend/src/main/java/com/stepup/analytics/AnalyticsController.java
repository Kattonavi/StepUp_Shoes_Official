package com.stepup.analytics;

import com.stepup.analytics.dto.AnalyticsEventsSummaryResponse;
import com.stepup.analytics.dto.DashboardSummaryResponse;
import com.stepup.analytics.dto.TrackEventRequest;
import com.stepup.analytics.dto.TrackEventResponse;
import com.stepup.analytics.entity.AnalyticsEvent;
import com.stepup.analytics.enums.AnalyticsEventType;
import com.stepup.analytics.service.AnalyticsEventService;
import com.stepup.analytics.service.DashboardService;
import com.stepup.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final DashboardService dashboardService;
    private final AnalyticsEventService analyticsEventService;

    /**
     * Dashboard summary: products, categories, users metrics + charts.
     * Requires any authenticated admin user.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getDashboard()));
    }

    /**
     * Public endpoint — track an analytics event anonymously.
     * Already in SecurityConfig as permitAll. Never fails user requests.
     */
    @PostMapping("/events")
    public ResponseEntity<ApiResponse<TrackEventResponse>> trackEvent(
            @Valid @RequestBody TrackEventRequest request,
            HttpServletRequest httpRequest
    ) {
        TrackEventResponse response = analyticsEventService.trackEvent(request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * Admin: paginated list of events with filters. Requires authenticated admin.
     */
    @GetMapping("/events")
    public ResponseEntity<ApiResponse<Page<AnalyticsEvent>>> listEvents(
            @RequestParam(required = false) AnalyticsEventType eventType,
            @RequestParam(required = false) UUID productId,
            @RequestParam(required = false) String productSlug,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Page<AnalyticsEvent> events = analyticsEventService.listEvents(
                eventType, productId, productSlug, categoryId, categorySlug, from, to, page, size
        );
        return ResponseEntity.ok(ApiResponse.ok(events));
    }

    /**
     * Admin: analytics summary with counts, top items and 7-day chart. Requires authenticated admin.
     */
    @GetMapping("/events/summary")
    public ResponseEntity<ApiResponse<AnalyticsEventsSummaryResponse>> getEventsSummary() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsEventService.getSummary()));
    }
}
