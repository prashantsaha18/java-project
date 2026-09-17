package com.library.dto.auth;

public record AuthResponse(String token, String fullName, String email, String role) {
}
