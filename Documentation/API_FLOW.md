# API_FLOW

This document shows the step-by-step request flow for every API endpoint.

---

## How to Read This Document

Each API flow follows this pattern:

```
Client → Controller → Service → Repository → Database → Response
```

---

## 1. POST /api/auth/login

**Purpose:** Authenticate a user and get a JWT token.

### Flow

```
Client
  │
  │ 1. POST /api/auth/login
  │    Body: { "email": "...", "password": "..." }
  │
  ▼
AuthController.login(@RequestBody AuthRequestDto request)
  │
  │ 2. Calls authService.login(request)
  ▼
AcademicAuthService.login(AuthRequestDto dto)
  │
  │ 3. Calls userRepository.findByEmail(dto.getEmail())
  ▼
AcademicUserRepository.findByEmail()
  │
  │ 4. SQL: SELECT * FROM academic_users WHERE email = ?
  ▼
MySQL Database
  │
  │ 5. Returns user (or empty)
  ▼
AcademicAuthService.login()
  │
  │ 6. Checks password: passwordEncoder.matches(dto.getPassword(), user.getPassword())
  │ 7. Checks status: user.getStatus() != PENDING && != BLOCKED
  │ 8. Generates token: jwtUtil.generateToken(user.getEmail())
  ▼
Returns AuthResponseDto { id, token, fullName, email, role }
  │
  │ 9. HTTP 200 OK + JSON
  ▼
Client (receives JWT token)
```

### Security

- **Public access** (no authentication required).
- Password is verified using BCrypt.
- If password is wrong → HTTP 400 "Invalid Credentials."
- If user not found → HTTP 404 "User not found"
- If account is PENDING/BLOCKED → HTTP 400 "Account is pending or blocked"

---

## 2. POST /api/auth/register

**Purpose:** Register a new user account.

### Flow

```
Client
  │
  │ 1. POST /api/auth/register
  │    Body: { "fullName", "email", "password", "role", "department", "bio" }
  │
  ▼
AuthController.register(@RequestBody RegisterDto request)
  │
  │ 2. Calls authService.register(request)
  ▼
AcademicAuthService.register(RegisterDto dto)
  │
  │ 3. Calls userRepository.existsByEmail(dto.getEmail())
  ▼
AcademicUserRepository.existsByEmail()
  │
  │ 4. SQL: SELECT COUNT(*) > 0 FROM academic_users WHERE email = ?
  ▼
MySQL Database
  │
  │ 5. If email exists → throw BusinessValidationException("Email already exists") → HTTP 400
  │ 6. If email is new → continue
  ▼
AcademicAuthService.register()
  │
  │ 7. Encodes password: passwordEncoder.encode(dto.getPassword())
  │ 8. Sets status: PENDING for MENTOR, APPROVED for others
  │ 9. Builds AcademicUser using builder pattern
  │ 10. Calls userRepository.save(user)
  ▼
AcademicUserRepository.save()
  │
  │ 11. SQL: INSERT INTO academic_users (...) VALUES (...)
  ▼
MySQL Database
  │
  │ 12. Returns saved user
  ▼
AcademicAuthService.register()
  │
  │ 13. Generates token: jwtUtil.generateToken(user.getEmail())
  │ 14. Returns AuthResponseDto
  ▼
Client (receives JWT token + user details)
```

### Security

- **Public access** (no authentication required).
- Password is hashed with BCrypt before saving.
- Mentors get PENDING status (need admin approval).
- Other roles get APPROVED status automatically.

---

## 3. GET /api/sessions

**Purpose:** List all available tutoring sessions (paginated).

### Flow

