package com.example.demo.entity;

import com.example.demo.enums.EnrollmentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "session_enrollments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "enrollment_date", nullable = false)
    private LocalDateTime enrollmentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private EnrollmentStatus status;

    @Column(name = "feedback_submitted", nullable = false)
    private boolean feedbackSubmitted;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learner_id", nullable = false)
    private AcademicUser learner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private TutoringSession session;
}
