package com.stepup.messages.dto;

import com.stepup.messages.enums.MessageSource;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateMessageRequest(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(min = 2, max = 120, message = "El nombre debe tener entre 2 y 120 caracteres")
        String fullName,

        @Email(message = "El email no tiene un formato válido")
        @Size(max = 180)
        String email,

        @Size(max = 40, message = "El teléfono es demasiado largo")
        String phone,

        @Size(max = 180)
        String subject,

        @NotBlank(message = "El contenido es obligatorio")
        @Size(max = 2000, message = "El contenido es demasiado largo (máx. 2000 caracteres)")
        String content,

        UUID productId,

        MessageSource source,

        /**
         * Honeypot field: a hidden input the real form never fills in. If a bot
         * autofills it (a common scraper behavior), the request is silently
         * accepted but no message is persisted. Limited to 100 chars so a bot
         * that dumps a huge payload doesn't bloat validation memory.
         */
        @Size(max = 100)
        String website

) {
    @AssertTrue(message = "Debe proporcionar email o teléfono")
    public boolean isContactInfoPresent() {
        return (email != null && !email.isBlank()) || (phone != null && !phone.isBlank());
    }

    /** True when the honeypot was filled — caller should treat the request as bot traffic. */
    public boolean isHoneypotTriggered() {
        return website != null && !website.isBlank();
    }
}
