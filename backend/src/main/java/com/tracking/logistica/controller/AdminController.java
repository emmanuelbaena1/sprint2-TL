package com.tracking.logistica.controller;

import com.tracking.logistica.dto.UserResponse;
import com.tracking.logistica.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<UserResponse> updateRole(
            @PathVariable Long userId,
            @RequestParam String role,
            Authentication authentication) {
        UserResponse response = userService.updateRole(userId, role, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{userId}/unlock")
    public ResponseEntity<UserResponse> unlock(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.unlockAccount(userId));
    }

    @GetMapping("/users/locked") public ResponseEntity<List<UserResponse>> getLockedUsers() { return ResponseEntity.ok(userService.findLockedUsers()); }

    @GetMapping("/users/security-status")
    public ResponseEntity<List<com.tracking.logistica.dto.AccountSecurityResponse>> getAccountsUnderSecurityPenalty() {
        return ResponseEntity.ok(userService.findAccountsUnderSecurityPenalty());
    }
}
