# SERVICES

This document explains every service in the project.

---

## What is a Service?

A **Service** is a Java class that contains the **business logic** of the application. While controllers are thin (they just receive requests and return responses), services do the real work — they enforce the rules of the application.

### Key Concepts

- **Annotated with `@Service`** — Spring automatically discovers and creates this class as a bean.
- **Constructor Injection** — Services receive their dependencies (repositories) through the constructor. Spring automatically passes the right repository when creating the service.
- **`@Transactional`** — Some methods are annotated with `@Transactional`, which means all database operations in that method run as a single unit. If one fails, all changes are rolled back (undone).

---

## 1. AcademicAuthService

**File:** `service/AcademicAuthService.java`
**Purpose:** Handles user registration and login.
**Repositories it calls:** `AcademicUserRepository`
**Other dependencies:** `PasswordEncoder`, `JwtUtil`

### Constructor

```java
public AcademicAuthService(AcademicUserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil)
```

Spring automatically passes:
- `AcademicUserRepository` — to save and find users in the database.
- `PasswordEncoder` — to encrypt and verify passwords (BCrypt).
- `JwtUtil` — to generate JWT tokens.

### Methods

#### 1. `register(RegisterDto dto)` → `AuthResponseDto`

**Purpose:** Registers a new user.

**Step-by-step:**
1. **Check email uniqueness** — Calls `userRepository.existsByEmail(dto.getEmail())`. If the email already exists, throws `BusinessValidationException("Email already exists")`.
2. **Build the user** — Uses the builder pattern to create an `AcademicUser`:
   - `fullName`, `email`, `password` (encoded with BCrypt), `role`, `department`, `bio` are set from the DTO.
   - `status` is set to `PENDING` if the role is `MENTOR` (needs admin approval), or `APPROVED` for all other roles (LEARNER, ACADEMIC_ADMIN, SUPPORT_AGENT).
3. **Save the user** — Calls `userRepository.save(user)`.
4. **Generate JWT token** — Calls `jwtUtil.generateToken(user.getEmail())`.
5. **Return response** — Returns `AuthResponseDto` with the user's id, token, fullName, email, and role.

**Why this method exists:** Users need to create accounts to use the system. The registration process must ensure emails are unique and passwords are encrypted.

#### 2. `login(AuthRequestDto dto)` → `AuthResponseDto`

**Purpose:** Logs in an existing user.

**Step-by-step:**
1. **Find the user** — Calls `userRepository.findByEmail(dto.getEmail())`. If not found, throws `ResourceNotFoundException("User not found")`.
2. **Check password** — Calls `passwordEncoder.matches(dto.getPassword(), user.getPassword())`. If the password doesn't match, throws `BusinessValidationException("Invalid Credentials.")`.
3. **Check account status** — If the user's status is `PENDING` or `BLOCKED`, throws `BusinessValidationException("Account is pending or blocked")`.
4. **Generate JWT token** — Calls `jwtUtil.generateToken(user.getEmail())`.
5. **Return response** — Returns `AuthResponseDto` with the user's id, token, fullName, email, and role.

**Why this method exists:** Users need to log in to get a JWT token, which they use for all subsequent authenticated requests.

**Common Viva Questions:**
- Q: Why use BCrypt for password encoding?
- A: BCrypt is a one-way hashing algorithm. It encrypts the password in a way that cannot be reversed. Even if the database is compromised, attackers cannot recover the original passwords.
- Q: Why check if the status is PENDING or BLOCKED?
- A: Pending users (mentors awaiting approval) and blocked users should not be able to log in. This is a security measure.

---

## 2. AdministrativeService

**File:** `service/AdministrativeService.java`
**Purpose:** Computes platform-wide statistics and mentor-specific dashboard stats.
**Repositories it calls:** `AcademicUserRepository`, `TutoringSessionRepository`, `StudySubjectRepository`, `MentorFeedbackRepository`

### Constructor

```java
public AdministrativeService(AcademicUserRepository userRepository,
                             TutoringSessionRepository sessionRepository,
                             StudySubjectRepository subjectRepository,
                             MentorFeedbackRepository feedbackRepository)
```

### Methods

#### 1. `getPlatformStats()` → `Map<String, Object>`

