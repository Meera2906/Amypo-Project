package com.example.demo.repository;

import com.example.demo.entity.SessionEnrollment;
import com.example.demo.enums.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionEnrollmentRepository extends JpaRepository<SessionEnrollment, Long> {
    void deleteBySessionId(Long sessionId);
    List<SessionEnrollment> findByLearnerId(Long learnerId);
    boolean existsByLearnerIdAndSessionId(Long learnerId, Long sessionId);
    Optional<SessionEnrollment> findByLearnerIdAndSessionIdAndStatus(Long learnerId, Long sessionId, EnrollmentStatus status);
}
