package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "mentor_feedback")
public class MentorFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learner_id", nullable = false)
    private AcademicUser learner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false)
    private AcademicUser mentor;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "session_id", nullable = false)
    private TutoringSession session;

    public MentorFeedback() {}

    public MentorFeedback(Long id, Integer rating, String comment, AcademicUser learner, AcademicUser mentor, TutoringSession session) {
        this.id = id;
        this.rating = rating;
        this.comment = comment;
        this.learner = learner;
        this.mentor = mentor;
        this.session = session;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public AcademicUser getLearner() { return learner; }
    public void setLearner(AcademicUser learner) { this.learner = learner; }

    public AcademicUser getMentor() { return mentor; }
    public void setMentor(AcademicUser mentor) { this.mentor = mentor; }

    public TutoringSession getSession() { return session; }
    public void setSession(TutoringSession session) { this.session = session; }

    public static MentorFeedbackBuilder builder() {
        return new MentorFeedbackBuilder();
    }

    public static class MentorFeedbackBuilder {
        private Long id;
        private Integer rating;
        private String comment;
        private AcademicUser learner;
        private AcademicUser mentor;
        private TutoringSession session;

        public MentorFeedbackBuilder id(Long id) { this.id = id; return this; }
        public MentorFeedbackBuilder rating(Integer rating) { this.rating = rating; return this; }
        public MentorFeedbackBuilder comment(String comment) { this.comment = comment; return this; }
        public MentorFeedbackBuilder learner(AcademicUser learner) { this.learner = learner; return this; }
        public MentorFeedbackBuilder mentor(AcademicUser mentor) { this.mentor = mentor; return this; }
        public MentorFeedbackBuilder session(TutoringSession session) { this.session = session; return this; }

        public MentorFeedback build() {
            return new MentorFeedback(id, rating, comment, learner, mentor, session);
        }
    }
}
