package com.example.demo.config;

import com.example.demo.entity.AcademicUser;
import com.example.demo.entity.MentorFeedback;
import com.example.demo.entity.SessionEnrollment;
import com.example.demo.entity.StudySubject;
import com.example.demo.entity.TutoringSession;
import com.example.demo.enums.EnrollmentStatus;
import com.example.demo.enums.SessionStatus;
import com.example.demo.enums.UserRole;
import com.example.demo.enums.UserStatus;
import com.example.demo.repository.AcademicUserRepository;
import com.example.demo.repository.MentorFeedbackRepository;
import com.example.demo.repository.SessionEnrollmentRepository;
import com.example.demo.repository.StudySubjectRepository;
import com.example.demo.repository.TutoringSessionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private final AcademicUserRepository userRepository;
    private final StudySubjectRepository subjectRepository;
    private final TutoringSessionRepository sessionRepository;
    private final SessionEnrollmentRepository enrollmentRepository;
    private final MentorFeedbackRepository feedbackRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(AcademicUserRepository userRepository,
                      StudySubjectRepository subjectRepository,
                      TutoringSessionRepository sessionRepository,
                      SessionEnrollmentRepository enrollmentRepository,
                      MentorFeedbackRepository feedbackRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.sessionRepository = sessionRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.feedbackRepository = feedbackRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Subjects
        StudySubject cs = seedSubject("Computer Science", "Study of algorithmic processes, data structures, and software engineering.");
        StudySubject math = seedSubject("Mathematics", "Linear algebra, calculus, and discrete mathematical structures.");
        StudySubject physics = seedSubject("Physics", "Study of mechanics, electromagnetism, and modern quantum physics.");
        StudySubject chemistry = seedSubject("Chemistry", "Organic reactions, physical chemistry principles, and molecular structures.");

        // 2. Seed Admin & Support Users
        if (!userRepository.existsByEmail("admin@loomlearn.com")) {
            userRepository.save(AcademicUser.builder()
                    .fullName("Academic Admin")
                    .email("admin@loomlearn.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(UserRole.ACADEMIC_ADMIN)
                    .status(UserStatus.APPROVED)
                    .department("Administration")
                    .bio("LoomLearn System Administrator")
                    .build());
        }

        if (!userRepository.existsByEmail("support@loomlearn.com")) {
            userRepository.save(AcademicUser.builder()
                    .fullName("Support Agent")
                    .email("support@loomlearn.com")
                    .password(passwordEncoder.encode("support123"))
                    .role(UserRole.SUPPORT_AGENT)
                    .status(UserStatus.APPROVED)
                    .department("Support")
                    .bio("LoomLearn Customer Support Agent")
                    .build());
        }

        // 3. Seed Learners
        AcademicUser learner1 = seedUser("John Doe", "john.doe@loomlearn.com", UserRole.LEARNER, UserStatus.APPROVED, "Computer Science", "Aspiring software developer.");
        AcademicUser learner2 = seedUser("Jane Smith", "jane.smith@loomlearn.com", UserRole.LEARNER, UserStatus.APPROVED, "Mathematics", "Passionate math enthusiast.");
        AcademicUser learner3 = seedUser("David Miller", "david.miller@loomlearn.com", UserRole.LEARNER, UserStatus.APPROVED, "Physics", "Physics major exploring quantum mechanics.");

        // 4. Seed Mentors
        AcademicUser mentor1 = seedUser("Dr. Sarah Jenkins", "sarah.jenkins@loomlearn.com", UserRole.MENTOR, UserStatus.APPROVED, "Computer Science", "Specializes in Data Structures, Algorithms, and Distributed Systems. 5+ years experience.");
        AcademicUser mentor2 = seedUser("Prof. Alex Rivera", "alex.rivera@loomlearn.com", UserRole.MENTOR, UserStatus.APPROVED, "Mathematics", "Focuses on Linear Algebra, Calculus, and Applied Statistics.");
        AcademicUser mentor3 = seedUser("Elena Rostova", "elena.rostova@loomlearn.com", UserRole.MENTOR, UserStatus.APPROVED, "Physics", "Quantum Mechanics specialist helping students master core physics.");
        AcademicUser mentor4 = seedUser("Marcus Vance", "marcus.vance@loomlearn.com", UserRole.MENTOR, UserStatus.APPROVED, "Chemistry", "Organic Chemistry researcher helping learners understand reaction mechanisms.");

        // 5. Seed Tutoring Sessions
        LocalDateTime now = LocalDateTime.now();

        TutoringSession session1 = seedSession(
                "Advanced Data Structures & Algorithms",
                "Deep dive into graph traversals, binary search trees, and dynamic programming optimization.",
                now.plusDays(2).withHour(14).withMinute(0),
                now.plusDays(2).withHour(16).withMinute(0),
                15,
                3,
                SessionStatus.SCHEDULED,
                mentor1,
                cs
        );

        TutoringSession session2 = seedSession(
                "Linear Algebra & Matrix Transformations",
                "Understanding eigenvectors, eigenvalues, and matrix factorizations for data science.",
                now.plusDays(3).withHour(10).withMinute(30),
                now.plusDays(3).withHour(12).withMinute(0),
                20,
                2,
                SessionStatus.SCHEDULED,
                mentor2,
                math
        );

        TutoringSession session3 = seedSession(
                "Fundamentals of Quantum Physics",
                "Interactive session covering wave-particle duality and Schrodinger wave equations.",
                now.minusDays(1).withHour(15).withMinute(0),
                now.minusDays(1).withHour(17).withMinute(0),
                10,
                2,
                SessionStatus.COMPLETED,
                mentor3,
                physics
        );

        TutoringSession session4 = seedSession(
                "Organic Chemistry Reaction Mechanisms",
                "Comprehensive review of substitution, elimination, and addition organic chemistry reactions.",
                now.plusDays(5).withHour(11).withMinute(0),
                now.plusDays(5).withHour(13).withMinute(0),
                12,
                1,
                SessionStatus.SCHEDULED,
                mentor4,
                chemistry
        );

        // 6. Seed Session Enrollments
        seedEnrollment(learner1, session1, EnrollmentStatus.ENROLLED, false);
        seedEnrollment(learner2, session1, EnrollmentStatus.ENROLLED, false);
        seedEnrollment(learner3, session1, EnrollmentStatus.ENROLLED, false);

        seedEnrollment(learner1, session2, EnrollmentStatus.ENROLLED, false);
        seedEnrollment(learner2, session2, EnrollmentStatus.ENROLLED, false);

        seedEnrollment(learner1, session3, EnrollmentStatus.ATTENDED, true);
        seedEnrollment(learner3, session3, EnrollmentStatus.ATTENDED, true);

        seedEnrollment(learner2, session4, EnrollmentStatus.ENROLLED, false);

        // 7. Seed Mentor Feedback
        seedFeedback(5, "Dr. Sarah Jenkins provided exceptionally clear explanations for dynamic programming graphs!", learner1, mentor1, session1);
        seedFeedback(5, "Prof. Rivera made matrix transformations intuitive and easy to follow.", learner2, mentor2, session2);
        seedFeedback(4, "Great session on Quantum Physics. Very engaging presentation style.", learner3, mentor3, session3);
    }

    private StudySubject seedSubject(String name, String description) {
        return subjectRepository.findByName(name).orElseGet(() -> {
            StudySubject subject = StudySubject.builder()
                    .name(name)
                    .description(description)
                    .build();
            return subjectRepository.save(subject);
        });
    }

    private AcademicUser seedUser(String fullName, String email, UserRole role, UserStatus status, String department, String bio) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            AcademicUser user = AcademicUser.builder()
                    .fullName(fullName)
                    .email(email)
                    .password(passwordEncoder.encode("password123"))
                    .role(role)
                    .status(status)
                    .department(department)
                    .bio(bio)
                    .build();
            return userRepository.save(user);
        });
    }

    private TutoringSession seedSession(String title, String description, LocalDateTime startTime, LocalDateTime endTime,
                                        Integer maxCapacity, Integer currentEnrollment, SessionStatus status,
                                        AcademicUser mentor, StudySubject subject) {
        return sessionRepository.save(TutoringSession.builder()
                .title(title)
                .description(description)
                .startTime(startTime)
                .endTime(endTime)
                .maxCapacity(maxCapacity)
                .currentEnrollment(currentEnrollment)
                .status(status)
                .mentor(mentor)
                .subject(subject)
                .build());
    }

    private void seedEnrollment(AcademicUser learner, TutoringSession session, EnrollmentStatus status, boolean feedbackSubmitted) {
        if (!enrollmentRepository.existsByLearnerIdAndSessionId(learner.getId(), session.getId())) {
            enrollmentRepository.save(SessionEnrollment.builder()
                    .enrollmentDate(LocalDateTime.now())
                    .status(status)
                    .feedbackSubmitted(feedbackSubmitted)
                    .learner(learner)
                    .session(session)
                    .build());
        }
    }

    private void seedFeedback(Integer rating, String comment, AcademicUser learner, AcademicUser mentor, TutoringSession session) {
        feedbackRepository.save(MentorFeedback.builder()
                .rating(rating)
                .comment(comment)
                .learner(learner)
                .mentor(mentor)
                .session(session)
                .build());
    }
}
