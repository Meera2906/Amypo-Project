# CONTROLLERS

This document explains every controller in the project.

---

## What is a Controller?

A **Controller** is a Java class that receives HTTP requests from clients (browsers, mobile apps) and returns HTTP responses. In Spring Boot, controllers are annotated with `@RestController`, which means:

1. Spring automatically finds this class and registers it.
2. The return value of each method is automatically converted to JSON and sent as the HTTP response body.
3. The method's parameters (like `@RequestBody`, `@PathVariable`, `@RequestParam`) are automatically filled from the incoming HTTP request.

**Key annotations used in all controllers:**

| Annotation | What it does |
|---|---|
| `@RestController` | Marks the class as a REST controller. Combines `@Controller` + `@ResponseBody`. |
| `@RequestMapping("/api/...")` | Sets the base URL path for all endpoints in this controller. |
| `@GetMapping("/path")` | Maps HTTP GET requests to this method. |
| `@PostMapping("/path")` | Maps HTTP POST requests to this method. |
| `@PutMapping("/path")` | Maps HTTP PUT requests to this method. |
| `@DeleteMapping("/path")` | Maps HTTP DELETE requests to this method. |
| `@RequestBody` | Takes the JSON body of the request and converts it to a Java object. |
| `@PathVariable` | Takes a value from the URL path (e.g., `/api/users/5` → `id = 5`). |
| `@RequestParam` | Takes a value from the URL query string (e.g., `?learnerId=5`). |
| `ResponseEntity<T>` | A wrapper that lets you control the HTTP status code and headers, plus the body. |

---

## 1. AuthController

**File:** `controller/AuthController.java`
**Purpose:** Handles user authentication — login and registration.
**Base URL:** `/api/auth`
**Security:** All endpoints are **public** (no login required).

### Endpoints

#### 1. Login — `POST /api/auth/login`

- **Method:** `login(@RequestBody AuthRequestDto request)`
- **Request Body:**
  ```json
  {
    "email": "learner@example.com",
    "password": "password123"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "id": 1,
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "fullName": "John Learner",
    "email": "learner@example.com",
    "role": "LEARNER"
  }
  ```
- **Flow to Service:**
  1. Controller receives the `AuthRequestDto` (email + password).
  2. Calls `authService.login(request)`.
  3. `AcademicAuthService.login()` finds the user by email, checks the password with BCrypt, checks if the account is approved, and generates a JWT token.
  4. Returns `AuthResponseDto` (with token + user details).
- **Common Viva Questions:**
  - Q: Why is the login endpoint public?
  - A: Because you need to be able to log in before you have a token. If it required authentication, you could never log in.
  - Q: What happens if the password is wrong?
  - A: `AcademicAuthService` throws `BusinessValidationException("Invalid Credentials.")`, which is caught by `GlobalExceptionHandler` and returns HTTP 400 with a message.
  - Q: What happens if the user is not approved?
  - A: The service throws `BusinessValidationException("Account is pending or blocked")`, returning HTTP 400.

#### 2. Register — `POST /api/auth/register`

- **Method:** `register(@RequestBody RegisterDto request)`
- **Request Body:**
  ```json
  {
    "fullName": "Jane Mentor",
    "email": "jane@example.com",
    "password": "password123",
    "role": "MENTOR",
    "department": "Computer Science",
    "bio": "Experienced in Java"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "id": 2,
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "fullName": "Jane Mentor",
    "email": "jane@example.com",
    "role": "MENTOR"
  }
  ```
- **Flow to Service:**
  1. Controller receives `RegisterDto` (all user fields).
  2. Calls `authService.register(request)`.
  3. `AcademicAuthService.register()` checks if email already exists, encodes the password, sets the status (PENDING for mentors, APPROVED for others), saves the user, and generates a JWT token.
  4. Returns `AuthResponseDto`.
- **Common Viva Questions:**
  - Q: Why does a new mentor get `PENDING` status?
  - A: Mentors need to be approved by an admin before they can create sessions. Learners are approved automatically.
  - Q: What happens if you register with an email that already exists?
  - A: `BusinessValidationException("Email already exists")` is thrown, returning HTTP 400.

---

## 2. UserController

**File:** `controller/UserController.java`
**Purpose:** Handles user profile viewing and user status management.
**Base URL:** `/api/users`
**Security:** All endpoints require authentication. The `updateStatus` endpoint requires `ACADEMIC_ADMIN` or `ADMIN` role.

### Endpoints

