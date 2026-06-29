package com.example.demo.dto;

import com.example.demo.enums.UserRole;

public class RegisterDto {
    private String fullName;
    private String email;
    private String password;
    private UserRole role;
    private String department;
    private String bio;

    public RegisterDto() {}

    public RegisterDto(String fullName, String email, String password, UserRole role, String department, String bio) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.role = role;
        this.department = department;
        this.bio = bio;
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}
