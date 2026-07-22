# FILE_BY_FILE

This document describes every file in the project.

---

## 1. DemoApplication.java

**Path:** `backend/src/main/java/com/example/demo/DemoApplication.java`
**Purpose:** Main entry point of the Spring Boot application.
**Imports:** `SpringApplication`, `SpringBootApplication`
**Class:** `DemoApplication`
**Fields:** None
**Methods:** `main(String[] args)` — starts the Spring Boot application
**Annotations:** `@SpringBootApplication`
**Execution flow:** `main()` → `SpringApplication.run()` → Spring container starts → component scan → auto-configuration → `DataSeeder.run()` → Tomcat starts on port 8080
**Dependencies:** Spring Boot framework
**Summary:** The bootstrap class that starts everything.
**Likely faculty questions:** What does `@SpringBootApplication` do? How does the application start?
**Common mistakes:** Forgetting the `main` method or the `@SpringBootApplication` annotation.

---

## 2. AcademicUser.java

**Path:** `entity/AcademicUser.java`
**Purpose:** Entity representing a user (learner, mentor, admin, support agent).
**Imports:** `UserRole`, `UserStatus`, `JsonIgnoreProperties`, `JsonProperty`, `jakarta.persistence.*`
**Class:** `AcademicUser`
**Fields:** `id`, `fullName`, `email`, `password`, `role`, `department`, `bio`, `status`
**Methods:** Getters, setters, constructors, `builder()`, inner `AcademicUserBuilder` class
**Annotations:** `@Entity`, `@Table(name="academic_users")`, `@JsonIgnoreProperties(ignoreUnknown=true)`, `@Id`, `@GeneratedValue(strategy=IDENTITY)`, `@Column`, `@JsonProperty(access=READ_ONLY)`, `@Enumerated(STRING)`
**Execution flow:** Created during registration → stored in database → loaded during login → used in JWT filter for authentication
**Dependencies:** `UserRole`, `UserStatus` enums
**Summary:** The central user entity. All other entities reference it.
**Likely faculty questions:** Why is `@JsonProperty(access=READ_ONLY)` used? Why use `@Enumerated(STRING)`?
**Common mistakes:** Exposing the password field in JSON responses.

---

## 3. TutoringSession.java

**Path:** `entity/TutoringSession.java`
**Purpose:** Entity representing a tutoring session.
**Imports:** `SessionStatus`, `jakarta.persistence.*`, `java.time.LocalDateTime`
**Class:** `TutoringSession`
**Fields:** `id`, `title`, `description`, `startTime`, `endTime`, `maxCapacity`, `currentEnrollment`, `status`, `mentor`, `subject`
**Methods:** Getters, setters, constructors, `builder()`, inner `TutoringSessionBuilder` class
**Annotations:** `@Entity`, `@Table(name="tutoring_sessions")`, `@Id`, `@GeneratedValue`, `@Column`, `@Enumerated(STRING)`, `@ManyToOne(fetch=EAGER)`, `@JoinColumn(nullable=false)`
**Execution flow:** Created by mentor → stored in database → listed for learners → learners enroll → status changes
**Dependencies:** `AcademicUser` (mentor), `StudySubject` (subject), `SessionStatus` enum
**Summary:** Represents a tutoring session with mentor and subject relationships.
**Likely faculty questions:** Why EAGER fetch for mentor and subject? What is the difference between `@ManyToOne` and `@OneToMany`?
**Common mistakes:** Not validating start/end times. Not resolving mentor/subject from the database.

---

## 4. StudySubject.java

**Path:** `entity/StudySubject.java`
**Purpose:** Entity representing an academic subject.
**Imports:** `jakarta.persistence.*`
**Class:** `StudySubject`
**Fields:** `id`, `name`, `description`
**Methods:** Getters, setters, constructors, `builder()`, inner `StudySubjectBuilder` class
**Annotations:** `@Entity`, `@Table(name="study_subjects")`, `@Id`, `@GeneratedValue`, `@Column(nullable=false, unique=true)`
**Execution flow:** Seeded by `DataSeeder` → used when creating sessions → listed for selection
**Dependencies:** None (referenced by `TutoringSession`)
**Summary:** Simple entity for study subjects.
**Likely faculty questions:** Why is `name` unique?
**Common mistakes:** Creating duplicate subjects.

---

## 5. SessionEnrollment.java

