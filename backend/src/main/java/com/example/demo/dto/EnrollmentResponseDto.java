package com.example.demo.dto;

import com.example.demo.entity.SessionEnrollment;
import com.example.demo.enums.EnrollmentStatus;

import java.time.LocalDateTime;

public class EnrollmentResponseDto {

    private Long id;
    private LocalDateTime enrollmentDate;
    private EnrollmentStatus status;
    private boolean feedbackSubmitted;

    // Learner fields (flattened to avoid Hibernate proxy issues)
    private Long learnerId;
    private String learnerName;
    private String learnerEmail;

    // Session fields (flattened)
    private Long sessionId;
    private String sessionTitle;
    private LocalDateTime sessionStartTime;
    private LocalDateTime sessionEndTime;

    public EnrollmentResponseDto() {}

    /**
     * Convenience factory — must be called while the JPA session/transaction is still open
     * (i.e. inside a @Transactional service method) so that lazy associations can be read.
     */
    public static EnrollmentResponseDto from(SessionEnrollment e) {
        EnrollmentResponseDto dto = new EnrollmentResponseDto();
        dto.id                = e.getId();
        dto.enrollmentDate    = e.getEnrollmentDate();
        dto.status            = e.getStatus();
        dto.feedbackSubmitted = e.isFeedbackSubmitted();

        if (e.getLearner() != null) {
            dto.learnerId    = e.getLearner().getId();
            dto.learnerName  = e.getLearner().getFullName();
            dto.learnerEmail = e.getLearner().getEmail();
        }

        if (e.getSession() != null) {
            dto.sessionId        = e.getSession().getId();
            dto.sessionTitle     = e.getSession().getTitle();
            dto.sessionStartTime = e.getSession().getStartTime();
            dto.sessionEndTime   = e.getSession().getEndTime();
        }

        return dto;
    }

    // ── getters & setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(LocalDateTime enrollmentDate) { this.enrollmentDate = enrollmentDate; }

    public EnrollmentStatus getStatus() { return status; }
    public void setStatus(EnrollmentStatus status) { this.status = status; }

    public boolean isFeedbackSubmitted() { return feedbackSubmitted; }
    public void setFeedbackSubmitted(boolean feedbackSubmitted) { this.feedbackSubmitted = feedbackSubmitted; }

    public Long getLearnerId() { return learnerId; }
    public void setLearnerId(Long learnerId) { this.learnerId = learnerId; }

    public String getLearnerName() { return learnerName; }
    public void setLearnerName(String learnerName) { this.learnerName = learnerName; }

    public String getLearnerEmail() { return learnerEmail; }
    public void setLearnerEmail(String learnerEmail) { this.learnerEmail = learnerEmail; }

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public String getSessionTitle() { return sessionTitle; }
    public void setSessionTitle(String sessionTitle) { this.sessionTitle = sessionTitle; }

    public LocalDateTime getSessionStartTime() { return sessionStartTime; }
    public void setSessionStartTime(LocalDateTime sessionStartTime) { this.sessionStartTime = sessionStartTime; }

    public LocalDateTime getSessionEndTime() { return sessionEndTime; }
    public void setSessionEndTime(LocalDateTime sessionEndTime) { this.sessionEndTime = sessionEndTime; }
}
