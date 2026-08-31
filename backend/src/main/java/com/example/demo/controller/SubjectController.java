package com.example.demo.controller;

import com.example.demo.entity.StudySubject;
import com.example.demo.entity.TutoringSession;
import com.example.demo.repository.StudySubjectRepository;
import com.example.demo.repository.TutoringSessionRepository;
import com.example.demo.repository.SessionEnrollmentRepository;
import com.example.demo.repository.MentorFeedbackRepository;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.BusinessValidationException;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final StudySubjectRepository subjectRepository;
    private final TutoringSessionRepository sessionRepository;
    private final SessionEnrollmentRepository enrollmentRepository;
    private final MentorFeedbackRepository feedbackRepository;

    public SubjectController(StudySubjectRepository subjectRepository,
                             TutoringSessionRepository sessionRepository,
                             SessionEnrollmentRepository enrollmentRepository,
                             MentorFeedbackRepository feedbackRepository) {
        this.subjectRepository = subjectRepository;
        this.sessionRepository = sessionRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.feedbackRepository = feedbackRepository;
    }

    @GetMapping
    public ResponseEntity<List<StudySubject>> listAll() {
        List<StudySubject> subjects = subjectRepository.findAll();
        return ResponseEntity.ok(subjects);
    }

    @PostMapping
    public ResponseEntity<StudySubject> create(@RequestBody StudySubject subject) {
        if (subject.getName() == null || subject.getName().trim().isEmpty()) {
            throw new BusinessValidationException("Subject name is required");
        }
        if (subjectRepository.findByName(subject.getName()).isPresent()) {
            throw new BusinessValidationException("Subject already exists");
        }
        StudySubject saved = subjectRepository.save(subject);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudySubject> update(@PathVariable Long id, @RequestBody StudySubject subjectDetails) {
        StudySubject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        if (subjectDetails.getName() == null || subjectDetails.getName().trim().isEmpty()) {
            throw new BusinessValidationException("Subject name is required");
        }
        subject.setName(subjectDetails.getName());
        subject.setDescription(subjectDetails.getDescription());
        StudySubject updated = subjectRepository.save(subject);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<String> delete(@PathVariable Long id) {
        StudySubject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        List<TutoringSession> sessions = sessionRepository.findBySubjectId(id);
        for (TutoringSession session : sessions) {
            feedbackRepository.deleteBySessionId(session.getId());
            enrollmentRepository.deleteBySessionId(session.getId());
            sessionRepository.delete(session);
        }

        subjectRepository.delete(subject);
        return ResponseEntity.ok("Subject deleted");
    }
}