**Path:** `entity/SessionEnrollment.java`
**Purpose:** Entity representing a learner's enrollment in a session.
**Imports:** `EnrollmentStatus`, `jakarta.persistence.*`, `java.time.LocalDateTime`
**Class:** `SessionEnrollment`
**Fields:** `id`, `enrollmentDate`, `status`, `feedbackSubmitted`, `learner`, `session`
**Methods:** Getters, setters, constructors, `builder()`, inner `SessionEnrollmentBuilder` class
**Annotations:** `@Entity`, `@Table(name="session_enrollments")`, `@Id`, `@GeneratedValue`, `@Column`, `@Enumerated(STRING)`, `@ManyToOne(fetch=LAZY)`, `@JoinColumn(nullable=false)`
**Execution flow:** Created when learner enrolls → status changes when cancelled → feedback flag set when feedback submitted
**Dependencies:** `AcademicUser` (learner), `TutoringSession` (session), `EnrollmentStatus` enum
**Summary:** Junction entity between learners and sessions.
**Likely faculty questions:** Why LAZY fetch? Why is `feedbackSubmitted` a primitive `boolean`?
**Common mistakes:** Accessing lazy associations outside a transaction.

---

## 6. MentorFeedback.java

**Path:** `entity/MentorFeedback.java`
**Purpose:** Entity representing feedback a learner gives to a mentor.
**Imports:** `jakarta.persistence.*`
**Class:** `MentorFeedback`
**Fields:** `id`, `rating`, `comment`, `learner`, `mentor`, `session`
**Methods:** Getters, setters, constructors, `builder()`, inner `MentorFeedbackBuilder` class
**Annotations:** `@Entity`, `@Table(name="mentor_feedback")`, `@Id`, `@GeneratedValue`, `@Column`, `@ManyToOne(fetch=LAZY)`, `@OneToOne(fetch=EAGER)`, `@JoinColumn(nullable=false)`
**Execution flow:** Created when learner submits feedback → stored in database → used for analytics
**Dependencies:** `AcademicUser` (learner, mentor), `TutoringSession` (session)
**Summary:** Feedback entity with references to learner, mentor, and session.
**Likely faculty questions:** Why `@OneToOne` for session? What happens if you submit feedback twice?
**Common mistakes:** Duplicate feedback for the same session.

---

## 7. UserRole.java

**Path:** `enums/UserRole.java`
**Purpose:** Enum defining user roles.
**Values:** `LEARNER`, `MENTOR`, `ACADEMIC_ADMIN`, `SUPPORT_AGENT`
**Summary:** Fixed set of user types.

---

## 8. UserStatus.java

**Path:** `enums/UserStatus.java`
**Purpose:** Enum defining user account statuses.
**Values:** `PENDING`, `APPROVED`, `REJECTED`, `BLOCKED`
**Summary:** Tracks whether a user can log in.

---

## 9. EnrollmentStatus.java

**Path:** `enums/EnrollmentStatus.java`
**Purpose:** Enum defining enrollment statuses.
**Values:** `ENROLLED`, `ATTENDED`, `CANCELLED`, `DISCONTINUED`
**Summary:** Tracks the state of a learner's enrollment.

---

## 10. SessionStatus.java

**Path:** `enums/SessionStatus.java`
**Purpose:** Enum defining session statuses.
**Values:** `SCHEDULED`, `ACTIVE`, `COMPLETED`, `CANCELLED`
**Summary:** Tracks the lifecycle of a tutoring session.

---

## 11. AuthRequestDto.java

**Path:** `dto/AuthRequestDto.java`
**Purpose:** DTO for login requests.
**Fields:** `email`, `password`
**Summary:** Simple DTO with just email and password.

---

## 12. AuthResponseDto.java

**Path:** `dto/AuthResponseDto.java`
**Purpose:** DTO returned after login/registration.
**Fields:** `id`, `token`, `fullName`, `email`, `role`
**Summary:** Contains JWT token and user details.

---

## 13. RegisterDto.java

**Path:** `dto/RegisterDto.java`
**Purpose:** DTO for registration requests.
**Fields:** `fullName`, `email`, `password`, `role`, `department`, `bio`
**Summary:** All fields needed to create a new user.

---

## 14. SessionDto.java

**Path:** `dto/SessionDto.java`
**Purpose:** Flattened view of a session.
**Fields:** `id`, `title`, `startTime`, `endTime`, `maxCapacity`, `currentEnrollment`, `mentorName`, `subjectName`
**Summary:** Not currently used by any controller.

---

