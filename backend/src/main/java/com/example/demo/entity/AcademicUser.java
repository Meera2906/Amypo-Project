package com.example.demo.entity;

import com.example.demo.enums.UserRole;
import com.example.demo.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "academic_users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role;

    @Column(name = "department")
    private String department;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private UserStatus status;
}
