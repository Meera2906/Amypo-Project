package com.example.demo.dto;

import com.example.demo.entity.MentorFeedback;

public class FeedbackResponseDto {

    private Long id;
    private Integer rating;
    private String comment;

    // Learner
    private Long learnerId;
    private String learnerName;
    private String learnerEmail;

    // Mentor
    private Long mentorId;
    private String mentorName;
    private String mentorEmail;

    // Session
    private Long sessionId;
    private String sessionTitle;

    public FeedbackResponseDto() {}

    /**
     * Call inside an open JPA transaction so lazy associations can be resolved.
     */
    public static FeedbackResponseDto from(MentorFeedback f) {
        FeedbackResponseDto dto = new FeedbackResponseDto();
        dto.id      = f.getId();
        dto.rating  = f.getRating();
        dto.comment = f.getComment();

        if (f.getLearner() != null) {
            dto.learnerId    = f.getLearner().getId();
            dto.learnerName  = f.getLearner().getFullName();
            dto.learnerEmail = f.getLearner().getEmail();
        }

        if (f.getMentor() != null) {
            dto.mentorId    = f.getMentor().getId();
            dto.mentorName  = f.getMentor().getFullName();
            dto.mentorEmail = f.getMentor().getEmail();
        }

        if (f.getSession() != null) {
            dto.sessionId    = f.getSession().getId();
            dto.sessionTitle = f.getSession().getTitle();
        }

        return dto;
    }

    // ── getters & setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public Long getLearnerId() { return learnerId; }
    public void setLearnerId(Long learnerId) { this.learnerId = learnerId; }

    public String getLearnerName() { return learnerName; }
    public void setLearnerName(String learnerName) { this.learnerName = learnerName; }

    public String getLearnerEmail() { return learnerEmail; }
    public void setLearnerEmail(String learnerEmail) { this.learnerEmail = learnerEmail; }

    public Long getMentorId() { return mentorId; }
    public void setMentorId(Long mentorId) { this.mentorId = mentorId; }

    public String getMentorName() { return mentorName; }
    public void setMentorName(String mentorName) { this.mentorName = mentorName; }

    public String getMentorEmail() { return mentorEmail; }
    public void setMentorEmail(String mentorEmail) { this.mentorEmail = mentorEmail; }

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public String getSessionTitle() { return sessionTitle; }
    public void setSessionTitle(String sessionTitle) { this.sessionTitle = sessionTitle; }
}