#### 1. Get Mentors — `GET /api/users/mentors`

- **Method:** `getMentors()`
- **Request Body:** None
- **Response:** `200 OK`
  ```json
  [
    {
      "id": 2,
      "fullName": "Jane Mentor",
      "email": "jane@example.com",
      "password": "$2a$10$...",
      "role": "MENTOR",
      "department": "Computer Science",
      "bio": "Experienced in Java",
      "status": "APPROVED"
    }
  ]
  ```
- **Flow to Service:**
  1. Controller calls `userRepository.findByRole(UserRole.MENTOR)`.
  2. Returns a list of all users with the MENTOR role.
  - **Note:** This controller talks directly to the repository (no service layer). This is a simpler design choice.
- **Common Viva Questions:**
  - Q: Why does this controller talk directly to the repository instead of a service?
  - A: The operation is simple (just listing mentors). The SRS may have planned a service, but the actual code uses the repository directly.
  - Q: Is the password field exposed in the response?
  - A: Yes, it is. This is a security concern — the `@JsonProperty(access = READ_ONLY)` annotation on the password field means it won't be set from JSON input, but it IS still serialized in the output. In a production app, you would use a DTO or `@JsonIgnore` on the password field.

#### 2. Get Profile — `GET /api/users/{id}`

- **Method:** `getProfile(@PathVariable Long id)`
- **Request Body:** None
- **Response:** `200 OK`
  ```json
  {
    "id": 1,
    "fullName": "John Learner",
    "email": "learner@example.com",
    "password": "$2a$10$...",
    "role": "LEARNER",
    "department": null,
    "bio": null,
    "status": "APPROVED"
  }
  ```
- **Flow to Service:**
  1. Controller calls `userRepository.findById(id)`.
  2. If not found, throws `ResourceNotFoundException("User not found")` → HTTP 404.
  3. Returns the user object.
- **Common Viva Questions:**
  - Q: What happens if the user ID doesn't exist?
  - A: `ResourceNotFoundException` is thrown, caught by `GlobalExceptionHandler`, returning HTTP 404.

#### 3. Update Status — `PUT /api/users/{id}/status`

- **Method:** `updateStatus(@PathVariable Long id, @RequestParam UserStatus status)`
- **Request Body:** None
- **Request Query:** `?status=APPROVED`
- **Response:** `200 OK`
  ```json
  {
    "id": 2,
    "fullName": "Jane Mentor",
    "email": "jane@example.com",
    "password": "$2a$10$...",
    "role": "MENTOR",
    "department": "Computer Science",
    "bio": "Experienced in Java",
    "status": "APPROVED"
  }
  ```
- **Flow to Service:**
  1. Controller calls `userRepository.findById(id)`.
  2. If not found, throws `ResourceNotFoundException`.
  3. Sets the new status and saves.
- **Security:** Requires `ACADEMIC_ADMIN` or `ADMIN` role (configured in `SecurityConfig`).
- **Common Viva Questions:**
  - Q: Why use `@RequestParam` instead of `@RequestBody` for the status?
  - A: It's simpler for a single value. The client sends `?status=APPROVED` in the URL.
  - Q: What roles can access this endpoint?
  - A: `ACADEMIC_ADMIN` and `ADMIN` (the `ADMIN` role is added as an alias for `ACADEMIC_ADMIN` in the JWT filter).

---

## 3. SubjectController

**File:** `controller/SubjectController.java`
**Purpose:** Handles CRUD operations for study subjects (e.g., Mathematics, Physics).
**Base URL:** `/api/subjects`
**Security:** All endpoints require authentication. POST, PUT, DELETE require `ACADEMIC_ADMIN` or `ADMIN` role.

### Endpoints

#### 1. List All — `GET /api/subjects`

- **Method:** `listAll()`
- **Response:** `200 OK`
  ```json
  [
    { "id": 1, "name": "Mathematics", "description": "Study of numbers..." },
    { "id": 2, "name": "Physics", "description": "Study of matter..." }
  ]
  ```
- **Flow:** Calls `subjectRepository.findAll()`.

#### 2. Create — `POST /api/subjects`

- **Method:** `create(@RequestBody StudySubject subject)`
- **Request Body:**
  ```json
  { "name": "Biology", "description": "Study of life" }
  ```
- **Response:** `200 OK` — the saved subject.
- **Flow:**
  1. Checks if name is empty → `BusinessValidationException`.
  2. Checks if subject already exists → `BusinessValidationException`.
  3. Saves and returns.
