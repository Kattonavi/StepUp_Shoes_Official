package com.stepup.common.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration for the in-memory rate limiter.
 *
 * Bound to {@code app.rate-limit.*} in application.yml. Each endpoint family
 * has its own max-attempts/window combination so login can be strict while
 * analytics stays permissive.
 *
 * Limitation: this is process-local. Running multiple instances behind a
 * load balancer means each instance keeps its own counters. For StepUp's
 * current single-instance Railway deployment this is acceptable; revisit
 * with Redis or a shared counter when scaling to multiple replicas.
 */
@ConfigurationProperties(prefix = "app.rate-limit")
@Getter
@Setter
public class RateLimitProperties {

    /** Master switch — set false in tests or to disable the limiter entirely. */
    private boolean enabled = true;

    private Bucket login    = new Bucket(5,   15);
    /** Per-account cap regardless of IP, so rotating IPs cannot brute-force one email. */
    private Bucket loginEmail = new Bucket(20, 60);
    private Bucket contact  = new Bucket(5,   10);
    private Bucket analytics = new Bucket(120, 10);

    @Getter
    @Setter
    public static class Bucket {
        /** Max allowed attempts within the window. */
        private int maxAttempts;
        /** Window length in minutes. */
        private int windowMinutes;

        public Bucket() {}

        public Bucket(int maxAttempts, int windowMinutes) {
            this.maxAttempts = maxAttempts;
            this.windowMinutes = windowMinutes;
        }
    }
}
