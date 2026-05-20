package com.stepup.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    // La configuración CORS principal está en SecurityConfig.corsConfigurationSource().
    // Este bean existe para agregar configuraciones MVC adicionales en futuras fases.
    //
    // TODO(phase-4): Agregar configuración de content negotiation si se necesita.
    // TODO(phase-8): Agregar interceptores de logging o rate limiting si aplica.
}
