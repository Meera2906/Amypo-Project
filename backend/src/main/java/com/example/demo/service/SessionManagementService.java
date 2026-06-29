package com.example.demo.service;

import com.example.demo.entity.TutoringSession;
import com.example.demo.entity.AcademicUser;
import com.example.demo.entity.StudySubject;
import com.example.demo.enums.SessionStatus;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.TutoringSessionRepository;
import com.example.demo.repository.AcademicUserRepository;
import com.example.demo.repository.StudySubjectRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Arrays;

@Service
public class SessionManagementService {

    private final TutoringSessionRepository sessionRepository;
    private final AcademicUserRepository userRepository;
    private final StudySubjectRepository subjectRepository;

    public SessionManagementService(TutoringSessionRepository sessionRepository,
                                    AcademicUserRepository userRepository,
                                    StudySubjectRepository subjectRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
    }

    public TutoringSession createSession(TutoringSession session) {
        if (session.getTitle() == null || session.getTitle().trim().isEmpty()) {
            throw new BusinessValidationException("Title cannot be empty");
        }
        if (session.getStartTime() == null || session.getStartTime().isBefore(LocalDateTime.now())) {
            throw new BusinessValidationException("Start time must be in the future");
        }
        if (session.getEndTime() == null || session.getEndTime().isBefore(session.getStartTime())) {
            throw new BusinessValidationException("End time must be after start time");
        }

        // Resolve mentor
        if (session.getMentor() == null || session.getMentor().getId() == null) {
            throw new BusinessValidationException("Mentor is required");
        }
        AcademicUser mentor = userRepository.findById(session.getMentor().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found"));
        session.setMentor(mentor);

        // Resolve subject
        if (session.getSubject() == null || session.getSubject().getId() == null) {
            throw new BusinessValidationException("Subject is required");
        }
        StudySubject subject = subjectRepository.findById(session.getSubject().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        session.setSubject(subject);

        session.setCurrentEnrollment(0);
        session.setStatus(SessionStatus.SCHEDULED);

        return sessionRepository.save(session);
    }

    public TutoringSession updateSession(Long id, TutoringSession sessionDetails) {
        TutoringSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (sessionDetails.getTitle() == null || sessionDetails.getTitle().trim().isEmpty()) {
            throw new BusinessValidationException("Title cannot be empty");
        }
        session.setTitle(sessionDetails.getTitle());
        session.setDescription(sessionDetails.getDescription());
        session.setStartTime(sessionDetails.getStartTime());
        session.setEndTime(sessionDetails.getEndTime());
        session.setMaxCapacity(sessionDetails.getMaxCapacity());

        if (sessionDetails.getSubject() != null && sessionDetails.getSubject().getId() != null) {
            StudySubject subject = subjectRepository.findById(sessionDetails.getSubject().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
            session.setSubject(subject);
        }

        return sessionRepository.save(session);
    }

    public void cancelSession(Long id) {
        TutoringSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        session.setStatus(SessionStatus.CANCELLED);
        sessionRepository.save(session);
    }

    public void updateSessionStatus(Long id, SessionStatus status) {
        TutoringSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        SessionStatus currentStatus = session.getStatus();
        if (currentStatus == SessionStatus.COMPLETED || currentStatus == SessionStatus.CANCELLED) {
            throw new BusinessValidationException("Cannot change status of completed or cancelled session");
        }

        session.setStatus(status);
        sessionRepository.save(session);
    }

    public Page<TutoringSession> getAvailableSessions(Pageable pageable) {
        return sessionRepository.findByStatusIn(
                Arrays.asList(SessionStatus.SCHEDULED, SessionStatus.ACTIVE, SessionStatus.COMPLETED),
                pageable
        );
    }
}
