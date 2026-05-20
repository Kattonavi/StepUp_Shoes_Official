package com.stepup.users;

import com.stepup.common.response.ApiResponse;
import com.stepup.common.util.SecurityUtils;
import com.stepup.users.dto.CreateUserRequest;
import com.stepup.users.dto.UpdateUserRequest;
import com.stepup.users.dto.UpdateUserRoleRequest;
import com.stepup.users.dto.UpdateUserStatusRequest;
import com.stepup.users.dto.UserResponse;
import com.stepup.users.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'OWNER')")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserResponse>>> listUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {

        User caller = SecurityUtils.requireCurrentUser();
        Page<UserResponse> users = userService.listUsers(caller, pageable);
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable UUID id) {
        User caller = SecurityUtils.requireCurrentUser();
        UserResponse user = userService.getById(id, caller);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody CreateUserRequest request) {

        User caller = SecurityUtils.requireCurrentUser();
        UserResponse created = userService.createUser(request, caller);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(created, "User created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request) {

        User caller = SecurityUtils.requireCurrentUser();
        UserResponse updated = userService.updateUser(id, request, caller);
        return ResponseEntity.ok(ApiResponse.ok(updated, "User updated"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserStatusRequest request) {

        User caller = SecurityUtils.requireCurrentUser();
        UserResponse updated = userService.updateStatus(id, request, caller);
        return ResponseEntity.ok(ApiResponse.ok(updated, "User status updated"));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateRole(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRoleRequest request) {

        User caller = SecurityUtils.requireCurrentUser();
        UserResponse updated = userService.updateRole(id, request, caller);
        return ResponseEntity.ok(ApiResponse.ok(updated, "User role updated"));
    }
}
