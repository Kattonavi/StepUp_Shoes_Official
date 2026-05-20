package com.stepup.messages.dto;

import com.stepup.messages.enums.MessageSource;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateMessageRequest(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 255)
        String fullName,

        @Email(message = "El email no tiene un formato válido")
        @Size(max = 255)
        String email,

        @Size(max = 50)
        String phone,

        @Size(max = 500)
        String subject,

        @NotBlank(message = "El contenido es obligatorio")
        String content,

        UUID productId,

        MessageSource source

) {
    @AssertTrue(message = "Debe proporcionar email o teléfono")
    public boolean isContactInfoPresent() {
        return (email != null && !email.isBlank()) || (phone != null && !phone.isBlank());
    }
}