**Purpose:** Returns platform-wide statistics for the admin dashboard.

**Step-by-step:**
1. Creates a `HashMap<String, Object>`.
2. Puts user counts:
   - `totalLearners` — `userRepository.countByRole(UserRole.LEARNER)`
   - `totalMentors` — `userRepository.countByRole(UserRole.MENTOR)`
   - `totalAdmins` — `userRepository.countByRole(UserRole.ACADEMIC_ADMIN)`
   - `totalSupport` — `userRepository.countByRole(UserRole.SUPPORT_AGENT)`
   - `pendingMentors` — `userRepository.countByRoleAndStatus(UserRole.MENTOR, UserStatus.PENDING)`
3. Puts session counts:
   - `scheduledSessions` — `sessionRepository.countByStatus(SessionStatus.SCHEDULED)`
   - `activeSessions` — `sessionRepository.countByStatus(SessionStatus.ACTIVE)`
   - `completedSessions` — `sessionRepository.countByStatus(SessionStatus.COMPLETED)`
   - `cancelledSessions` — `sessionRepository.countByStatus(SessionStatus.CANCELLED)`
4. Puts subject enrollment stats:
   - `subjectStats` — `subjectRepository.getSubjectEnrollmentStats()` (a list of maps with subject name and enrollment count)
5. Returns the map.

**Why this method exists:** Admins need to see an overview of the platform's health — how many users, sessions, and enrollments exist.

#### 2. `getMentorDashboardStats(Long mentorId)` → `Map<String, Object>`

**Purpose:** Returns mentor-specific statistics for the mentor's dashboard.

**Step-by-step:**
1. Creates a `HashMap<String, Object>`.
2. Puts feedback stats:
   - `averageRating` — `feedbackRepository.getAverageRatingByMentorId(mentorId)` (defaults to 0.0 if null)
   - `totalReviews` — `feedbackRepository.countByMentorId(mentorId)`
3. Puts session stats:
   - `totalSessions` — `sessionRepository.countByMentorId(mentorId)`
   - `scheduledSessions` — `sessionRepository.countByMentorIdAndStatus(mentorId, SessionStatus.SCHEDULED)`
   - `activeSessions` — `sessionRepository.countByMentorIdAndStatus(mentorId, SessionStatus.ACTIVE)`
   - `completedSessions` — `sessionRepository.countByMentorIdAndStatus(mentorId, SessionStatus.COMPLETED)`
4. Returns the map.

**Why this method exists:** Mentors need to see their own performance metrics — how many sessions they've run, how many reviews they've received, and their average rating.

**Common Viva Questions:**
- Q: Why return a `Map<String, Object>` instead of a DTO?
- A: It's simpler for statistics endpoints where the structure is a flat collection of key-value pairs. A DTO would be more type-safe but requires more code.

---

## 3. EnrollmentWorkflowService

**File:** `service/EnrollmentWorkflowService.java`
**Purpose:** Handles the enrollment workflow — enrolling and canceling learner enrollment in sessions.
**Repositories it calls:** `SessionEnrollmentRepository`, `TutoringSessionRepository`, `AcademicUserRepository`

### Constructor

```java
public EnrollmentWorkflowService(SessionEnrollmentRepository enrollmentRepository,
                                 TutoringSessionRepository sessionRepository,
                                 AcademicUserRepository userRepository)
```

### Methods

#### 1. `enrollLearner(Long learnerId, Long sessionId)` → `void`

**Purpose:** Enrolls a learner in a tutoring session.

**Annotated with:** `@Transactional(rollbackFor = Exception.class)`

**Step-by-step:**
1. **Find the session** — `sessionRepository.findById(sessionId)`. If not found, throws `ResourceNotFoundException("Session not found")`.
2. **Find the learner** — `userRepository.findById(learnerId)`. If not found, throws `ResourceNotFoundException("Learner not found")`.
3. **Check session status** — If the session's status is not `SCHEDULED`, throws `BusinessValidationException("Can only enroll in SCHEDULED sessions")`.
4. **Check capacity** — If `currentEnrollment >= maxCapacity`, throws `BusinessValidationException("Session capacity exceeded")`.
5. **Check duplicate enrollment** — If `enrollmentRepository.existsByLearnerIdAndSessionId(learnerId, sessionId)` is true, throws `BusinessValidationException("Already enrolled in this session")`.
6. **Create enrollment** — Builds a `SessionEnrollment` with:
   - `enrollmentDate` = now
   - `status` = `ENROLLED`
   - `feedbackSubmitted` = false
   - `learner` = the learner
   - `session` = the session
