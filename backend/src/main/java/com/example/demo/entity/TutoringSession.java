package com.example.demo.entity;

import com.example.demo.enums.SessionStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tutoring_sessions")
public class TutoringSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "max_capacity", nullable = false)
    private Integer maxCapacity;

    @Column(name = "current_enrollment")
    private Integer currentEnrollment;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SessionStatus status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mentor_id", nullable = false)
    private AcademicUser mentor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private StudySubject subject;

    public TutoringSession() {}

    public TutoringSession(Long id, String title, String description, LocalDateTime startTime, LocalDateTime endTime, Integer maxCapacity, Integer currentEnrollment, SessionStatus status, AcademicUser mentor, StudySubject subject) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.startTime = startTime;
        this.endTime = endTime;
        this.maxCapacity = maxCapacity;
        this.currentEnrollment = currentEnrollment;
        this.status = status;
        this.mentor = mentor;
        this.subject = subject;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public Integer getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }

    public Integer getCurrentEnrollment() { return currentEnrollment; }
    public void setCurrentEnrollment(Integer currentEnrollment) { this.currentEnrollment = currentEnrollment; }

    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }

    public AcademicUser getMentor() { return mentor; }
    public void setMentor(AcademicUser mentor) { this.mentor = mentor; }

    public StudySubject getSubject() { return subject; }
    public void setSubject(StudySubject subject) { this.subject = subject; }

    public static TutoringSessionBuilder builder() {
        return new TutoringSessionBuilder();
    }

    public static class TutoringSessionBuilder {
        private Long id;
        private String title;
        private String description;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Integer maxCapacity;
        private Integer currentEnrollment;
        private SessionStatus status;
        private AcademicUser mentor;
        private StudySubject subject;

        public TutoringSessionBuilder id(Long id) { this.id = id; return this; }
        public TutoringSessionBuilder title(String title) { this.title = title; return this; }
        public TutoringSessionBuilder description(String description) { this.description = description; return this; }
        public TutoringSessionBuilder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
        public TutoringSessionBuilder endTime(LocalDateTime endTime) { this.endTime = endTime; return this; }
        public TutoringSessionBuilder maxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; return this; }
        public TutoringSessionBuilder currentEnrollment(Integer currentEnrollment) { this.currentEnrollment = currentEnrollment; return this; }
        public TutoringSessionBuilder status(SessionStatus status) { this.status = status; return this; }
        public TutoringSessionBuilder mentor(AcademicUser mentor) { this.mentor = mentor; return this; }
        public TutoringSessionBuilder subject(StudySubject subject) { this.subject = subject; return this; }

        public TutoringSession build() {
            return new TutoringSession(id, title, description, startTime, endTime, maxCapacity, currentEnrollment, status, mentor, subject);
        }
    }
}
