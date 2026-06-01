package com.stepup.cloudinary.service;

import com.stepup.cloudinary.dto.DeleteAssetResponse;
import com.stepup.cloudinary.dto.SignUploadResponse;
import com.stepup.common.exception.BadRequestException;
import com.stepup.config.CloudinaryProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

/**
 * Firma de uploads y eliminación de assets en Cloudinary.
 *
 * Reemplaza las rutas Next /api/cloudinary/* — ahora todo corre en el backend
 * porque las cookies httpOnly de sesión están atadas al dominio del backend
 * en producción (Railway) y las rutas Next no pueden validarlas.
 *
 * SECRETO: {@code apiSecret} JAMÁS sale del backend. Solo se usa para firmar.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final CloudinaryProperties props;
    private final ObjectMapper objectMapper;

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    /** Roles autorizados a tocar assets. VIEWER excluido a propósito. */
    public static final List<String> WRITE_ROLES =
            List.of("SUPER_ADMIN", "OWNER", "ADMIN", "EDITOR");

    // ─── SIGN ────────────────────────────────────────────────────────────────

    /**
     * Genera una firma temporal para un upload de Cloudinary.
     * Solo se firman {@code folder} y {@code timestamp} — así el cliente no
     * puede manipular el folder ni inyectar un public_id arbitrario sin
     * invalidar la firma.
     */
    public SignUploadResponse signUpload(String purpose) {
        requireConfigured();
        String folder = pickFolder(purpose);
        long timestamp = Instant.now().getEpochSecond();

        // params ordenados alfabéticamente: folder, timestamp
        String paramsToSign = "folder=" + folder + "&timestamp=" + timestamp;
        String signature = sha1Hex(paramsToSign + props.getApiSecret());

        return new SignUploadResponse(
                signature,
                timestamp,
                props.getApiKey(),
                props.getCloudName(),
                folder
        );
    }

    // ─── DELETE ──────────────────────────────────────────────────────────────

    /**
     * Borra un asset en Cloudinary por public_id.
     * Valida que el publicId esté bajo alguno de los folders permitidos
     * (products/promotions). Idempotente: Cloudinary "not found" se devuelve
     * como éxito para que el cliente quite el asset de la UI igualmente.
     */
    public DeleteAssetResponse deleteAsset(String publicId) {
        requireConfigured();
        validatePublicId(publicId);

        long timestamp = Instant.now().getEpochSecond();
        // Cloudinary signs TODOS los parámetros (excepto api_key, signature y
        // file). Si mandamos un param extra que no está en la firma (p.ej.
        // `invalidate=true`), Cloudinary devuelve "Invalid Signature" y el
        // delete falla. Por eso firmamos y enviamos SOLO public_id+timestamp.
        String paramsToSign = "public_id=" + publicId + "&timestamp=" + timestamp;
        String signature = sha1Hex(paramsToSign + props.getApiSecret());

        String form = formUrlEncoded(
                "public_id", publicId,
                "timestamp", String.valueOf(timestamp),
                "api_key",   props.getApiKey(),
                "signature", signature
        );

        URI endpoint = URI.create("https://api.cloudinary.com/v1_1/"
                + urlEncode(props.getCloudName()) + "/image/destroy");

        HttpRequest req = HttpRequest.newBuilder(endpoint)
                .timeout(Duration.ofSeconds(10))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(form, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> res;
        try {
            res = HTTP_CLIENT.send(req, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        } catch (Exception ex) {
            log.warn("Cloudinary destroy network error for publicId={} — {}",
                    publicId, ex.getClass().getSimpleName());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "No pudimos contactar a Cloudinary.");
        }

        String body = res.body();
        String resultField = parseResult(body);

        // Cloudinary devuelve `result: "ok"` o `"not found"` con HTTP 200.
        // "not found" lo tratamos como éxito idempotente — el cliente puede
        // quitar la imagen de la UI igualmente.
        if ("ok".equals(resultField)) {
            log.info("Cloudinary asset deleted: {}", publicId);
            return DeleteAssetResponse.deleted();
        }
        if ("not found".equals(resultField)) {
            log.info("Cloudinary asset already gone: {}", publicId);
            return DeleteAssetResponse.notFound();
        }

        // Anything else (signature error, auth error, network error) →
        // upstream gateway error. Loggear el body recortado para diagnóstico.
        log.warn("Cloudinary destroy failed for {} — http={} result={} body={}",
                publicId, res.statusCode(), resultField, truncate(body, 300));
        throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "No pudimos eliminar la imagen de Cloudinary.");
    }

    private static String truncate(String value, int max) {
        if (value == null) return "<null>";
        return value.length() <= max ? value : value.substring(0, max) + "…";
    }

    // ─── Helpers ────────────────────────────────────────────────────────────

    private void requireConfigured() {
        if (!props.isConfigured()) {
            log.error("Cloudinary not configured (missing cloudName/apiKey/apiSecret).");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Cloudinary no está configurado en el servidor.");
        }
    }

    /** Server-side folder selection. El cliente nunca elige el folder. */
    String pickFolder(String purpose) {
        return "promotion".equals(purpose)
                ? props.getPromotionsFolder()
                : props.getProductsFolder();
    }

    /**
     * Valida que el publicId pueda operarse de forma segura:
     *  - no vacío, ≤ 255 chars, sin espacios ni traversal,
     *  - sin esquemas de URL/script,
     *  - debe vivir bajo uno de los folders permitidos (products o promotions).
     */
    void validatePublicId(String publicId) {
        if (publicId == null) {
            throw new BadRequestException("publicId es requerido.");
        }
        String trimmed = publicId.strip();
        if (!trimmed.equals(publicId) || trimmed.isEmpty() || trimmed.length() > 255) {
            throw new BadRequestException("publicId inválido.");
        }
        if (trimmed.contains("..")
                || trimmed.indexOf('\\') >= 0
                || trimmed.chars().anyMatch(Character::isWhitespace)) {
            throw new BadRequestException("publicId inválido.");
        }
        String lower = trimmed.toLowerCase();
        if (lower.startsWith("http://") || lower.startsWith("https://")
                || lower.startsWith("javascript:") || lower.startsWith("data:")
                || lower.startsWith("file:") || lower.startsWith("vbscript:")) {
            throw new BadRequestException("publicId inválido.");
        }
        boolean inAllowedFolder =
                trimmed.startsWith(props.getProductsFolder() + "/") ||
                trimmed.startsWith(props.getPromotionsFolder() + "/");
        if (!inAllowedFolder) {
            throw new BadRequestException(
                    "publicId fuera de los folders permitidos.");
        }
    }

    private static String sha1Hex(String data) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] digest = md.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(digest.length * 2);
            for (byte b : digest) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-1 not available", e);
        }
    }

    private static String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    /** Construye un body application/x-www-form-urlencoded desde pares plano. */
    private static String formUrlEncoded(String... kv) {
        if (kv.length % 2 != 0) throw new IllegalArgumentException("kv must be pairs");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < kv.length; i += 2) {
            if (i > 0) sb.append('&');
            sb.append(urlEncode(kv[i])).append('=').append(urlEncode(kv[i + 1]));
        }
        return sb.toString();
    }

    /** Extrae el campo `result` del JSON devuelto por Cloudinary destroy. */
    private String parseResult(String body) {
        if (body == null || body.isBlank()) return null;
        try {
            JsonNode node = objectMapper.readTree(body);
            JsonNode r = node.get("result");
            return r != null ? r.asText(null) : null;
        } catch (Exception e) {
            return null;
        }
    }
}
