package com.example.demo.service;

import com.example.demo.entity.SessionEnrollment;
import com.example.demo.entity.TutoringSession;
import com.example.demo.entity.AcademicUser;
import com.example.demo.enums.EnrollmentStatus;
import com.example.demo.enums.SessionStatus;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.SessionEnrollmentRepository;
import com.example.demo.repository.TutoringSessionRepository;
import com.example.demo.repository.AcademicUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class EnrollmentWorkflowService {

    private final SessionEnrollmentRepository enrollmentRepository;
    private final TutoringSessionRepository sessionRepository;
    private final AcademicUserRepository userRepository;

    public EnrollmentWorkflowService(SessionEnrollmentRepository enrollmentRepository,
                                     TutoringSessionRepository sessionRepository,
                                     AcademicUserRepository userRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    @Transactional(rollbackFor = Exception.class)
    public void enrollLearner(Long learnerId, Long sessionId) {
        TutoringSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        
        AcademicUser learner = userRepository.findById(learnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Learner not found"));

        if (session.getStatus() != SessionStatus.SCHEDULED) {
            throw new BusinessValidationException("Can only enroll in SCHEDULED sessions");
        }

        if (session.getCurrentEnrollment() != null && session.getCurrentEnrollment() >= session.getMaxCapacity()) {
            throw new BusinessValidationException("Session capacity exceeded");
        }

        if (enrollmentRepository.existsByLearnerIdAndSessionId(learnerId, sessionId)) {
            throw new BusinessValidationException("Already enrolled in this session");
        }

        SessionEnrollment enrollment = SessionEnrollment.builder()
                .enrollmentDate(LocalDateTime.now())
                .status(EnrollmentStatus.ENROLLED)
                .feedbackSubmitted(false)
                .learner(learner)
                .session(session)
                .build();

        session.setCurrentEnrollment((session.getCurrentEnrollment() != null ? session.getCurrentEnrollment() : 0) + 1);
        sessionRepository.save(session);
        enrollmentRepository.save(enrollment);
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancelEnrollment(Long learnerId, Long sessionId) {
        SessionEnrollment enrollment = enrollmentRepository
                .findByLearnerIdAndSessionIdAndStatus(learnerId, sessionId, EnrollmentStatus.ENROLLED)
                .orElseThrow(() -> new ResourceNotFoundException("Active enrollment not found"));

        TutoringSession session = enrollment.getSession();
        enrollment.setStatus(EnrollmentStatus.DISCONTINUED);
        enrollmentRepository.save(enrollment);

        if (session.getCurrentEnrollment() != null && session.getCurrentEnrollment() > 0) {
            session.setCurrentEnrollment(session.getCurrentEnrollment() - 1);
            sessionRepository.save(session);
        }
    }
}
