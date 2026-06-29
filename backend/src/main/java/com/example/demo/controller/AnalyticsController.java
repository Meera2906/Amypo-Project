package com.example.demo.controller;

import com.example.demo.service.AdministrativeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AdministrativeService administrativeService;

    public AnalyticsController(AdministrativeService administrativeService) {
        this.administrativeService = administrativeService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(administrativeService.getPlatformStats());
    }

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<Map<String, Object>> getMentorStats(@PathVariable Long mentorId) {
        return ResponseEntity.ok(administrativeService.getMentorDashboardStats(mentorId));
    }
}
