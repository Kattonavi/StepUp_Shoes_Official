package com.stepup.common.exception;

public class DuplicateSlugException extends RuntimeException {

    public DuplicateSlugException(String slug) {
        super("Slug already in use: " + slug);
    }
}
