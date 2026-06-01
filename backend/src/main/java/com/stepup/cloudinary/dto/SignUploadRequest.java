package com.stepup.cloudinary.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Body para POST /api/v1/cloudinary/sign.
 *
 * {@code purpose} controla a qué folder se firma el upload:
 *   "product"   → products folder
 *   "promotion" → promotions folder
 *
 * El cliente NUNCA elige el folder directamente; solo el propósito.
 */
public record SignUploadRequest(
        @Size(max = 20)
        @Pattern(regexp = "product|promotion", message = "purpose must be 'product' or 'promotion'")
        String purpose
) {}
