package com.stepup.common.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("RequestUtils Unit Tests")
class RequestUtilsTest {

    @Test
    @DisplayName("uses the proxy-appended (last) X-Forwarded-For entry, not the spoofable first one")
    void usesLastForwardedHop() {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.addHeader("X-Forwarded-For", "10.0.0.1, 203.0.113.7");

        assertThat(RequestUtils.getClientIp(req)).isEqualTo("203.0.113.7");
    }

    @Test
    @DisplayName("spoofed first hops do not change the client IP hash")
    void spoofedFirstHopDoesNotChangeHash() {
        MockHttpServletRequest a = new MockHttpServletRequest();
        a.addHeader("X-Forwarded-For", "1.1.1.1, 203.0.113.7");
        MockHttpServletRequest b = new MockHttpServletRequest();
        b.addHeader("X-Forwarded-For", "2.2.2.2, 203.0.113.7");

        assertThat(RequestUtils.getClientIpHash(a)).isEqualTo(RequestUtils.getClientIpHash(b));
    }

    @Test
    @DisplayName("falls back to the socket address without X-Forwarded-For")
    void fallsBackToRemoteAddr() {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.setRemoteAddr("198.51.100.4");

        assertThat(RequestUtils.getClientIp(req)).isEqualTo("198.51.100.4");
    }
}
