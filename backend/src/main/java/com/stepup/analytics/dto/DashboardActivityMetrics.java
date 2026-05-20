package com.stepup.analytics.dto;

import java.util.List;

public record DashboardActivityMetrics(
        List<RecentAuditLogItem> recentLogs,
        List<RecentProductItem> recentProducts
) {
}
