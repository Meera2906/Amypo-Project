package com.example.demo.dto;

import com.example.demo.enums.UserRole;

public class AuthResponseDto {
    private Long id;
    private String token;
    private String fullName;
    private String email;
    private UserRole role;

    public AuthResponseDto() {}

    public AuthResponseDto(Long id, String token, String fullName, String email, UserRole role) {
        this.id = id;
        this.token = token;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public static AuthResponseDtoBuilder builder() {
        return new AuthResponseDtoBuilder();
    }

    public static class AuthResponseDtoBuilder {
        private Long id;
        private String token;
        private String fullName;
        private String email;
        private UserRole role;

        public AuthResponseDtoBuilder id(Long id) { this.id = id; return this; }
        public AuthResponseDtoBuilder token(String token) { this.token = token; return this; }
        public AuthResponseDtoBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public AuthResponseDtoBuilder email(String email) { this.email = email; return this; }
        public AuthResponseDtoBuilder role(UserRole role) { this.role = role; return this; }

        public AuthResponseDto build() {
            return new AuthResponseDto(id, token, fullName, email, role);
        }
    }
}
