-- ============================================================
-- V24__hash_refresh_token_ips.sql
-- created_by_ip / revoked_by_ip pasan a guardar SHA-256 (64 hex)
-- de la IP en lugar de la IP en claro.
-- Las filas existentes con IP en claro expiran solas (cleanup job).
-- ============================================================

ALTER TABLE refresh_tokens
    ALTER COLUMN created_by_ip TYPE VARCHAR(64),
    ALTER COLUMN revoked_by_ip TYPE VARCHAR(64);
