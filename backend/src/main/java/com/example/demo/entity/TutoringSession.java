package com.example.demo.entity;

import com.example.demo.enums.SessionStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tutoring_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
}
