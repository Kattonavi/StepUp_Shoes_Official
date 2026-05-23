package com.stepup.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.net.URI;
import java.net.URISyntaxException;

public class SafeUrlValidator implements ConstraintValidator<SafeUrl, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // null / empty / blank are considered valid here. Pair with @NotBlank
        // on fields that are required.
        if (value == null || value.isBlank()) {
            return true;
        }

        String trimmed = value.trim();

        // Protocol-relative URLs ("//host/path") are rejected — they inherit the
        // current page's protocol and can be abused.
        if (trimmed.startsWith("//")) {
            return false;
        }

        // Internal paths: a single leading "/" followed by anything except "/" is ok.
        if (trimmed.startsWith("/")) {
            return true;
        }

        // Anything else MUST parse as an http or https absolute URL.
        try {
            URI uri = new URI(trimmed);
            String scheme = uri.getScheme();
            if (scheme == null) {
                return false;
            }
            String lower = scheme.toLowerCase();
            return ("http".equals(lower) || "https".equals(lower))
                    && uri.getHost() != null
                    && !uri.getHost().isBlank();
        } catch (URISyntaxException ex) {
            return false;
        }
    }
}