- **Common Viva Questions:**
  - Q: Why does this controller talk directly to the repository?
  - A: The operations are simple CRUD. No complex business logic requires a service layer.
  - Q: What happens if you try to create a subject with a duplicate name?
  - A: `BusinessValidationException("Subject already exists")` → HTTP 400.

#### 3. Update — `PUT /api/subjects/{id}`

- **Method:** `update(@PathVariable Long id, @RequestBody StudySubject subjectDetails)`
- **Response:** `200 OK` — the updated subject.
- **Flow:** Finds by ID, updates name and description, saves.

#### 4. Delete — `DELETE /api/subjects/{id}`

- **Method:** `delete(@PathVariable Long id)`
- **Response:** `200 OK` — `"Subject deleted"`.
- **Flow:** Calls `subjectRepository.deleteById(id)`.
- **Common Viva Questions:**
  - Q: What happens if you delete a subject that doesn't exist?
  - A: `deleteById` does nothing (no exception) in Spring Data JPA. It just returns. The response is still "Subject deleted".
  - Q: What happens to sessions that reference this subject?
  - A: This could cause a foreign key constraint violation if any sessions reference the subject. The database would throw an error, which would be caught by the generic exception handler (HTTP 500).

---

## 4. SessionController

**File:** `controller/SessionController.java`
**Purpose:** Handles CRUD operations for tutoring sessions.
**Base URL:** `/api/sessions`
**Security:** All endpoints require authentication.

### Endpoints

#### 1. Get All — `GET /api/sessions`

- **Method:** `getAll(Pageable pageable)`
- **Response:** `200 OK` — a paginated list of sessions.
  ```json
  {
    "content": [
      {
        "id": 1,
        "title": "Calculus 101",
        "description": "...",
        "startTime": "2025-01-15T10:00:00",
        "endTime": "2025-01-15T11:00:00",
        "maxCapacity": 20,
        "currentEnrollment": 5,
        "status": "SCHEDULED",
        "mentor": { "id": 2, "fullName": "Jane Mentor", ... },
        "subject": { "id": 1, "name": "Mathematics", ... }
      }
    ],
    "pageable": { ... },
    "totalElements": 1,
    "totalPages": 1
  }
  ```
- **Flow:** Calls `sessionManagementService.getAvailableSessions(pageable)`, which calls `sessionRepository.findByStatusIn(...)` with SCHEDULED, ACTIVE, and COMPLETED statuses.
- **Common Viva Questions:**
  - Q: What is `Pageable`?
  - A: It's a Spring Data interface that handles pagination. The client can send `?page=0&size=10` to get the first 10 results.
  - Q: Why are CANCELLED sessions excluded?
  - A: The service filters for SCHEDULED, ACTIVE, and COMPLETED — cancelled sessions are not shown in the public listing.

#### 2. Create — `POST /api/sessions`

- **Method:** `create(@RequestBody TutoringSession session)`
- **Request Body:**
  ```json
  {
    "title": "Calculus 101",
    "description": "Introduction to calculus",
    "startTime": "2025-01-15T10:00:00",
    "endTime": "2025-01-15T11:00:00",
    "maxCapacity": 20,
    "mentor": { "id": 2 },
    "subject": { "id": 1 }
  }
  ```
- **Response:** `200 OK` — the saved session.
- **Flow:** Calls `sessionManagementService.createSession(session)`, which validates the title, start time, end time, resolves the mentor and subject from the database, sets `currentEnrollment=0` and `status=SCHEDULED`, and saves.
- **Common Viva Questions:**
  - Q: Why does the request body contain `mentor: { id: 2 }` instead of the full mentor object?
  - A: The client only sends the ID. The service looks up the full mentor object from the database using `userRepository.findById(mentor.getId())`.
  - Q: What validation is performed?
  - A: Title must not be empty, start time must be in the future, end time must be after start time, mentor and subject must be provided and must exist.

#### 3. Update — `PUT /api/sessions/{id}`

- **Method:** `update(@PathVariable Long id, @RequestBody TutoringSession sessionDetails)`
- **Response:** `200 OK` — the updated session.
- **Flow:** Calls `sessionManagementService.updateSession(id, sessionDetails)`.

#### 4. Update Status — `PUT /api/sessions/{id}/status`