7. **Increment enrollment count** — `session.setCurrentEnrollment(session.getCurrentEnrollment() + 1)`.
8. **Save session** — `sessionRepository.save(session)` (to update the enrollment count).
9. **Save enrollment** — `enrollmentRepository.save(enrollment)`.

**Why this method exists:** Learners need to enroll in sessions. The method enforces business rules: only scheduled sessions, capacity limits, and no duplicate enrollment.

**Why `@Transactional`:** Steps 7 and 8 modify the session, and step 9 creates the enrollment. If step 9 fails (e.g., database error), the session's enrollment count (step 7) must be rolled back. Without `@Transactional`, the session count would be incremented but the enrollment would not be created — an inconsistent state.

#### 2. `cancelEnrollment(Long learnerId, Long sessionId)` → `void`

**Purpose:** Cancels a learner's enrollment in a session.

**Annotated with:** `@Transactional(rollbackFor = Exception.class)`

**Step-by-step:**
1. **Find the enrollment** — `enrollmentRepository.findByLearnerIdAndSessionIdAndStatus(learnerId, sessionId, EnrollmentStatus.ENROLLED)`. If not found, throws `ResourceNotFoundException("Active enrollment not found")`.
2. **Get the session** — `enrollment.getSession()`.
3. **Update enrollment status** — `enrollment.setStatus(EnrollmentStatus.DISCONTINUED)`.
4. **Save enrollment** — `enrollmentRepository.save(enrollment)`.
5. **Decrement enrollment count** — If `session.getCurrentEnrollment() > 0`, decrement it by 1.
6. **Save session** — `sessionRepository.save(session)`.

**Why this method exists:** Learners need to cancel their enrollment. The method ensures the session's enrollment count is decremented.

**Why `@Transactional`:** Steps 3-4 modify the enrollment, and steps 5-6 modify the session. If one fails, both must be rolled back.

**Common Viva Questions:**
- Q: Why is `@Transactional` critical here?
- A: Without it, if the enrollment is saved but the session count update fails (or vice versa), the data would be inconsistent. The enrollment count would not match the actual number of enrollments.
- Q: What does `rollbackFor = Exception.class` mean?
- A: By default, `@Transactional` only rolls back on unchecked exceptions (RuntimeException). `rollbackFor = Exception.class` means it also rolls back on checked exceptions.

---

## 4. FeedbackModerationService

**File:** `service/FeedbackModerationService.java`
**Purpose:** Handles feedback submission (without enrollment check) and mentor performance stats.
**Repositories it calls:** `MentorFeedbackRepository`, `AcademicUserRepository`, `TutoringSessionRepository`

### Constructor

```java
public FeedbackModerationService(MentorFeedbackRepository feedbackRepository,
                                 AcademicUserRepository userRepository,
                                 TutoringSessionRepository sessionRepository)
```

### Methods

#### 1. `submitFeedback(Long learnerId, Long sessionId, Integer rating, String comment)` → `MentorFeedback`

**Purpose:** Creates and saves a feedback entry.

**Step-by-step:**
1. **Find the learner** — `userRepository.findById(learnerId)`. If not found, throws `ResourceNotFoundException("Learner not found")`.
2. **Find the session** — `sessionRepository.findById(sessionId)`. If not found, throws `ResourceNotFoundException("Session not found")`.
3. **Build feedback** — Uses the builder pattern:
   - `rating`, `comment` from parameters.
   - `learner` = the learner.
   - `mentor` = `session.getMentor()` (the mentor who created the session).
   - `session` = the session.
4. **Save and return** — `feedbackRepository.save(feedback)`.

**Why this method exists:** Provides a way to submit feedback. Note: this method does NOT check if the learner is enrolled in the session — that check is done in `FeedbackService.submitFeedback()`.

#### 2. `getMentorPerformance(Long mentorId)` → `Map<String, Object>`

