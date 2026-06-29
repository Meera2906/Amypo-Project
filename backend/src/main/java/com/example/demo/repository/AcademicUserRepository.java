package com.example.demo.repository;

import com.example.demo.entity.AcademicUser;
import com.example.demo.enums.UserRole;
import com.example.demo.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicUserRepository extends JpaRepository<AcademicUser, Long> {
    Optional<AcademicUser> findByEmail(String email);
    boolean existsByEmail(String email);
    List<AcademicUser> findByRole(UserRole role);
    long countByRole(UserRole role);
    long countByRoleAndStatus(UserRole role, UserStatus status);
}
