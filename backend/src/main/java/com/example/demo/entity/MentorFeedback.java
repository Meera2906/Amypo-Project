package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mentor_feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
}
