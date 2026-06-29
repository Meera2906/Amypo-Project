package com.example.demo.controller;

import com.example.demo.entity.AcademicUser;
import com.example.demo.enums.UserRole;
import com.example.demo.enums.UserStatus;
import com.example.demo.repository.AcademicUserRepository;
import com.example.demo.exception.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AcademicUserRepository userRepository;

    public UserController(AcademicUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/mentors")
    public ResponseEntity<List<AcademicUser>> getMentors() {
        List<AcademicUser> mentors = userRepository.findByRole(UserRole.MENTOR);
        return ResponseEntity.ok(mentors);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AcademicUser> getProfile(@PathVariable Long id) {
        AcademicUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AcademicUser> updateStatus(@PathVariable Long id, @RequestParam UserStatus status) {
        AcademicUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(status);
        AcademicUser updated = userRepository.save(user);
        return ResponseEntity.ok(updated);
    }
}
