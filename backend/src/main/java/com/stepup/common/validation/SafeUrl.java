package com.stepup.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Validates that a URL field is safe to render in the public storefront.
 *
 * Accepted forms:
 *   - null / empty                (skipped — combine with @NotBlank if required)
 *   - internal path starting with "/"  e.g. "/catalogo", "/contacto?utm=..."
 *   - absolute http:// URL
 *   - absolute https:// URL
 *
 * Rejected forms (stored XSS / open redirect vectors):
 *   - javascript:, data:, vbscript:, file:, blob:, about:
 *   - protocol-relative ("//evil.com" — could be hijacked depending on page protocol)
 *   - anything with a colon before the first "/" that isn't http/https
 */
@Documented
@Constraint(validatedBy = SafeUrlValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.METHOD, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
public @interface SafeUrl {

    String message() default "La URL debe ser una ruta interna (que empiece por /) o una URL http/https válida.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
