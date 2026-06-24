package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "study_subjects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudySubject {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column
    private String description;
}