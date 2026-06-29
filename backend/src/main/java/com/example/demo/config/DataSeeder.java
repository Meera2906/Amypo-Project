package com.example.demo.config;

import com.example.demo.entity.AcademicUser;
import com.example.demo.entity.StudySubject;
import com.example.demo.enums.UserRole;
import com.example.demo.enums.UserStatus;
import com.example.demo.repository.AcademicUserRepository;
import com.example.demo.repository.StudySubjectRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final AcademicUserRepository userRepository;
    private final StudySubjectRepository subjectRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(AcademicUserRepository userRepository,
                      StudySubjectRepository subjectRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed default academic subjects
        seedSubject("Mathematics", "Study of numbers, space, and structure");
        seedSubject("Physics", "Study of matter, energy, space, and time");
        seedSubject("Computer Science", "Study of algorithmic processes and computation");
        seedSubject("Chemistry", "Study of substances and chemical reactions");

        // Seed admin user
        if (!userRepository.existsByEmail("admin@loomlearn.com")) {
            AcademicUser admin = AcademicUser.builder()
                    .fullName("Academic Admin")
                    .email("admin@loomlearn.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(UserRole.ACADEMIC_ADMIN)
                    .status(UserStatus.APPROVED)
                    .department("Administration")
                    .bio("LoomLearn System Administrator")
                    .build();
            userRepository.save(admin);
        }

        // Seed support agent user
        if (!userRepository.existsByEmail("support@loomlearn.com")) {
            AcademicUser support = AcademicUser.builder()
                    .fullName("Support Agent")
                    .email("support@loomlearn.com")
                    .password(passwordEncoder.encode("support123"))
                    .role(UserRole.SUPPORT_AGENT)
                    .status(UserStatus.APPROVED)
                    .department("Support")
                    .bio("LoomLearn Customer Support Agent")
                    .build();
            userRepository.save(support);
        }
    }

    private void seedSubject(String name, String description) {
        if (!subjectRepository.findByName(name).isPresent()) {
            StudySubject subject = StudySubject.builder()
                    .name(name)
                    .description(description)
                    .build();
            subjectRepository.save(subject);
        }
    }
}