## 15. EnrollmentResponseDto.java

**Path:** `dto/EnrollmentResponseDto.java`
**Purpose:** Flattened view of an enrollment.
**Fields:** `id`, `enrollmentDate`, `status`, `feedbackSubmitted`, `learnerId`, `learnerName`, `learnerEmail`, `sessionId`, `sessionTitle`, `sessionStartTime`, `sessionEndTime`
**Methods:** `from(SessionEnrollment e)` — factory method
**Summary:** Used to avoid LazyInitializationException.

---

## 16. FeedbackResponseDto.java

**Path:** `dto/FeedbackResponseDto.java`
**Purpose:** Flattened view of feedback.
**Fields:** `id`, `rating`, `comment`, `learnerId`, `learnerName`, `learnerEmail`, `mentorId`, `mentorName`, `mentorEmail`, `sessionId`, `sessionTitle`
**Methods:** `from(MentorFeedback f)` — factory method
**Summary:** Used to avoid LazyInitializationException.

---

## 17. AcademicAuthService.java

**Path:** `service/AcademicAuthService.java`
**Purpose:** Handles user registration and login.
**Imports:** AuthRequestDto, AuthResponseDto, RegisterDto, AcademicUser, UserRole, UserStatus, exceptions, AcademicUserRepository, JwtUtil, PasswordEncoder
**Class:** `AcademicAuthService`
**Fields:** `userRepository`, `passwordEncoder`, `jwtUtil`
**Methods:** `register(RegisterDto)`, `login(AuthRequestDto)`
**Annotations:** `@Service`
**Execution flow:** Register → check email → encode password → set status → save → generate token → return AuthResponseDto. Login → find user → check password → check status → generate token → return AuthResponseDto.
**Dependencies:** AcademicUserRepository, PasswordEncoder, JwtUtil
**Summary:** The authentication service.
**Likely faculty questions:** Why are mentors PENDING? Why use BCrypt?
**Common mistakes:** Not checking account status before login.

---

## 18. AdministrativeService.java

**Path:** `service/AdministrativeService.java`
**Purpose:** Computes platform statistics.
**Fields:** `userRepository`, `sessionRepository`, `subjectRepository`, `feedbackRepository`
**Methods:** `getPlatformStats()`, `getMentorDashboardStats(Long mentorId)`
**Annotations:** `@Service`
**Summary:** Aggregates counts from multiple repositories.

---

## 19. EnrollmentWorkflowService.java

**Path:** `service/EnrollmentWorkflowService.java`
**Purpose:** Handles enrollment workflow.
**Fields:** `enrollmentRepository`, `sessionRepository`, `userRepository`
**Methods:** `enrollLearner(Long, Long)`, `cancelEnrollment(Long, Long)`
**Annotations:** `@Service`, `@Transactional(rollbackFor=Exception.class)`
**Execution flow:** Enroll → find session → find learner → check status → check capacity → check duplicate → create enrollment → increment count → save both. Cancel → find enrollment → set DISCONTINUED → decrement count → save both.
**Dependencies:** SessionEnrollmentRepository, TutoringSessionRepository, AcademicUserRepository
**Summary:** Transactional enrollment management.
**Likely faculty questions:** Why `@Transactional`? What happens if one save fails?
**Common mistakes:** Not using transactions for multi-step operations.

---

## 20. FeedbackModerationService.java

**Path:** `service/FeedbackModerationService.java`
**Purpose:** Handles feedback submission (without enrollment check) and mentor performance.
**Fields:** `feedbackRepository`, `userRepository`, `sessionRepository`
**Methods:** `submitFeedback(Long, Long, Integer, String)`, `getMentorPerformance(Long)`
**Annotations:** `@Service`
**Summary:** Alternative feedback service without enrollment check.

---

## 21. FeedbackService.java

**Path:** `service/FeedbackService.java`
**Purpose:** Handles feedback submission (with enrollment check) and listing.
**Fields:** `feedbackRepository`, `userRepository`, `sessionRepository`, `enrollmentRepository`
**Methods:** `submitFeedback(Long, Long, Integer, String)`, `getAllFeedback()`
**Annotations:** `@Service`, `@Transactional(rollbackFor=Exception.class)`
**Execution flow:** Submit → find learner → find session → find enrollment → set feedbackSubmitted → save enrollment → create feedback → save feedback.
**Dependencies:** MentorFeedbackRepository, AcademicUserRepository, TutoringSessionRepository, SessionEnrollmentRepository
**Summary:** Transactional feedback service with enrollment check.
**Likely faculty questions:** Why check enrollment? What is the difference from FeedbackModerationService?
**Common mistakes:** Not checking if learner is enrolled.

