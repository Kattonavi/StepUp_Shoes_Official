package com.stepup.info;

import com.stepup.common.response.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/public")
public class PublicInfoController {

    @Value("${app.version:0.1.0}")
    private String appVersion;

    @Value("${app.environment:dev}")
    private String environment;

    @GetMapping("/info")
    public ResponseEntity<ApiResponse<Map<String, String>>> info() {
        Map<String, String> data = Map.of(
                "app", "StepUp API",
                "version", appVersion,
                "environment", environment,
                "description", "StepUp e-commerce platform API"
        );
        return ResponseEntity.ok(ApiResponse.ok(data));
    }
}
