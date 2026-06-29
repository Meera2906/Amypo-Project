package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "study_subjects")
public class StudySubject {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column
    private String description;

    public StudySubject() {}

    public StudySubject(Long id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public static StudySubjectBuilder builder() {
        return new StudySubjectBuilder();
    }

    public static class StudySubjectBuilder {
        private Long id;
        private String name;
        private String description;

        public StudySubjectBuilder id(Long id) { this.id = id; return this; }
        public StudySubjectBuilder name(String name) { this.name = name; return this; }
        public StudySubjectBuilder description(String description) { this.description = description; return this; }

        public StudySubject build() {
            return new StudySubject(id, name, description);
        }
    }
}