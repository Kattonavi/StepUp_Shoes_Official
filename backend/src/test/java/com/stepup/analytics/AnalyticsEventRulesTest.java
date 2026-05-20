package com.stepup.analytics;

import com.stepup.analytics.dto.TrackEventRequest;
import com.stepup.analytics.enums.AnalyticsEventType;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("AnalyticsEvent Validation Rules")
class AnalyticsEventRulesTest {

    private static Validator validator;

    @BeforeAll
    static void setup() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    @DisplayName("Valid PRODUCT_VIEW request passes validation")
    void validProductView_passes() {
        TrackEventRequest req = new TrackEventRequest(
                AnalyticsEventType.PRODUCT_VIEW, null, "air-max-90",
                null, null, "product-page", "/producto/air-max-90",
                null, "session-abc", null
        );
        Set<ConstraintViolation<TrackEventRequest>> violations = validator.validate(req);
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("null eventType fails validation")
    void nullEventType_failsValidation() {
        TrackEventRequest req = new TrackEventRequest(
                null, null, null, null, null, null, null, null, null, null
        );
        Set<ConstraintViolation<TrackEventRequest>> violations = validator.validate(req);
        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("eventType"));
    }

    @Test
    @DisplayName("Minimal request with only eventType passes validation")
    void minimalRequest_passes() {
        TrackEventRequest req = new TrackEventRequest(
                AnalyticsEventType.HOME_VIEW, null, null, null,
                null, null, null, null, null, null
        );
        Set<ConstraintViolation<TrackEventRequest>> violations = validator.validate(req);
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("SEARCH event with query passes validation")
    void searchEvent_withQuery_passes() {
        TrackEventRequest req = new TrackEventRequest(
                AnalyticsEventType.SEARCH, null, null, null,
                "nike air force", "catalogo", "/catalogo", null, "s1", null
        );
        Set<ConstraintViolation<TrackEventRequest>> violations = validator.validate(req);
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("CONTACT_FORM_SUBMIT event passes validation")
    void contactFormSubmit_passes() {
        TrackEventRequest req = new TrackEventRequest(
                AnalyticsEventType.CONTACT_FORM_SUBMIT, null, null, null,
                null, "contact-form", "/contacto", null, "s2", null
        );
        Set<ConstraintViolation<TrackEventRequest>> violations = validator.validate(req);
        assertThat(violations).isEmpty();
    }
}
