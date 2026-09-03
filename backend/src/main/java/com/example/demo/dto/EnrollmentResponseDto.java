package com.example.demo.dto;

import com.example.demo.entity.SessionEnrollment;
import com.example.demo.enums.EnrollmentStatus;
import com.example.demo.enums.SessionStatus;

import java.time.LocalDateTime;

public class EnrollmentResponseDto {

    private Long id;
    private LocalDateTime enrollmentDate;
    private EnrollmentStatus status;
    private boolean feedbackSubmitted;

    // Learner fields
    private Long learnerId;
    private String learnerName;
    private String learnerEmail;

    // Session fields
    private Long sessionId;
    private String sessionTitle;
    private String sessionDescription;
    private SessionStatus sessionStatus;
    private LocalDateTime sessionStartTime;
    private LocalDateTime sessionEndTime;
    private Integer maxCapacity;
    private Integer currentEnrollment;

    // Mentor fields
    private Long mentorId;
    private String mentorName;
    private String mentorEmail;
    private String mentorDepartment;

    // Subject fields
    private Long subjectId;
    private String subjectName;

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
            dto.sessionId          = e.getSession().getId();
            dto.sessionTitle       = e.getSession().getTitle();
            dto.sessionDescription = e.getSession().getDescription();
            dto.sessionStatus      = e.getSession().getStatus();
            dto.sessionStartTime   = e.getSession().getStartTime();
            dto.sessionEndTime     = e.getSession().getEndTime();
            dto.maxCapacity        = e.getSession().getMaxCapacity();
            dto.currentEnrollment  = e.getSession().getCurrentEnrollment();

            if (e.getSession().getMentor() != null) {
                dto.mentorId         = e.getSession().getMentor().getId();
                dto.mentorName       = e.getSession().getMentor().getFullName();
                dto.mentorEmail      = e.getSession().getMentor().getEmail();
                dto.mentorDepartment = e.getSession().getMentor().getDepartment();
            }

            if (e.getSession().getSubject() != null) {
                dto.subjectId   = e.getSession().getSubject().getId();
                dto.subjectName = e.getSession().getSubject().getName();
            }
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

    public String getSessionDescription() { return sessionDescription; }
    public void setSessionDescription(String sessionDescription) { this.sessionDescription = sessionDescription; }

    public SessionStatus getSessionStatus() { return sessionStatus; }
    public void setSessionStatus(SessionStatus sessionStatus) { this.sessionStatus = sessionStatus; }

    public LocalDateTime getSessionStartTime() { return sessionStartTime; }
    public void setSessionStartTime(LocalDateTime sessionStartTime) { this.sessionStartTime = sessionStartTime; }

    public LocalDateTime getSessionEndTime() { return sessionEndTime; }
    public void setSessionEndTime(LocalDateTime sessionEndTime) { this.sessionEndTime = sessionEndTime; }

    public Integer getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }

    public Integer getCurrentEnrollment() { return currentEnrollment; }
    public void setCurrentEnrollment(Integer currentEnrollment) { this.currentEnrollment = currentEnrollment; }

    public Long getMentorId() { return mentorId; }
    public void setMentorId(Long mentorId) { this.mentorId = mentorId; }

    public String getMentorName() { return mentorName; }
    public void setMentorName(String mentorName) { this.mentorName = mentorName; }

    public String getMentorEmail() { return mentorEmail; }
    public void setMentorEmail(String mentorEmail) { this.mentorEmail = mentorEmail; }

    public String getMentorDepartment() { return mentorDepartment; }
    public void setMentorDepartment(String mentorDepartment) { this.mentorDepartment = mentorDepartment; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
}
