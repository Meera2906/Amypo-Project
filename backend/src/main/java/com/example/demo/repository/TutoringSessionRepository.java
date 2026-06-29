package com.example.demo.repository;

import com.example.demo.entity.TutoringSession;
import com.example.demo.enums.SessionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Collection;

@Repository
public interface TutoringSessionRepository extends JpaRepository<TutoringSession, Long> {
    Page<TutoringSession> findByStatusIn(Collection<SessionStatus> statuses, Pageable pageable);
    long countByStatus(SessionStatus status);
    long countByMentorId(Long mentorId);
    long countByMentorIdAndStatus(Long mentorId, SessionStatus status);
}
