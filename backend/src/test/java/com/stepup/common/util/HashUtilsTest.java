package com.stepup.common.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("HashUtils Unit Tests")
class HashUtilsTest {

    @Test
    @DisplayName("sha256 should produce a 64-character hex string")
    void sha256_produces64CharHex() {
        String hash = HashUtils.sha256("hello-world");
        assertThat(hash).hasSize(64);
        assertThat(hash).matches("[0-9a-f]+");
    }

    @Test
    @DisplayName("sha256 should be deterministic for the same input")
    void sha256_isDeterministic() {
        String input = "test-token-abc123";
        assertThat(HashUtils.sha256(input)).isEqualTo(HashUtils.sha256(input));
    }

    @Test
    @DisplayName("sha256 should produce different hashes for different inputs")
    void sha256_differentInputsDifferentHashes() {
        String hash1 = HashUtils.sha256("token-one");
        String hash2 = HashUtils.sha256("token-two");
        assertThat(hash1).isNotEqualTo(hash2);
    }

    @Test
    @DisplayName("sha256 known vector: empty string")
    void sha256_emptyStringKnownValue() {
        // SHA-256("") = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
        String hash = HashUtils.sha256("");
        assertThat(hash).isEqualTo("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    }

    @Test
    @DisplayName("generateSecureToken should produce a 64-character hex string")
    void generateSecureToken_produces64CharHex() {
        String token = HashUtils.generateSecureToken();
        assertThat(token).hasSize(64);
        assertThat(token).matches("[0-9a-f]+");
    }

    @RepeatedTest(5)
    @DisplayName("generateSecureToken should produce unique tokens on each call")
    void generateSecureToken_isUnique() {
        String token1 = HashUtils.generateSecureToken();
        String token2 = HashUtils.generateSecureToken();
        assertThat(token1).isNotEqualTo(token2);
    }

    @Test
    @DisplayName("sha256 of generateSecureToken should be a valid SHA-256 hash")
    void sha256OfGeneratedToken_isValidHash() {
        String token = HashUtils.generateSecureToken();
        String hash = HashUtils.sha256(token);
        assertThat(hash).hasSize(64);
        assertThat(hash).matches("[0-9a-f]+");
    }
}