```
Client
  │
  │ 1. GET /api/sessions?page=0&size=10
  │    Header: Authorization: Bearer <jwt>
  │
  ▼
JwtAuthenticationFilter (runs first)
  │
  │ 2. Extracts token from Authorization header
  │ 3. Validates token: jwtUtil.validateToken(token)
  │ 4. Extracts email: jwtUtil.extractEmail(token)
  │ 5. Looks up user: userRepository.findByEmail(email)
  │ 6. Checks status: user.getStatus() == APPROVED
  │ 7. Creates authentication with roles
  │ 8. Stores in SecurityContextHolder
  ▼
Spring Security (authorization check)
  │
  │ 9. Checks: anyRequest().authenticated() → user is authenticated → allow
  ▼
SessionController.getAll(Pageable pageable)
  │
  │ 10. Calls sessionManagementService.getAvailableSessions(pageable)
  ▼
SessionManagementService.getAvailableSessions()
  │
  │ 11. Calls sessionRepository.findByStatusIn(
  │        [SCHEDULED, ACTIVE, COMPLETED], pageable)
  ▼
TutoringSessionRepository.findByStatusIn()
  │
  │ 12. SQL: SELECT * FROM tutoring_sessions
  │        WHERE status IN ('SCHEDULED', 'ACTIVE', 'COMPLETED')
  │        LIMIT ? OFFSET ?
  ▼
MySQL Database
  │
  │ 13. Returns paginated list of sessions
  ▼
SessionController.getAll()
  │
  │ 14. Returns ResponseEntity.ok(sessions)
  │ 15. Spring converts to JSON (includes mentor and subject objects)
  ▼
Client (receives JSON array of sessions)
```

### Security

- **Requires authentication** (any logged-in user).
- The JWT filter validates the token before the request reaches the controller.

---

## 4. POST /api/sessions

**Purpose:** Create a new tutoring session.

### Flow

```
Client
  │
  │ 1. POST /api/sessions
  │    Header: Authorization: Bearer <jwt>
  │    Body: { "title", "description", "startTime", "endTime",
  │            "maxCapacity", "mentor": { "id": 2 }, "subject": { "id": 1 } }
  │
  ▼
JwtAuthenticationFilter
  │
  │ 2. Validates JWT token, sets authentication
  ▼
Spring Security
  │
  │ 3. Checks: anyRequest().authenticated() → allow
  ▼
SessionController.create(@RequestBody TutoringSession session)
  │
  │ 4. Calls sessionManagementService.createSession(session)
  ▼
SessionManagementService.createSession()
  │
  │ 5. Validates: title not empty, start time in future, end time after start
  │ 6. Resolves mentor: userRepository.findById(session.getMentor().getId())
  │ 7. Resolves subject: subjectRepository.findById(session.getSubject().getId())
  │ 8. Sets currentEnrollment = 0, status = SCHEDULED
  │ 9. Calls sessionRepository.save(session)
  ▼
TutoringSessionRepository.save()
  │
  │ 10. SQL: INSERT INTO tutoring_sessions (...) VALUES (...)
  ▼
MySQL Database
  │
  │ 11. Returns saved session
  ▼
SessionController.create()
  │
  │ 12. Returns ResponseEntity.ok(saved)
  ▼
Client (receives created session as JSON)
```

### Validation Errors

- Title empty → HTTP 400 "Title cannot be empty"
- Start time in past → HTTP 400 "Start time must be in the future"
- End time before start → HTTP 400 "End time must be after start time"
- Mentor not found → HTTP 404 "Mentor not found"
- Subject not found → HTTP 404 "Subject not found"

---

## 5. POST /api/enrollments/enroll

**Purpose:** Enroll a learner in a tutoring session.

### Flow

