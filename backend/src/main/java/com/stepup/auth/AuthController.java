package com.stepup.auth;

import com.stepup.auth.dto.AuthUserResponse;
import com.stepup.auth.dto.LoginRequest;
import com.stepup.auth.dto.LoginResponse;
import com.stepup.auth.dto.LogoutRequest;
import com.stepup.auth.dto.RefreshTokenRequest;
import com.stepup.auth.service.AuthService;
import com.stepup.common.response.ApiResponse;
import com.stepup.common.util.SecurityUtils;
import com.stepup.users.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        LoginResponse response = authService.login(request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok(response, "Login successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request,
            HttpServletRequest httpRequest) {

        LoginResponse response = authService.refresh(request.refreshToken(), httpRequest);
        return ResponseEntity.ok(ApiResponse.ok(response, "Token refreshed"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @Valid @RequestBody LogoutRequest request,
            HttpServletRequest httpRequest) {

        authService.logout(request.refreshToken(), httpRequest);
        return ResponseEntity.ok(ApiResponse.ok(null, "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthUserResponse>> me() {
        User currentUser = SecurityUtils.requireCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(AuthUserResponse.from(currentUser)));
    }
}
