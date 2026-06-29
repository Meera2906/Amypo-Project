package com.example.demo.entity;

import com.example.demo.enums.EnrollmentStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "session_enrollments")
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

    public SessionEnrollment() {}

    public SessionEnrollment(Long id, LocalDateTime enrollmentDate, EnrollmentStatus status, boolean feedbackSubmitted, AcademicUser learner, TutoringSession session) {
        this.id = id;
        this.enrollmentDate = enrollmentDate;
        this.status = status;
        this.feedbackSubmitted = feedbackSubmitted;
        this.learner = learner;
        this.session = session;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(LocalDateTime enrollmentDate) { this.enrollmentDate = enrollmentDate; }

    public EnrollmentStatus getStatus() { return status; }
    public void setStatus(EnrollmentStatus status) { this.status = status; }

    public boolean isFeedbackSubmitted() { return feedbackSubmitted; }
    public void setFeedbackSubmitted(boolean feedbackSubmitted) { this.feedbackSubmitted = feedbackSubmitted; }

    public AcademicUser getLearner() { return learner; }
    public void setLearner(AcademicUser learner) { this.learner = learner; }

    public TutoringSession getSession() { return session; }
    public void setSession(TutoringSession session) { this.session = session; }

    public static SessionEnrollmentBuilder builder() {
        return new SessionEnrollmentBuilder();
    }

    public static class SessionEnrollmentBuilder {
        private Long id;
        private LocalDateTime enrollmentDate;
        private EnrollmentStatus status;
        private boolean feedbackSubmitted;
        private AcademicUser learner;
        private TutoringSession session;

        public SessionEnrollmentBuilder id(Long id) { this.id = id; return this; }
        public SessionEnrollmentBuilder enrollmentDate(LocalDateTime enrollmentDate) { this.enrollmentDate = enrollmentDate; return this; }
        public SessionEnrollmentBuilder status(EnrollmentStatus status) { this.status = status; return this; }
        public SessionEnrollmentBuilder feedbackSubmitted(boolean feedbackSubmitted) { this.feedbackSubmitted = feedbackSubmitted; return this; }
        public SessionEnrollmentBuilder learner(AcademicUser learner) { this.learner = learner; return this; }
        public SessionEnrollmentBuilder session(TutoringSession session) { this.session = session; return this; }

        public SessionEnrollment build() {
            return new SessionEnrollment(id, enrollmentDate, status, feedbackSubmitted, learner, session);
        }
    }
}
