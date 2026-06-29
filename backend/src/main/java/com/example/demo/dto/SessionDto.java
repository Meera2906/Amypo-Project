package com.example.demo.dto;

import java.time.LocalDateTime;

public class SessionDto {
    private Long id;
    private String title;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer maxCapacity;
    private Integer currentEnrollment;
    private String mentorName;
    private String subjectName;

    public SessionDto() {}

    public SessionDto(Long id, String title, LocalDateTime startTime, LocalDateTime endTime, Integer maxCapacity, Integer currentEnrollment, String mentorName, String subjectName) {
        this.id = id;
        this.title = title;
        this.startTime = startTime;
        this.endTime = endTime;
        this.maxCapacity = maxCapacity;
        this.currentEnrollment = currentEnrollment;
        this.mentorName = mentorName;
        this.subjectName = subjectName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public Integer getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }

    public Integer getCurrentEnrollment() { return currentEnrollment; }
    public void setCurrentEnrollment(Integer currentEnrollment) { this.currentEnrollment = currentEnrollment; }

    public String getMentorName() { return mentorName; }
    public void setMentorName(String mentorName) { this.mentorName = mentorName; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public static SessionDtoBuilder builder() {
        return new SessionDtoBuilder();
    }

    public static class SessionDtoBuilder {
        private Long id;
        private String title;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Integer maxCapacity;
        private Integer currentEnrollment;
        private String mentorName;
        private String subjectName;

        public SessionDtoBuilder id(Long id) { this.id = id; return this; }
        public SessionDtoBuilder title(String title) { this.title = title; return this; }
        public SessionDtoBuilder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
        public SessionDtoBuilder endTime(LocalDateTime endTime) { this.endTime = endTime; return this; }
        public SessionDtoBuilder maxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; return this; }
        public SessionDtoBuilder currentEnrollment(Integer currentEnrollment) { this.currentEnrollment = currentEnrollment; return this; }
        public SessionDtoBuilder mentorName(String mentorName) { this.mentorName = mentorName; return this; }
        public SessionDtoBuilder subjectName(String subjectName) { this.subjectName = subjectName; return this; }

        public SessionDto build() {
            return new SessionDto(id, title, startTime, endTime, maxCapacity, currentEnrollment, mentorName, subjectName);
        }
    }
}
