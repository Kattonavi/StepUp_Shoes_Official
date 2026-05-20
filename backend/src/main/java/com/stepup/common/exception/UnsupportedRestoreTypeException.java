package com.stepup.common.exception;

public class UnsupportedRestoreTypeException extends RuntimeException {

    public UnsupportedRestoreTypeException(Object entityType) {
        super("Restore not supported for entity type: " + entityType);
    }
}
