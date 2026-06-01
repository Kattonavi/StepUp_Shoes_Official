package com.stepup.cloudinary.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DeleteAssetRequest(
        @NotBlank @Size(max = 255) String publicId
) {}