**Purpose:** Returns mentor performance stats (average rating and total reviews).

**Step-by-step:**
1. Creates a `HashMap<String, Object>`.
2. `averageRating` = `feedbackRepository.getAverageRatingByMentorId(mentorId)` (defaults to 0.0 if null).
3. `totalReviews` = `feedbackRepository.countByMentorId(mentorId)`.
4. Returns the map.

**Why this method exists:** Provides mentor performance metrics.

**Common Viva Questions:**
- Q: What is the difference between `FeedbackModerationService` and `FeedbackService`?
- A: `FeedbackModerationService.submitFeedback()` does NOT check enrollment — it just creates feedback. `FeedbackService.submitFeedback()` DOES check enrollment — it verifies the learner is enrolled before allowing feedback. The controller uses `FeedbackService`.

---

## 5. FeedbackService

**File:** `service/FeedbackService.java`
**Purpose:** Handles feedback submission (with enrollment check) and listing all feedback.
**Repositories it calls:** `MentorFeedbackRepository`, `AcademicUserRepository`, `TutoringSessionRepository`, `SessionEnrollmentRepository`

### Constructor

```java
public FeedbackService(MentorFeedbackRepository feedbackRepository,
                       AcademicUserRepository userRepository,
                       TutoringSessionRepository sessionRepository,
                       SessionEnrollmentRepository enrollmentRepository)
```

### Methods

#### 1. `submitFeedback(Long learnerId, Long sessionId, Integer rating, String comment)` → `MentorFeedback`

**Purpose:** Creates and saves a feedback entry, but only if the learner is enrolled in the session.

**Annotated with:** `@Transactional(rollbackFor = Exception.class)`

**Step-by-step:**
1. **Find the learner** — `userRepository.findById(learnerId)`. If not found, throws `ResourceNotFoundException("Learner not found")`.
2. **Find the session** — `sessionRepository.findById(sessionId)`. If not found, throws `ResourceNotFoundException("Session not found")`.
3. **Find the enrollment** — Gets all enrollments for the learner: `enrollmentRepository.findByLearnerId(learnerId)`. Then filters to find the one matching the sessionId. If not found, throws `ResourceNotFoundException("Enrollment not found")`.
4. **Mark feedback as submitted** — `enrollment.setFeedbackSubmitted(true)`.
5. **Save enrollment** — `enrollmentRepository.save(enrollment)`.
6. **Build feedback** — Uses the builder pattern:
   - `rating`, `comment` from parameters.
   - `learner` = the learner.
   - `mentor` = `session.getMentor()`.
   - `session` = the session.
7. **Save and return** — `feedbackRepository.save(feedback)`.

**Why this method exists:** Only learners who are actually enrolled in a session should be able to leave feedback. This prevents fake feedback.

**Why `@Transactional`:** Steps 4-5 modify the enrollment, and step 7 creates the feedback. Both must succeed or both must fail.

#### 2. `getAllFeedback()` → `List<MentorFeedback>`

**Purpose:** Returns all feedback entries.

**Step-by-step:**
1. Calls `feedbackRepository.findAll()`.
2. Returns the list.

**Why this method exists:** Support agents and admins need to view all feedback for moderation.

**Common Viva Questions:**
- Q: Why check enrollment before allowing feedback?
- A: To prevent fake reviews. Only learners who are actually enrolled in (or attended) a session can leave feedback for the mentor.
- Q: What does `feedbackSubmitted = true` mean?
- A: It's a flag on the enrollment that tracks whether the learner has already submitted feedback for this session. This prevents duplicate feedback.

---

## 6. SessionManagementService

**File:** `service/SessionManagementService.java`
**Purpose:** Handles session creation, update, cancellation, status changes, and listing.
**Repositories it calls:** `TutoringSessionRepository`, `AcademicUserRepository`, `StudySubjectRepository`

### Constructor

```java
public SessionManagementService(TutoringSessionRepository sessionRepository,
                                AcademicUserRepository userRepository,
                                StudySubjectRepository subjectRepository)
```

### Methods

#### 1. `createSession(TutoringSession session)` → `TutoringSession`

**Purpose:** Creates a new tutoring session.