```
Client
  │
  │ 1. POST /api/enrollments/enroll?learnerId=1&sessionId=1
  │    Header: Authorization: Bearer <jwt>
  │
  ▼
JwtAuthenticationFilter
  │
  │ 2. Validates JWT, sets authentication
  ▼
Spring Security
  │
  │ 3. Checks: /api/enrollments/** → hasRole("LEARNER") → allow
  ▼
EnrollmentController.enroll(learnerId, sessionId)
  │
  │ 4. Calls enrollmentWorkflowService.enrollLearner(learnerId, sessionId)
  ▼
EnrollmentWorkflowService.enrollLearner()  [@Transactional]
  │
  │ 5. Calls sessionRepository.findById(sessionId)
  │    → If not found: ResourceNotFoundException("Session not found") → HTTP 404
  │ 6. Calls userRepository.findById(learnerId)
  │    → If not found: ResourceNotFoundException("Learner not found") → HTTP 404
  │ 7. Checks: session.getStatus() == SCHEDULED
  │    → If not: BusinessValidationException("Can only enroll in SCHEDULED sessions") → HTTP 400
  │ 8. Checks: session.getCurrentEnrollment() < session.getMaxCapacity()
  │    → If exceeded: BusinessValidationException("Session capacity exceeded") → HTTP 400
  │ 9. Checks: !enrollmentRepository.existsByLearnerIdAndSessionId(learnerId, sessionId)
  │    → If exists: BusinessValidationException("Already enrolled in this session") → HTTP 400
  │ 10. Creates SessionEnrollment (status=ENROLLED, feedbackSubmitted=false)
  │ 11. Increments session.currentEnrollment
  │ 12. Calls sessionRepository.save(session)  [UPDATE]
  │ 13. Calls enrollmentRepository.save(enrollment)  [INSERT]
  │
  │    *** All of steps 5-13 are in one transaction ***
  │    If any step fails, ALL changes are rolled back
  ▼
MySQL Database
  │
  │ 14. Session updated (current_enrollment incremented)
  │ 15. Enrollment inserted
  ▼
EnrollmentController.enroll()
  │
  │ 16. Returns ResponseEntity.ok("Enrolled")
  ▼
Client (receives "Enrolled")
```

### Security

- **Requires LEARNER role.**
- **Transactional:** Both the session update and enrollment insert happen in one transaction. If one fails, both are rolled back.

---

## 6. DELETE /api/enrollments/cancel

**Purpose:** Cancel a learner's enrollment in a session.

### Flow

```
Client
  │
  │ 1. DELETE /api/enrollments/cancel?learnerId=1&sessionId=1
  │    Header: Authorization: Bearer <jwt>
  │
  ▼
JwtAuthenticationFilter → validates token
  ▼
Spring Security → checks LEARNER role
  ▼
EnrollmentController.cancelEnrollment(learnerId, sessionId)
  │
  │ 2. Calls enrollmentWorkflowService.cancelEnrollment(learnerId, sessionId)
  ▼
EnrollmentWorkflowService.cancelEnrollment()  [@Transactional]
  │
  │ 3. Calls enrollmentRepository.findByLearnerIdAndSessionIdAndStatus(
  │    learnerId, sessionId, EnrollmentStatus.ENROLLED)
  │    → If not found: ResourceNotFoundException("Active enrollment not found") → HTTP 404
  │ 4. Sets enrollment.status = DISCONTINUED
  │ 5. Calls enrollmentRepository.save(enrollment)  [UPDATE]
  │ 6. Decrements session.currentEnrollment
  │ 7. Calls sessionRepository.save(session)  [UPDATE]
  ▼
MySQL Database
  │
  │ 8. Enrollment updated (status=DISCONTINUED)
  │ 9. Session updated (current_enrollment decremented)
  ▼
EnrollmentController.cancelEnrollment()
  │
  │ 10. Returns ResponseEntity.ok("Enrollment cancelled")
  ▼
Client
```

### Security

- **Requires LEARNER role.**
- **Transactional:** Both the enrollment update and session update happen in one transaction.

---

## 7. POST /api/feedback

**Purpose:** Submit feedback for a mentor.

### Flow

