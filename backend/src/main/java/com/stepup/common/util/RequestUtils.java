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
     * Returns the client's IP address as the LAST entry of X-Forwarded-For
     * if present, then X-Real-IP, then the socket's remote address. Returns
     * {@code null} if none of those is available.
     *
     * The client controls every X-Forwarded-For entry except the one appended
     * by our own proxy (Railway, single hop), which is always the last one.
     * Trusting the first entry would let attackers rotate fake IPs and bypass
     * the login rate limit.
     */
    static String getClientIp(HttpServletRequest request) {
        if (request == null) return null;

        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            String[] hops = xff.split(",");
            String last = hops[hops.length - 1].trim();
            if (!last.isEmpty()) return last;
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
