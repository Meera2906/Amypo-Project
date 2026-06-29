package com.example.demo.service;

import com.example.demo.enums.UserRole;
import com.example.demo.enums.UserStatus;
import com.example.demo.enums.SessionStatus;
import com.example.demo.repository.AcademicUserRepository;
import com.example.demo.repository.TutoringSessionRepository;
import com.example.demo.repository.StudySubjectRepository;
import com.example.demo.repository.MentorFeedbackRepository;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class AdministrativeService {

    private final AcademicUserRepository userRepository;
    private final TutoringSessionRepository sessionRepository;
    private final StudySubjectRepository subjectRepository;
    private final MentorFeedbackRepository feedbackRepository;

    public AdministrativeService(AcademicUserRepository userRepository,
                                 TutoringSessionRepository sessionRepository,
                                 StudySubjectRepository subjectRepository,
                                 MentorFeedbackRepository feedbackRepository) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.subjectRepository = subjectRepository;
        this.feedbackRepository = feedbackRepository;
    }

    public Map<String, Object> getPlatformStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalLearners", userRepository.countByRole(UserRole.LEARNER));
        stats.put("totalMentors", userRepository.countByRole(UserRole.MENTOR));
        stats.put("totalAdmins", userRepository.countByRole(UserRole.ACADEMIC_ADMIN));
        stats.put("totalSupport", userRepository.countByRole(UserRole.SUPPORT_AGENT));
        
        stats.put("pendingMentors", userRepository.countByRoleAndStatus(UserRole.MENTOR, UserStatus.PENDING));

        stats.put("scheduledSessions", sessionRepository.countByStatus(SessionStatus.SCHEDULED));
        stats.put("activeSessions", sessionRepository.countByStatus(SessionStatus.ACTIVE));
        stats.put("completedSessions", sessionRepository.countByStatus(SessionStatus.COMPLETED));
        stats.put("cancelledSessions", sessionRepository.countByStatus(SessionStatus.CANCELLED));

        stats.put("subjectStats", subjectRepository.getSubjectEnrollmentStats());

        return stats;
    }

    public Map<String, Object> getMentorDashboardStats(Long mentorId) {
        Map<String, Object> stats = new HashMap<>();

        Double avgRating = feedbackRepository.getAverageRatingByMentorId(mentorId);
        stats.put("averageRating", avgRating != null ? avgRating : 0.0);
        stats.put("totalReviews", feedbackRepository.countByMentorId(mentorId));
        stats.put("totalSessions", sessionRepository.countByMentorId(mentorId));
        stats.put("scheduledSessions", sessionRepository.countByMentorIdAndStatus(mentorId, SessionStatus.SCHEDULED));
        stats.put("activeSessions", sessionRepository.countByMentorIdAndStatus(mentorId, SessionStatus.ACTIVE));
        stats.put("completedSessions", sessionRepository.countByMentorIdAndStatus(mentorId, SessionStatus.COMPLETED));

        return stats;
    }
}
