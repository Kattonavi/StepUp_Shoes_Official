package com.stepup.common.exception;

/**
 * Thrown when an endpoint detects that a caller has exceeded its rate-limit window.
 * The GlobalExceptionHandler maps this to HTTP 429 with a generic message.
 *
 * The exception message is shown to the client, so it must NEVER include the
 * actual limit, window, ipHash, email, or any identifying detail.
 */
public class RateLimitExceededException extends RuntimeException {

    public RateLimitExceededException(String message) {
        super(message);
    }

    public RateLimitExceededException() {
        super("Demasiadas solicitudes. Intenta nuevamente más tarde.");
    }
}
