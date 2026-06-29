package com.example.demo.service;

import com.example.demo.entity.MentorFeedback;
import com.example.demo.entity.AcademicUser;
import com.example.demo.entity.TutoringSession;
import com.example.demo.repository.MentorFeedbackRepository;
import com.example.demo.repository.AcademicUserRepository;
import com.example.demo.repository.TutoringSessionRepository;
import com.example.demo.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class FeedbackModerationService {

    private final MentorFeedbackRepository feedbackRepository;
    private final AcademicUserRepository userRepository;
    private final TutoringSessionRepository sessionRepository;

    public FeedbackModerationService(MentorFeedbackRepository feedbackRepository,
                                     AcademicUserRepository userRepository,
                                     TutoringSessionRepository sessionRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
    }

    public MentorFeedback submitFeedback(Long learnerId, Long sessionId, Integer rating, String comment) {
        AcademicUser learner = userRepository.findById(learnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Learner not found"));
        TutoringSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        MentorFeedback feedback = MentorFeedback.builder()
                .rating(rating)
                .comment(comment)
                .learner(learner)
                .mentor(session.getMentor())
                .session(session)
                .build();

        return feedbackRepository.save(feedback);
    }

    public Map<String, Object> getMentorPerformance(Long mentorId) {
        Map<String, Object> performance = new HashMap<>();
        Double avgRating = feedbackRepository.getAverageRatingByMentorId(mentorId);
        performance.put("averageRating", avgRating != null ? avgRating : 0.0);
        performance.put("totalReviews", feedbackRepository.countByMentorId(mentorId));
        return performance;
    }
}
