package com.example.demo.service;

import com.example.demo.entity.MentorFeedback;
import com.example.demo.entity.AcademicUser;
import com.example.demo.entity.TutoringSession;
import com.example.demo.entity.SessionEnrollment;
import com.example.demo.repository.MentorFeedbackRepository;
import com.example.demo.repository.AcademicUserRepository;
import com.example.demo.repository.TutoringSessionRepository;
import com.example.demo.repository.SessionEnrollmentRepository;
import com.example.demo.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class FeedbackService {

    private final MentorFeedbackRepository feedbackRepository;
    private final AcademicUserRepository userRepository;
    private final TutoringSessionRepository sessionRepository;
    private final SessionEnrollmentRepository enrollmentRepository;

    public FeedbackService(MentorFeedbackRepository feedbackRepository,
                           AcademicUserRepository userRepository,
                           TutoringSessionRepository sessionRepository,
                           SessionEnrollmentRepository enrollmentRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Transactional(rollbackFor = Exception.class)
    public MentorFeedback submitFeedback(Long learnerId, Long sessionId, Integer rating, String comment) {
        AcademicUser learner = userRepository.findById(learnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Learner not found"));
        TutoringSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        List<SessionEnrollment> enrollments = enrollmentRepository.findByLearnerId(learnerId);
        SessionEnrollment enrollment = enrollments.stream()
                .filter(e -> e.getSession().getId().equals(sessionId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));

        enrollment.setFeedbackSubmitted(true);
        enrollmentRepository.save(enrollment);

        MentorFeedback feedback = MentorFeedback.builder()
                .rating(rating)
                .comment(comment)
                .learner(learner)
                .mentor(session.getMentor())
                .session(session)
                .build();

        return feedbackRepository.save(feedback);
    }

    public List<MentorFeedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }
}
