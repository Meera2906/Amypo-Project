package com.example.demo.entity;

import com.example.demo.enums.UserRole;
import com.example.demo.enums.UserStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@JsonIgnoreProperties(ignoreUnknown = true)
@Entity
@Table(name = "academic_users")
public class AcademicUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Column(name = "full_name", nullable = false)
    private String fullName;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Column(name = "password", nullable = false)
    private String password;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Column(name = "department")
    private String department;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private UserStatus status;

    public AcademicUser() {}

    public AcademicUser(Long id, String fullName, String email, String password, UserRole role, String department, String bio, UserStatus status) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.role = role;
        this.department = department;
        this.bio = bio;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }

    public static AcademicUserBuilder builder() {
        return new AcademicUserBuilder();
    }

    public static class AcademicUserBuilder {
        private Long id;
        private String fullName;
        private String email;
        private String password;
        private UserRole role;
        private String department;
        private String bio;
        private UserStatus status;

        public AcademicUserBuilder id(Long id) { this.id = id; return this; }
        public AcademicUserBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public AcademicUserBuilder email(String email) { this.email = email; return this; }
        public AcademicUserBuilder password(String password) { this.password = password; return this; }
        public AcademicUserBuilder role(UserRole role) { this.role = role; return this; }
        public AcademicUserBuilder department(String department) { this.department = department; return this; }
        public AcademicUserBuilder bio(String bio) { this.bio = bio; return this; }
        public AcademicUserBuilder status(UserStatus status) { this.status = status; return this; }

        public AcademicUser build() {
            return new AcademicUser(id, fullName, email, password, role, department, bio, status);
        }
    }
}
