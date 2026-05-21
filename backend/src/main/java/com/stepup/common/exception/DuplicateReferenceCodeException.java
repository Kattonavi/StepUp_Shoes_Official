package com.stepup.common.exception;

public class DuplicateReferenceCodeException extends RuntimeException {

    public DuplicateReferenceCodeException(String code) {
        super("Reference code already in use: " + code);
    }
}
