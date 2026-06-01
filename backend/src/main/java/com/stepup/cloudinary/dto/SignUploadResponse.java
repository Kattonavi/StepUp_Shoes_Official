package com.stepup.cloudinary.dto;

/**
 * Datos que el cliente necesita para subir un asset a Cloudinary con firma.
 * NO incluye api_secret — solo la firma temporal y los demás campos públicos.
 */
public record SignUploadResponse(
        String signature,
        long timestamp,
        String apiKey,
        String cloudName,
        String folder
) {}