---

## 22. SessionManagementService.java

**Path:** `service/SessionManagementService.java`
**Purpose:** Handles session CRUD and listing.
**Fields:** `sessionRepository`, `userRepository`, `subjectRepository`
**Methods:** `createSession(TutoringSession)`, `updateSession(Long, TutoringSession)`, `cancelSession(Long)`, `updateSessionStatus(Long, SessionStatus)`, `getAvailableSessions(Pageable)`
**Annotations:** `@Service`
**Summary:** Session management with validation.

---

## 23. AcademicUserRepository.java

**Path:** `repository/AcademicUserRepository.java`
**Purpose:** Database access for AcademicUser.
**Methods:** `findByEmail`, `existsByEmail`, `findByRole`, `countByRole`, `countByRoleAndStatus`
**Annotations:** `@Repository`
**Summary:** User repository with derived queries.

---

## 24. TutoringSessionRepository.java

**Path:** `repository/TutoringSessionRepository.java`
**Purpose:** Database access for TutoringSession.
**Methods:** `findByStatusIn`, `countByStatus`, `countByMentorId`, `countByMentorIdAndStatus`
**Annotations:** `@Repository`
**Summary:** Session repository with pagination support.

---

## 25. StudySubjectRepository.java

**Path:** `repository/StudySubjectRepository.java`
**Purpose:** Database access for StudySubject.
**Methods:** `findByName`, `getSubjectEnrollmentStats` (JPQL)
**Annotations:** `@Repository`
**Summary:** Subject repository with custom JPQL query.

---

## 26. SessionEnrollmentRepository.java

**Path:** `repository/SessionEnrollmentRepository.java`
**Purpose:** Database access for SessionEnrollment.
**Methods:** `findByLearnerId`, `existsByLearnerIdAndSessionId`, `findByLearnerIdAndSessionIdAndStatus`
**Annotations:** `@Repository`
**Summary:** Enrollment repository with composite key queries.

---

## 27. MentorFeedbackRepository.java

**Path:** `repository/MentorFeedbackRepository.java`
**Purpose:** Database access for MentorFeedback.
**Methods:** `getAverageRatingByMentorId` (JPQL), `countByMentorId`
**Annotations:** `@Repository`
**Summary:** Feedback repository with average rating query.

---

## 28. AuthController.java

**Path:** `controller/AuthController.java`
**Purpose:** Handles login and registration.
**Base URL:** `/api/auth`
**Endpoints:** `POST /login`, `POST /register`
**Fields:** `authService`
**Summary:** Public authentication endpoints.

---

## 29. UserController.java

**Path:** `controller/UserController.java`
**Purpose:** Handles user profile and status management.
**Base URL:** `/api/users`
**Endpoints:** `GET /mentors`, `GET /{id}`, `PUT /{id}/status`
**Fields:** `userRepository`
**Summary:** Direct repository access (no service layer).

---

## 30. SubjectController.java

**Path:** `controller/SubjectController.java`
**Purpose:** Handles subject CRUD.
**Base URL:** `/api/subjects`
**Endpoints:** `GET`, `POST`, `PUT /{id}`, `DELETE /{id}`
**Fields:** `subjectRepository`
**Summary:** Direct repository access.

---

## 31. SessionController.java

**Path:** `controller/SessionController.java`
**Purpose:** Handles session CRUD.
**Base URL:** `/api/sessions`
**Endpoints:** `GET`, `POST`, `PUT /{id}`, `PUT /{id}/status`, `DELETE /{id}`
**Fields:** `sessionManagementService`
**Summary:** Session management via service.

---

## 32. EnrollmentController.java

**Path:** `controller/EnrollmentController.java`
**Purpose:** Handles enrollment operations.
**Base URL:** `/api/enrollments`
**Endpoints:** `GET /my`, `POST /enroll`, `DELETE /cancel`
**Fields:** `enrollmentWorkflowService`, `sessionEnrollmentRepository`
**Annotations:** `@Transactional` (on getMyEnrollments)
**Summary:** Enrollment management with DTO conversion.

---

## 33. FeedbackController.java

