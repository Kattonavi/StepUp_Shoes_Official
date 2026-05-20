package com.stepup.common.exception;

import java.util.UUID;

public class SnapshotNotFoundException extends RuntimeException {

    public SnapshotNotFoundException(UUID id) {
        super("Snapshot not found: " + id);
    }
}
