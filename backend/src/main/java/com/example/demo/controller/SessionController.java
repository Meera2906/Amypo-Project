package com.example.demo.controller;

import com.example.demo.entity.TutoringSession;
import com.example.demo.enums.SessionStatus;
import com.example.demo.service.SessionManagementService;
import com.example.demo.exception.BusinessValidationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionManagementService sessionManagementService;

    public SessionController(SessionManagementService sessionManagementService) {
        this.sessionManagementService = sessionManagementService;
    }

    @GetMapping
    public ResponseEntity<Page<TutoringSession>> getAll(Pageable pageable) {
        Page<TutoringSession> sessions = sessionManagementService.getAvailableSessions(pageable);
        return ResponseEntity.ok(sessions);
    }

    @PostMapping
    public ResponseEntity<TutoringSession> create(@RequestBody TutoringSession session) {
        TutoringSession saved = sessionManagementService.createSession(session);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TutoringSession> update(@PathVariable Long id, @RequestBody TutoringSession sessionDetails) {
        TutoringSession updated = sessionManagementService.updateSession(id, sessionDetails);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<String> updateStatus(@PathVariable Long id, @RequestParam String status) {
        SessionStatus newStatus;
        try {
            newStatus = SessionStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessValidationException("Invalid status: " + status);
        }
        sessionManagementService.updateSessionStatus(id, newStatus);
        return ResponseEntity.ok("Status updated...");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> cancel(@PathVariable Long id) {
        sessionManagementService.cancelSession(id);
        return ResponseEntity.ok("Session cancelled");
    }
}