**Step-by-step:**
1. **Validate title** — If title is null or empty, throws `BusinessValidationException("Title cannot be empty")`.
2. **Validate start time** — If start time is null or in the past, throws `BusinessValidationException("Start time must be in the future")`.
3. **Validate end time** — If end time is null or before start time, throws `BusinessValidationException("End time must be after start time")`.
4. **Resolve mentor** — If `session.getMentor()` is null or has no ID, throws `BusinessValidationException("Mentor is required")`. Then `userRepository.findById(mentor.getId())`. If not found, throws `ResourceNotFoundException("Mentor not found")`. Sets the resolved mentor on the session.
5. **Resolve subject** — If `session.getSubject()` is null or has no ID, throws `BusinessValidationException("Subject is required")`. Then `subjectRepository.findById(subject.getId())`. If not found, throws `ResourceNotFoundException("Subject not found")`. Sets the resolved subject on the session.
6. **Set defaults** — `currentEnrollment = 0`, `status = SCHEDULED`.
7. **Save and return** — `sessionRepository.save(session)`.

**Why this method exists:** Mentors need to create tutoring sessions. The method validates the session data and resolves foreign key references (mentor and subject) from the database.

#### 2. `updateSession(Long id, TutoringSession sessionDetails)` → `TutoringSession`

**Purpose:** Updates an existing session's details.

**Step-by-step:**
1. **Find the session** — `sessionRepository.findById(id)`. If not found, throws `ResourceNotFoundException("Session not found")`.
2. **Validate title** — If title is null or empty, throws `BusinessValidationException("Title cannot be empty")`.
3. **Update fields** — Sets title, description, startTime, endTime, maxCapacity from `sessionDetails`.
4. **Update subject (optional)** — If `sessionDetails.getSubject()` is not null and has an ID, resolves the subject from the database and sets it.
5. **Save and return** — `sessionRepository.save(session)`.

**Why this method exists:** Mentors need to update session details (e.g., change the time or description).

#### 3. `cancelSession(Long id)` → `void`

**Purpose:** Cancels a session by setting its status to CANCELLED.

**Step-by-step:**
1. **Find the session** — `sessionRepository.findById(id)`. If not found, throws `ResourceNotFoundException("Session not found")`.
2. **Set status** — `session.setStatus(SessionStatus.CANCELLED)`.
3. **Save** — `sessionRepository.save(session)`.

**Why this method exists:** Mentors or admins need to cancel sessions that can no longer take place.

#### 4. `updateSessionStatus(Long id, SessionStatus status)` → `void`

**Purpose:** Updates a session's status (e.g., from SCHEDULED to ACTIVE).

**Step-by-step:**
1. **Find the session** — `sessionRepository.findById(id)`. If not found, throws `ResourceNotFoundException("Session not found")`.
2. **Check if status can be changed** — If the current status is `COMPLETED` or `CANCELLED`, throws `BusinessValidationException("Cannot change status of completed or cancelled session")`.
3. **Set new status** — `session.setStatus(status)`.
4. **Save** — `sessionRepository.save(session)`.

**Why this method exists:** Session status needs to be updated as the session progresses (e.g., SCHEDULED → ACTIVE → COMPLETED).

#### 5. `getAvailableSessions(Pageable pageable)` → `Page<TutoringSession>`

**Purpose:** Returns a paginated list of sessions that are SCHEDULED, ACTIVE, or COMPLETED (excludes CANCELLED).

**Step-by-step:**
1. Calls `sessionRepository.findByStatusIn(Arrays.asList(SCHEDULED, ACTIVE, COMPLETED), pageable)`.
2. Returns the `Page<TutoringSession>`.

**Why this method exists:** Learners need to browse available sessions to enroll in. Cancelled sessions are excluded.

**Common Viva Questions:**
- Q: Why resolve the mentor and subject from the database instead of using the objects from the request body?
- A: The client only sends IDs. The service looks up the full objects to ensure they exist and to get the correct database-managed entities.
- Q: Why can't you change the status of a COMPLETED session?
- A: Once a session is completed, it's a historical record. Changing its status would corrupt the data.
- Q: What is `Pageable`?
- A: It's a Spring Data interface that handles pagination. The client sends `?page=0&size=10` to get the first 10 results.