- **Method:** `updateStatus(@PathVariable Long id, @RequestParam String status)`
- **Request Query:** `?status=ACTIVE`
- **Response:** `200 OK` — `"Status updated..."`.
- **Flow:** Converts the string to `SessionStatus` enum, calls `sessionManagementService.updateSessionStatus(id, newStatus)`.
- **Common Viva Questions:**
  - Q: What happens if you pass an invalid status like `?status=FOO`?
  - A: `SessionStatus.valueOf("FOO")` throws `IllegalArgumentException`, which is caught and re-thrown as `BusinessValidationException("Invalid status: FOO")` → HTTP 400.
  - Q: Can you change the status of a COMPLETED session?
  - A: No. The service throws `BusinessValidationException("Cannot change status of completed or cancelled session")`.

#### 5. Cancel — `DELETE /api/sessions/{id}`

- **Method:** `cancel(@PathVariable Long id)`
- **Response:** `200 OK` — `"Session cancelled"`.
- **Flow:** Calls `sessionManagementService.cancelSession(id)`, which sets the status to CANCELLED.

---

## 5. EnrollmentController

**File:** `controller/EnrollmentController.java`
**Purpose:** Handles learner enrollment in tutoring sessions.
**Base URL:** `/api/enrollments`
**Security:** All endpoints require `LEARNER` role.

### Endpoints

#### 1. Get My Enrollments — `GET /api/enrollments/my`

- **Method:** `getMyEnrollments(@RequestParam Long learnerId)`
- **Request Query:** `?learnerId=1`
- **Response:** `200 OK`
  ```json
  [
    {
      "id": 1,
      "enrollmentDate": "2025-01-10T09:00:00",
      "status": "ENROLLED",
      "feedbackSubmitted": false,
      "learnerId": 1,
      "learnerName": "John Learner",
      "learnerEmail": "learner@example.com",
      "sessionId": 1,
      "sessionTitle": "Calculus 101",
      "sessionStartTime": "2025-01-15T10:00:00",
      "sessionEndTime": "2025-01-15T11:00:00"
    }
  ]
  ```
- **Flow:**
  1. Calls `sessionEnrollmentRepository.findByLearnerId(learnerId)`.
  2. Converts each `SessionEnrollment` to `EnrollmentResponseDto` using the `from()` factory method.
  - **Note:** The method is annotated with `@Transactional` (from `jakarta.transaction`) to ensure the lazy-loaded associations (learner, session) can be accessed while the JPA session is still open.
- **Common Viva Questions:**
  - Q: Why is `@Transactional` needed on this method?
  - A: The `SessionEnrollment` entity has `@ManyToOne(fetch = LAZY)` relationships. Without an open transaction, accessing `e.getLearner()` would throw a `LazyInitializationException`. The `@Transactional` annotation keeps the JPA session open so the DTO's `from()` method can read the lazy associations.
  - Q: Why use `@RequestParam` for `learnerId` instead of getting it from the JWT token?
  - A: The SRS describes this design. In a more advanced implementation, the learner ID would be extracted from the JWT token automatically.

#### 2. Enroll — `POST /api/enrollments/enroll`

- **Method:** `enroll(@RequestParam Long learnerId, @RequestParam Long sessionId)`
- **Request Query:** `?learnerId=1&sessionId=1`
- **Response:** `200 OK` — `"Enrolled"`.
- **Flow:** Calls `enrollmentWorkflowService.enrollLearner(learnerId, sessionId)`.
- **Common Viva Questions:**
  - Q: What checks are performed before enrolling?
  - A: The session must be SCHEDULED, the session must not be at capacity, and the learner must not already be enrolled.

#### 3. Cancel Enrollment — `DELETE /api/enrollments/cancel`

- **Method:** `cancelEnrollment(@RequestParam Long learnerId, @RequestParam Long sessionId)`
- **Request Query:** `?learnerId=1&sessionId=1`
- **Response:** `200 OK` — `"Enrollment cancelled"`.
- **Flow:** Calls `enrollmentWorkflowService.cancelEnrollment(learnerId, sessionId)`.
- **Common Viva Questions:**
  - Q: What does "cancel enrollment" do?
  - A: It sets the enrollment status to `DISCONTINUED` and decrements the session's `currentEnrollment` count.

---

## 6. FeedbackController

**File:** `controller/FeedbackController.java`
**Purpose:** Handles feedback submission and viewing.
**Base URL:** `/api/feedback`
**Security:** POST requires `LEARNER` role. GET requires `ACADEMIC_ADMIN`, `ADMIN`, `SUPPORT_AGENT`, or `SUPPORT` role.

### Endpoints