**Path:** `controller/FeedbackController.java`
**Purpose:** Handles feedback submission and viewing.
**Base URL:** `/api/feedback`
**Endpoints:** `POST`, `GET`
**Fields:** `feedbackService`
**Annotations:** `@Transactional` (on both methods)
**Summary:** Feedback management with DTO conversion.

---

## 34. AnalyticsController.java

**Path:** `controller/AnalyticsController.java`
**Purpose:** Handles analytics endpoints.
**Base URL:** `/api/analytics`
**Endpoints:** `GET /stats`, `GET /mentor/{mentorId}`
**Fields:** `administrativeService`
**Summary:** Statistics for admins and mentors.

---

## 35. DataSeeder.java

**Path:** `config/DataSeeder.java`
**Purpose:** Seeds default data on startup.
**Fields:** `userRepository`, `subjectRepository`, `passwordEncoder`
**Methods:** `run(String... args)`, `seedSubject(String, String)`
**Annotations:** `@Component`, implements `CommandLineRunner`
**Summary:** Initializes subjects, admin, and support users.

---

## 36. JwtAuthenticationFilter.java

**Path:** `config/JwtAuthenticationFilter.java`
**Purpose:** JWT authentication filter.
**Fields:** `jwtUtil`, `academicUserRepository`
**Methods:** `doFilterInternal(HttpServletRequest, HttpServletResponse, FilterChain)`
**Annotations:** `@Component`, `@Autowired`
**Summary:** Runs on every request, validates JWT, sets authentication.

---

## 37. SecurityConfig.java

**Path:** `config/SecurityConfig.java`
**Purpose:** Security configuration.
**Fields:** `jwtAuthenticationFilter`
**Methods:** `passwordEncoder()`, `customOpenAPI()`, `securityFilterChain(HttpSecurity)`
**Annotations:** `@Configuration`, `@EnableWebSecurity`
**Summary:** Defines CORS, CSRF, session management, authorization rules, and JWT filter.

---

## 38. JwtUtil.java

**Path:** `util/JwtUtil.java`
**Purpose:** JWT utility class.
**Fields:** `secret`, `expirationTime`
**Methods:** `getSigningKey()`, `generateToken(String)`, `validateToken(String)`, `extractEmail(String)`
**Annotations:** `@Component`, `@Value`
**Summary:** Creates, validates, and parses JWT tokens.

---

## 39. BusinessValidationException.java

**Path:** `exception/BusinessValidationException.java`
**Purpose:** Exception for business rule violations.
**Fields:** `message`
**Annotations:** `@ResponseStatus(HttpStatus.BAD_REQUEST)`
**Summary:** Returns HTTP 400.

---

## 40. ResourceNotFoundException.java

**Path:** `exception/ResourceNotFoundException.java`
**Purpose:** Exception for missing resources.
**Fields:** `message`
**Annotations:** `@ResponseStatus(HttpStatus.NOT_FOUND)`
**Summary:** Returns HTTP 404.

---

## 41. GlobalExceptionHandler.java

**Path:** `exception/GlobalExceptionHandler.java`
**Purpose:** Global exception handler.
**Methods:** `handleBusinessValidation`, `handleResourceNotFound`, `handleGenericException`
**Annotations:** `@RestControllerAdvice`, `@ExceptionHandler`
**Summary:** Catches all exceptions and returns JSON error responses.

---

## 42. application.properties

**Path:** `resources/application.properties`
**Purpose:** Application configuration.
**Properties:** `spring.application.name`, `server.forward-headers-strategy`, `spring.datasource.*`, `spring.jpa.hibernate.ddl-auto`, `spring.jpa.show-sql`
**Summary:** Database connection, JPA settings, and app name.

---

## 43. pom.xml

**Path:** `backend/pom.xml`
**Purpose:** Maven build configuration.
**Dependencies:** Spring Web, Data JPA, Security, Validation, MySQL, JWT, Lombok, Mockito, TestNG, Spring Security Test, OpenAPI
**Summary:** Defines all project dependencies and build plugins.

---

## 44. DemoApplication.java (frontend)

**Path:** `frontend/src/App.jsx`
**Purpose:** Main React component (default Vite template).
**Summary:** Not the actual application UI — just the default template.

---

## 45. main.jsx

**Path:** `frontend/src/main.jsx`
**Purpose:** React entry point.
**Summary:** Mounts the React app into the DOM.

---

## 46. package.json

**Path:** `frontend/package.json`
**Purpose:** Frontend dependencies and scripts.
**Dependencies:** React 19, Vite 8
**Summary:** Basic Vite + React setup.
