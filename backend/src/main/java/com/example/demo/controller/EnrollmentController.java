package com.example.demo.controller;

import com.example.demo.entity.SessionEnrollment;
import com.example.demo.service.EnrollmentWorkflowService;
import com.example.demo.repository.SessionEnrollmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentWorkflowService enrollmentWorkflowService;
    private final SessionEnrollmentRepository sessionEnrollmentRepository;

    public EnrollmentController(EnrollmentWorkflowService enrollmentWorkflowService,
                                SessionEnrollmentRepository sessionEnrollmentRepository) {
        this.enrollmentWorkflowService = enrollmentWorkflowService;
        this.sessionEnrollmentRepository = sessionEnrollmentRepository;
    }

    @GetMapping("/my")
    public ResponseEntity<List<SessionEnrollment>> getMyEnrollments(@RequestParam Long learnerId) {
        List<SessionEnrollment> enrollments = sessionEnrollmentRepository.findByLearnerId(learnerId);
        return ResponseEntity.ok(enrollments);
    }

    @PostMapping("/enroll")
    public ResponseEntity<String> enroll(@RequestParam Long learnerId, @RequestParam Long sessionId) {
        enrollmentWorkflowService.enrollLearner(learnerId, sessionId);
        return ResponseEntity.ok("Enrolled");
    }

    @DeleteMapping("/cancel")
    public ResponseEntity<String> cancelEnrollment(@RequestParam Long learnerId, @RequestParam Long sessionId) {
        enrollmentWorkflowService.cancelEnrollment(learnerId, sessionId);
        return ResponseEntity.ok("Enrollment cancelled");
    }
}
