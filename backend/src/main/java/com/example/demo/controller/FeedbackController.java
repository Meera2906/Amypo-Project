package com.example.demo.controller;

import com.example.demo.entity.MentorFeedback;
import com.example.demo.service.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public ResponseEntity<MentorFeedback> submitFeedback(
            @RequestParam Long learnerId,
            @RequestParam Long sessionId,
            @RequestParam Integer rating,
            @RequestParam String comment) {
        MentorFeedback feedback = feedbackService.submitFeedback(learnerId, sessionId, rating, comment);
        return ResponseEntity.ok(feedback);
    }

    @GetMapping
    public ResponseEntity<List<MentorFeedback>> getAllFeedback() {
        List<MentorFeedback> feedbackList = feedbackService.getAllFeedback();
        return ResponseEntity.ok(feedbackList);
    }
}
