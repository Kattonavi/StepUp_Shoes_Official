package com.stepup.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

// TODO(phase-0): Verificar que springdoc-openapi es compatible con Spring Boot 4.0.6.
// Si la dependencia springdoc-openapi-starter-webmvc-ui no resuelve desde Maven Central,
// comentar esta clase completa y la dependencia en pom.xml.

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI stepUpOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Nómada API")
                        .description("API REST de la plataforma Nómada — Java 25 · Spring Boot 4.0.6")
                        .version("v0.1.0")
                        .contact(new Contact()
                                .name("Nómada Dev")
                                .email("dev@stepup.local")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Desarrollo local"),
                        new Server().url("https://stepup-backend.railway.app").description("Producción")
                ))
                .addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("BearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT access token. Obtener con POST /api/v1/auth/login")));
    }
}
