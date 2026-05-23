package com.stepup.common.util;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Helpers for extracting client metadata from HTTP requests.
 * Centralizes the proxy-header logic so AuthService, AnalyticsEventService,
 * the rate limiter, etc. all derive the client IP the same way.
 *
 * NOTE: the raw IP should never leave this class. Callers should always use
 * {@link #getClientIpHash(HttpServletRequest)} for storage and rate-limit keys.
 */
public final class RequestUtils {

    private RequestUtils() {}

    /**
     * Returns the client's IP address as the first entry of X-Forwarded-For
     * if present, then X-Real-IP, then the socket's remote address. Returns
     * {@code null} if none of those is available.
     *
     * Behind Railway / Cloudflare / typical PaaS proxies the X-Forwarded-For
     * header is the truthful one. We trust the first hop only.
     */
    static String getClientIp(HttpServletRequest request) {
        if (request == null) return null;

        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            // X-Forwarded-For can be "client, proxy1, proxy2" — first one is the client.
            String first = xff.split(",")[0].trim();
            if (!first.isEmpty()) return first;
        }

        String xri = request.getHeader("X-Real-IP");
        if (xri != null && !xri.isBlank()) return xri.trim();

        String remote = request.getRemoteAddr();
        if (remote != null && !remote.isBlank()) return remote;

        return null;
    }

    /**
     * Returns the SHA-256 hex hash of the client IP, or {@code null} if no IP
     * is available. Safe to use as a database column or rate-limit key.
     */
    public static String getClientIpHash(HttpServletRequest request) {
        String ip = getClientIp(request);
        return ip != null ? HashUtils.sha256(ip) : null;
    }

    /**
     * Returns a non-null IP hash even when the IP is missing — falls back to
     * a stable "unknown" token. Useful for rate-limit keys that must always
     * compose a non-null string.
     */
    public static String getClientIpHashOrUnknown(HttpServletRequest request) {
        String hash = getClientIpHash(request);
        return hash != null ? hash : "unknown";
    }

    /** Returns the User-Agent header truncated to {@code maxLength}, or null. */
    public static String getUserAgent(HttpServletRequest request, int maxLength) {
        if (request == null) return null;
        String ua = request.getHeader("User-Agent");
        if (ua == null || ua.isBlank()) return null;
        return ua.length() > maxLength ? ua.substring(0, maxLength) : ua;
    }
}
