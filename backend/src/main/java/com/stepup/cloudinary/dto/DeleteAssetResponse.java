package com.stepup.cloudinary.dto;

/**
 * Resultado de DELETE Cloudinary.
 *  - {@code "deleted"}   → el asset existía y fue borrado.
 *  - {@code "not_found"} → ya no existía (idempotente, el cliente lo trata como éxito).
 */
public record DeleteAssetResponse(
        String status
) {
    public static DeleteAssetResponse deleted()  { return new DeleteAssetResponse("deleted"); }
    public static DeleteAssetResponse notFound() { return new DeleteAssetResponse("not_found"); }
}