```
Client
  │
  │ 1. POST /api/feedback?learnerId=1&sessionId=1&rating=5&comment=Great
  │    Header: Authorization: Bearer <jwt>
  │
  ▼
JwtAuthenticationFilter → validates token
  ▼
Spring Security → checks LEARNER role
  ▼
FeedbackController.submitFeedback(learnerId, sessionId, rating, comment)
  │
  │ 2. Calls feedbackService.submitFeedback(learnerId, sessionId, rating, comment)
  ▼
FeedbackService.submitFeedback()  [@Transactional]
  │
  │ 3. Calls userRepository.findById(learnerId) → ResourceNotFoundException if not found
  │ 4. Calls sessionRepository.findById(sessionId) → ResourceNotFoundException if not found
  │ 5. Calls enrollmentRepository.findByLearnerId(learnerId)
  │ 6. Filters enrollments to find one matching sessionId
  │    → If not found: ResourceNotFoundException("Enrollment not found") → HTTP 404
  │ 7. Sets enrollment.feedbackSubmitted = true
  │ 8. Calls enrollmentRepository.save(enrollment)  [UPDATE]
  │ 9. Creates MentorFeedback (rating, comment, learner, mentor=session.getMentor(), session)
  │ 10. Calls feedbackRepository.save(feedback)  [INSERT]
  ▼
MySQL Database
  │
  │ 11. Enrollment updated (feedback_submitted=true)
  │ 12. Feedback inserted
  ▼
FeedbackController.submitFeedback()
  │
  │ 13. Converts to FeedbackResponseDto using FeedbackResponseDto.from(feedback)
  │ 14. Returns ResponseEntity.ok(dto)
  ▼
Client (receives feedback as JSON)
```

### Security

- **Requires LEARNER role.**
- **Transactional:** Both the enrollment update and feedback insert happen in one transaction.
- **Enrollment check:** The learner must be enrolled in the session before submitting feedback.

---

## 8. GET /api/feedback

**Purpose:** View all feedback (for admins and support).

### Flow

```
Client
  │
  │ 1. GET /api/feedback
  │    Header: Authorization: Bearer <jwt>
  │
  ▼
JwtAuthenticationFilter → validates token
  ▼
Spring Security → checks ACADEMIC_ADMIN, ADMIN, SUPPORT_AGENT, or SUPPORT role
  ▼
FeedbackController.getAllFeedback()
  │
  │ 2. Calls feedbackService.getAllFeedback()
  ▼
FeedbackService.getAllFeedback()
  │
  │ 3. Calls feedbackRepository.findAll()
  ▼
MentorFeedbackRepository.findAll()
  │
  │ 4. SQL: SELECT * FROM mentor_feedback
  ▼
MySQL Database
  │
  │ 5. Returns all feedback
  ▼
FeedbackController.getAllFeedback()
  │
  │ 6. Converts each to FeedbackResponseDto using .from()
  │ 7. Returns ResponseEntity.ok(dtos)
  ▼
Client (receives list of feedback as JSON)
```

### Security

- **Requires ACADEMIC_ADMIN, ADMIN, SUPPORT_AGENT, or SUPPORT role.**
- **Transactional:** The `@Transactional` annotation ensures lazy associations can be loaded.

---

## 9. GET /api/analytics/stats

**Purpose:** View platform-wide statistics (for admins).

### Flow

```
Client
  │
  │ 1. GET /api/analytics/stats
  │    Header: Authorization: Bearer <jwt>
  │
  ▼
JwtAuthenticationFilter → validates token
  ▼
Spring Security → checks ACADEMIC_ADMIN or ADMIN role
  ▼
AnalyticsController.getStats()
  │
  │ 2. Calls administrativeService.getPlatformStats()
  ▼
AdministrativeService.getPlatformStats()
  │
  │ 3. Calls userRepository.countByRole(LEARNER) → SQL: SELECT COUNT(*) FROM academic_users WHERE role = 'LEARNER'
  │ 4. Calls userRepository.countByRole(MENTOR) → SQL: SELECT COUNT(*) FROM academic_users WHERE role = 'MENTOR'
  │ 5. Calls userRepository.countByRole(ACADEMIC_ADMIN) → ...
  │ 6. Calls userRepository.countByRole(SUPPORT_AGENT) → ...
  │ 7. Calls userRepository.countByRoleAndStatus(MENTOR, PENDING) → ...
  │ 8. Calls sessionRepository.countByStatus(SCHEDULED) → ...
  │ 9. Calls sessionRepository.countByStatus(ACTIVE) → ...
  │ 10. Calls sessionRepository.countByStatus(COMPLETED) → ...
  │ 11. Calls sessionRepository.countByStatus(CANCELLED) → ...
  │ 12. Calls subjectRepository.getSubjectEnrollmentStats() → JPQL query
  ▼
MySQL Database
  │
  │ 13. Returns all counts and stats
  ▼
AnalyticsController.getStats()
  │
  │ 14. Returns ResponseEntity.ok(stats)
  ▼
Client (receives stats as JSON)
```

