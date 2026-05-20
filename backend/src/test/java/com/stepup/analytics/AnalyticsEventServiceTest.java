package com.stepup.analytics;

import com.stepup.analytics.dto.AnalyticsEventsSummaryResponse;
import com.stepup.analytics.dto.TrackEventRequest;
import com.stepup.analytics.dto.TrackEventResponse;
import com.stepup.analytics.entity.AnalyticsEvent;
import com.stepup.analytics.enums.AnalyticsEventType;
import com.stepup.analytics.repository.AnalyticsEventRepository;
import com.stepup.analytics.service.AnalyticsEventService;
import com.stepup.categories.repository.CategoryRepository;
import com.stepup.products.repository.ProductRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AnalyticsEventService Unit Tests")
class AnalyticsEventServiceTest {

    @Mock AnalyticsEventRepository repository;
    @Mock ProductRepository productRepository;
    @Mock CategoryRepository categoryRepository;

    @InjectMocks AnalyticsEventService service;

    private HttpServletRequest mockRequest() {
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(req.getRemoteAddr()).thenReturn("192.168.1.1");
        when(req.getHeader("X-Forwarded-For")).thenReturn(null);
        when(req.getHeader("User-Agent")).thenReturn("TestAgent/1.0");
        return req;
    }

    @Test
    @DisplayName("trackEvent PRODUCT_VIEW creates and saves event")
    void trackEvent_productView_savesEvent() {
        TrackEventRequest req = new TrackEventRequest(
                AnalyticsEventType.PRODUCT_VIEW, UUID.randomUUID(),
                "air-max-90", null, null, "product-page",
                "/producto/air-max-90", null, "session-abc", null
        );
        when(productRepository.findBySlugAndDeletedAtIsNull("air-max-90"))
                .thenReturn(Optional.empty());
        AnalyticsEvent saved = AnalyticsEvent.builder()
                .id(UUID.randomUUID()).eventType(AnalyticsEventType.PRODUCT_VIEW).createdAt(Instant.now()).build();
        when(repository.save(any())).thenReturn(saved);

        TrackEventResponse result = service.trackEvent(req, mockRequest());

        assertThat(result.tracked()).isTrue();
    }

    @Test
    @DisplayName("trackEvent WHATSAPP_CLICK creates event")
    void trackEvent_whatsappClick_savesEvent() {
        TrackEventRequest req = new TrackEventRequest(
                AnalyticsEventType.WHATSAPP_CLICK, null, null, null,
                null, "footer", "/", null, "session-xyz",
                Map.of("button", "footer-wa")
        );
        AnalyticsEvent saved = AnalyticsEvent.builder()
                .id(UUID.randomUUID()).eventType(AnalyticsEventType.WHATSAPP_CLICK).createdAt(Instant.now()).build();
        when(repository.save(any())).thenReturn(saved);

        TrackEventResponse result = service.trackEvent(req, mockRequest());

        assertThat(result.tracked()).isTrue();
    }

    @Test
    @DisplayName("trackEvent sanitizes PII from metadata")
    void trackEvent_sanitizesMetadata() {
        TrackEventRequest req = new TrackEventRequest(
                AnalyticsEventType.CTA_CLICK, null, null, null, null,
                "hero", "/", null, "s1",
                Map.of("email", "user@example.com", "button", "hero-cta")
        );
        AtomicReference<Map<String, Object>> captured = new AtomicReference<>();
        when(repository.save(any())).thenAnswer(inv -> {
            AnalyticsEvent e = inv.getArgument(0);
            captured.set(e.getMetadata());
            e.setId(UUID.randomUUID());
            e.setCreatedAt(Instant.now());
            return e;
        });

        service.trackEvent(req, mockRequest());

        assertThat(captured.get()).doesNotContainKey("email");
        assertThat(captured.get()).containsKey("button");
    }

    @Test
    @DisplayName("getSummary returns zeros when database is empty")
    void getSummary_emptyDatabase_returnsZeros() {
        when(repository.count()).thenReturn(0L);
        when(repository.countByCreatedAtAfter(any())).thenReturn(0L);
        when(repository.countByEventType(any())).thenReturn(0L);
        when(repository.findTopProductsByViews(any())).thenReturn(Page.empty());
        when(repository.findTopCategoriesByViews(any())).thenReturn(Page.empty());
        when(repository.findTopSearches(any())).thenReturn(Page.empty());
        when(repository.countGroupedByEventType()).thenReturn(List.of());
        when(repository.findByCreatedAtAfter(any())).thenReturn(List.of());

        AnalyticsEventsSummaryResponse result = service.getSummary();

        assertThat(result.totalEvents()).isZero();
        assertThat(result.eventsToday()).isZero();
        assertThat(result.whatsappClicks()).isZero();
        assertThat(result.topProducts()).isEmpty();
        assertThat(result.eventsLast7DaysChart()).hasSize(7);
    }

    @Test
    @DisplayName("getSummary 7-day chart always has 7 entries")
    void getSummary_chartAlwaysHas7Days() {
        stubSummaryEmpty();

        AnalyticsEventsSummaryResponse result = service.getSummary();

        assertThat(result.eventsLast7DaysChart()).hasSize(7);
    }

    @Test
    @DisplayName("trackEvent does not throw when repository fails")
    void trackEvent_repositoryFails_returnsFalse() {
        TrackEventRequest req = new TrackEventRequest(
                AnalyticsEventType.HOME_VIEW, null, null, null, null,
                null, "/", null, null, null
        );
        when(repository.save(any())).thenThrow(new RuntimeException("DB down"));

        TrackEventResponse result = service.trackEvent(req, mockRequest());

        assertThat(result.tracked()).isFalse();
    }

    private void stubSummaryEmpty() {
        when(repository.count()).thenReturn(0L);
        when(repository.countByCreatedAtAfter(any())).thenReturn(0L);
        when(repository.countByEventType(any())).thenReturn(0L);
        when(repository.findTopProductsByViews(any())).thenReturn(new PageImpl<>(List.of()));
        when(repository.findTopCategoriesByViews(any())).thenReturn(new PageImpl<>(List.of()));
        when(repository.findTopSearches(any())).thenReturn(new PageImpl<>(List.of()));
        when(repository.countGroupedByEventType()).thenReturn(List.of());
        when(repository.findByCreatedAtAfter(any())).thenReturn(List.of());
    }
}
