package com.example.demo.repository;

import com.example.demo.entity.MentorFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MentorFeedbackRepository extends JpaRepository<MentorFeedback, Long> {
    void deleteBySessionId(Long sessionId);
    @Query("SELECT AVG(f.rating) FROM MentorFeedback f WHERE f.mentor.id = :mentorId")
    Double getAverageRatingByMentorId(@Param("mentorId") Long mentorId);
    
    long countByMentorId(Long mentorId);
}
