package com.example.demo.service;

import com.example.demo.dto.AuthRequestDto;
import com.example.demo.dto.AuthResponseDto;
import com.example.demo.dto.RegisterDto;
import com.example.demo.entity.AcademicUser;
import com.example.demo.enums.UserRole;
import com.example.demo.enums.UserStatus;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.AcademicUserRepository;
import com.example.demo.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AcademicAuthService {

    private final AcademicUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AcademicAuthService(AcademicUserRepository userRepository,
                               PasswordEncoder passwordEncoder,
                               JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponseDto register(RegisterDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessValidationException("Email already exists");
        }
        
        AcademicUser user = AcademicUser.builder()
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(dto.getRole())
                .department(dto.getDepartment())
                .bio(dto.getBio())
                .status(dto.getRole() == UserRole.MENTOR ? UserStatus.PENDING : UserStatus.APPROVED)
                .build();
                
        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail());
        
        return AuthResponseDto.builder()
                .id(user.getId())
                .token(token)
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public AuthResponseDto login(AuthRequestDto dto) {
        AcademicUser user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BusinessValidationException("Invalid Credentials.");
        }
        
        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new BusinessValidationException("Account is blocked. Please contact support.");
        }
        if (user.getStatus() == UserStatus.REJECTED) {
            throw new BusinessValidationException("Account registration was rejected.");
        }
        
        String token = jwtUtil.generateToken(user.getEmail());
        
        return AuthResponseDto.builder()
                .id(user.getId())
                .token(token)
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
