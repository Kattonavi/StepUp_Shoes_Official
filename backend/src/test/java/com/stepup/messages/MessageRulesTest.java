package com.stepup.messages;

import com.stepup.messages.dto.CreateMessageRequest;
import com.stepup.messages.enums.MessageSource;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Message Validation Rules")
class MessageRulesTest {

    private static Validator validator;

    @BeforeAll
    static void setup() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    @DisplayName("Valid request with email passes validation")
    void validRequest_withEmail_passes() {
        CreateMessageRequest req = new CreateMessageRequest(
                "Ana García", "ana@example.com", null,
                "Consulta", "Estoy interesada en el producto", null, MessageSource.CONTACT_FORM
        );

        Set<ConstraintViolation<CreateMessageRequest>> violations = validator.validate(req);
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Valid request with phone only passes validation")
    void validRequest_withPhoneOnly_passes() {
        CreateMessageRequest req = new CreateMessageRequest(
                "Carlos", null, "3001234567",
                null, "Hola", null, null
        );

        Set<ConstraintViolation<CreateMessageRequest>> violations = validator.validate(req);
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("fullName blank fails validation")
    void blankFullName_failsValidation() {
        CreateMessageRequest req = new CreateMessageRequest(
                "", "test@example.com", null,
                null, "contenido", null, null
        );

        Set<ConstraintViolation<CreateMessageRequest>> violations = validator.validate(req);
        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("fullName"));
    }

    @Test
    @DisplayName("content blank fails validation")
    void blankContent_failsValidation() {
        CreateMessageRequest req = new CreateMessageRequest(
                "Test User", "test@example.com", null,
                null, "", null, null
        );

        Set<ConstraintViolation<CreateMessageRequest>> violations = validator.validate(req);
        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("content"));
    }

    @Test
    @DisplayName("Neither email nor phone fails validation")
    void noEmailOrPhone_failsValidation() {
        CreateMessageRequest req = new CreateMessageRequest(
                "Test User", null, null,
                "Asunto", "Contenido del mensaje", null, null
        );

        Set<ConstraintViolation<CreateMessageRequest>> violations = validator.validate(req);
        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("contactInfoPresent"));
    }

    @Test
    @DisplayName("Invalid email format fails validation")
    void invalidEmail_failsValidation() {
        CreateMessageRequest req = new CreateMessageRequest(
                "Test User", "not-an-email", null,
                null, "Contenido", null, null
        );

        Set<ConstraintViolation<CreateMessageRequest>> violations = validator.validate(req);
        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("email"));
    }

    @Test
    @DisplayName("null fullName fails validation")
    void nullFullName_failsValidation() {
        CreateMessageRequest req = new CreateMessageRequest(
                null, "test@example.com", null,
                null, "Contenido", null, null
        );

        Set<ConstraintViolation<CreateMessageRequest>> violations = validator.validate(req);
        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("fullName"));
    }
}