#### 1. Submit Feedback — `POST /api/feedback`

- **Method:** `submitFeedback(@RequestParam Long learnerId, @RequestParam Long sessionId, @RequestParam Integer rating, @RequestParam String comment)`
- **Request Query:** `?learnerId=1&sessionId=1&rating=5&comment=Great+session`
- **Response:** `200 OK`
  ```json
  {
    "id": 1,
    "rating": 5,
    "comment": "Great session",
    "learnerId": 1,
    "learnerName": "John Learner",
    "learnerEmail": "learner@example.com",
    "mentorId": 2,
    "mentorName": "Jane Mentor",
    "mentorEmail": "jane@example.com",
    "sessionId": 1,
    "sessionTitle": "Calculus 101"
  }
  ```
- **Flow:**
  1. Calls `feedbackService.submitFeedback(learnerId, sessionId, rating, comment)`.
  2. The service checks that the learner is enrolled in the session, marks `feedbackSubmitted=true` on the enrollment, creates the `MentorFeedback`, and saves it.
  3. Converts the result to `FeedbackResponseDto` using the `from()` factory method.
  - **Note:** `@Transactional` is used to ensure both the enrollment update and feedback save happen in the same transaction.
- **Common Viva Questions:**
  - Q: Why must the learner be enrolled before submitting feedback?
  - A: To prevent fake feedback. Only learners who actually attended (or are enrolled in) a session can leave feedback.
  - Q: What is the difference between `FeedbackService` and `FeedbackModerationService`?
  - A: `FeedbackService.submitFeedback()` checks enrollment before allowing feedback. `FeedbackModerationService.submitFeedback()` does not check enrollment — it just creates the feedback directly. The controller uses `FeedbackService`.

#### 2. Get All Feedback — `GET /api/feedback`

- **Method:** `getAllFeedback()`
- **Response:** `200 OK` — a list of `FeedbackResponseDto` objects.
- **Flow:**
  1. Calls `feedbackService.getAllFeedback()`.
  2. Converts each `MentorFeedback` to `FeedbackResponseDto` using the `from()` factory method.
  - **Note:** `@Transactional` is used to ensure lazy associations can be loaded.
- **Common Viva Questions:**
  - Q: Who can view all feedback?
  - A: Users with `ACADEMIC_ADMIN`, `ADMIN`, `SUPPORT_AGENT`, or `SUPPORT` roles.

---

## 7. AnalyticsController

**File:** `controller/AnalyticsController.java`
**Purpose:** Provides platform statistics and mentor dashboards.
**Base URL:** `/api/analytics`
**Security:** `/stats` requires `ACADEMIC_ADMIN` or `ADMIN`. `/mentor/{mentorId}` requires `MENTOR` role.

### Endpoints

#### 1. Get Platform Stats — `GET /api/analytics/stats`

- **Method:** `getStats()`
- **Response:** `200 OK`
  ```json
  {
    "totalLearners": 10,
    "totalMentors": 5,
    "totalAdmins": 1,
    "totalSupport": 1,
    "pendingMentors": 2,
    "scheduledSessions": 3,
    "activeSessions": 1,
    "completedSessions": 5,
    "cancelledSessions": 1,
    "subjectStats": [
      { "name": "Mathematics", "count": 5 },
      { "name": "Physics", "count": 3 }
    ]
  }
  ```
- **Flow:** Calls `administrativeService.getPlatformStats()`, which aggregates counts from multiple repositories.
- **Common Viva Questions:**
  - Q: What is `subjectStats`?
  - A: It's a list of objects with `name` (subject name) and `count` (number of enrollments). It comes from a custom JPQL query in `StudySubjectRepository.getSubjectEnrollmentStats()`.

#### 2. Get Mentor Stats — `GET /api/analytics/mentor/{mentorId}`

- **Method:** `getMentorStats(@PathVariable Long mentorId)`
- **Response:** `200 OK`
  ```json
  {
    "averageRating": 4.5,
    "totalReviews": 10,
    "totalSessions": 5,
    "scheduledSessions": 2,
    "activeSessions": 1,
    "completedSessions": 2
  }
  ```
- **Flow:** Calls `administrativeService.getMentorDashboardStats(mentorId)`.
- **Common Viva Questions:**
  - Q: What does `averageRating` represent?
  - A: The average of all ratings given to this mentor across all their feedback entries.
  - Q: What happens if a mentor has no feedback?
  - A: The average rating is `0.0` (the service checks for null and defaults to 0.0).
