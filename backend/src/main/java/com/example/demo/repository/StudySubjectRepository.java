package com.example.demo.repository;

import com.example.demo.entity.StudySubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface StudySubjectRepository extends JpaRepository<StudySubject, Long> {
    Optional<StudySubject> findByName(String name);

    @Query("SELECT s.name AS name, COUNT(e.id) AS count FROM SessionEnrollment e JOIN e.session ts JOIN ts.subject s GROUP BY s.name")
    List<Map<String, Object>> getSubjectEnrollmentStats();
}
