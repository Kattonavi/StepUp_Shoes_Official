package com.stepup.analytics.dto;

import java.util.List;
import java.util.Map;

public record AnalyticsEventsSummaryResponse(
        long totalEvents,
        long eventsToday,
        long eventsLast7Days,
        long productViews,
        long whatsappClicks,
        long contactSubmits,
        long searches,
        long catalogViews,
        List<TopAnalyticsItemResponse> topProducts,
        List<TopAnalyticsItemResponse> topCategories,
        List<TopAnalyticsItemResponse> topSearches,
        Map<String, Long> eventsByType,
        List<ChartDataPoint> eventsLast7DaysChart
) {
}