### Security

- **Requires ACADEMIC_ADMIN or ADMIN role.**

---

## 10. GET /api/analytics/mentor/{mentorId}

**Purpose:** View a mentor's dashboard statistics.

### Flow

```
Client
  │
  │ 1. GET /api/analytics/mentor/2
  │    Header: Authorization: Bearer <jwt>
  │
  ▼
JwtAuthenticationFilter → validates token
  ▼
Spring Security → checks MENTOR role
  ▼
AnalyticsController.getMentorStats(mentorId)
  │
  │ 2. Calls administrativeService.getMentorDashboardStats(mentorId)
  ▼
AdministrativeService.getMentorDashboardStats()
  │
  │ 3. Calls feedbackRepository.getAverageRatingByMentorId(mentorId) → JPQL: SELECT AVG(f.rating) ...
  │ 4. Calls feedbackRepository.countByMentorId(mentorId) → SQL: SELECT COUNT(*) FROM mentor_feedback WHERE mentor_id = ?
  │ 5. Calls sessionRepository.countByMentorId(mentorId) → SQL: SELECT COUNT(*) FROM tutoring_sessions WHERE mentor_id = ?
  │ 6. Calls sessionRepository.countByMentorIdAndStatus(mentorId, SCHEDULED) → ...
  │ 7. Calls sessionRepository.countByMentorIdAndStatus(mentorId, ACTIVE) → ...
  │ 8. Calls sessionRepository.countByMentorIdAndStatus(mentorId, COMPLETED) → ...
  ▼
MySQL Database
  │
  │ 9. Returns all counts and stats
  ▼
AnalyticsController.getMentorStats()
  │
  │ 10. Returns ResponseEntity.ok(stats)
  ▼
Client (receives mentor stats as JSON)
```

### Security

- **Requires MENTOR role.**

---

## 11. GET /api/users/mentors

**Purpose:** List all mentors.

### Flow

```
Client
  │
  │ 1. GET /api/users/mentors
  │    Header: Authorization: Bearer <jwt>
  │
  ▼
JwtAuthenticationFilter → validates token
  ▼
Spring Security → checks anyRequest().authenticated()
  ▼
UserController.getMentors()
  │
  │ 2. Calls userRepository.findByRole(UserRole.MENTOR)
  ▼
AcademicUserRepository.findByRole()
  │
  │ 3. SQL: SELECT * FROM academic_users WHERE role = 'MENTOR'
  ▼
MySQL Database
  │
  │ 4. Returns all mentors
  ▼
UserController.getMentors()
  │
  │ 5. Returns ResponseEntity.ok(mentors)
  │ 6. Spring converts to JSON (includes password hash — security concern!)
  ▼
Client (receives list of mentors as JSON)
```

### Security

- **Requires authentication** (any logged-in user).
- **Note:** The password hash is included in the response — this is a security concern.

---

## 12. PUT /api/users/{id}/status

**Purpose:** Update a user's status (admin only).

### Flow

```
Client
  │
  │ 1. PUT /api/users/2/status?status=APPROVED
  │    Header: Authorization: Bearer <jwt>
  │
  ▼
JwtAuthenticationFilter → validates token
  ▼
Spring Security → checks ACADEMIC_ADMIN or ADMIN role
  ▼
UserController.updateStatus(id, status)
  │
  │ 2. Calls userRepository.findById(id)
  │    → If not found: ResourceNotFoundException("User not found") → HTTP 404
  │ 3. Sets user.setStatus(status)
  │ 4. Calls userRepository.save(user)
  ▼
AcademicUserRepository.save()
  │
  │ 5. SQL: UPDATE academic_users SET status = ? WHERE id = ?
  ▼
MySQL Database
  │
  │ 6. User status updated
  ▼
UserController.updateStatus()
  │
  │ 7. Returns ResponseEntity.ok(updatedUser)
  ▼
Client (receives updated user as JSON)
```

### Security

- **Requires ACADEMIC_ADMIN or ADMIN role.**
