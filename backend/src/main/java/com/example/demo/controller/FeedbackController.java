package com.example.demo.controller;

import com.example.demo.dto.FeedbackResponseDto;
import com.example.demo.entity.MentorFeedback;
import com.example.demo.service.FeedbackService;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @Transactional
    @PostMapping
    public ResponseEntity<FeedbackResponseDto> submitFeedback(
            @RequestParam Long learnerId,
            @RequestParam Long sessionId,
            @RequestParam Integer rating,
            @RequestParam String comment) {
        MentorFeedback feedback = feedbackService.submitFeedback(learnerId, sessionId, rating, comment);
        return ResponseEntity.ok(FeedbackResponseDto.from(feedback));
    }

    @Transactional
    @GetMapping
    public ResponseEntity<List<FeedbackResponseDto>> getAllFeedback() {
        List<MentorFeedback> feedbackList = feedbackService.getAllFeedback();
        List<FeedbackResponseDto> dtos = feedbackList.stream()
                .map(FeedbackResponseDto::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
