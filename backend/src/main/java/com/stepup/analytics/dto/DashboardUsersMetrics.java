package com.stepup.analytics.dto;

public record DashboardUsersMetrics(
        long total,
        long active,
        long blocked,
        long inactive,
        long owners,
        long admins,
        long editors,
        long viewers
) {
}
