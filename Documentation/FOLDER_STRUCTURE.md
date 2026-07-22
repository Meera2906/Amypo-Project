# FOLDER STRUCTURE

This document explains every package (folder) in the backend and why it exists.

---

## Root Package: `com.example.demo`

The entire backend lives under the Java package `com.example.demo`. This is the **root package**. All sub-packages are inside it.

```
com.example.demo/
├── DemoApplication.java     ← Main entry point (the "main" method)
├── config/                  ← Configuration classes
├── controller/              ← REST API endpoints
├── service/                 ← Business logic
├── repository/              ← Database access (Spring Data JPA)
├── entity/                  ← Database table representations
├── dto/                     ← Data Transfer Objects
├── enums/                   ← Enumerations (fixed lists of values)
├── exception/               ← Custom exceptions and error handling
└── util/                    ← Utility/helper classes
```

---

## 1. `config/` — Configuration Package

**Why it exists:** This package holds classes that configure how the application works. Think of it as the "settings" of the app.

### Files:

| File | Purpose |
|---|---|
| `DataSeeder.java` | Runs when the app starts. Inserts default subjects (Math, Physics, etc.) and default admin/support users into the database. Implements `CommandLineRunner`. |
| `JwtAuthenticationFilter.java` | A security filter that runs on every HTTP request. It reads the JWT token from the `Authorization` header, validates it, and if valid, tells Spring Security who the user is. Extends `OncePerRequestFilter`. |
| `SecurityConfig.java` | The main security configuration. Defines which URLs are public (like `/api/auth/**`), which require login, which roles can access what, CORS settings, CSRF settings, and creates the `PasswordEncoder` and `OpenAPI` beans. |

---

## 2. `controller/` — Controller Package

**Why it exists:** Controllers are the "front door" of the application. They receive HTTP requests from clients (browsers, mobile apps) and return HTTP responses. Each controller handles one group of related features.

### Files:

| File | Purpose |
|---|---|
| `AuthController.java` | Handles user login and registration. Mapped to `/api/auth`. |
| `UserController.java` | Handles user profile viewing and status updates. Mapped to `/api/users`. |
| `SubjectController.java` | Handles CRUD operations for study subjects. Mapped to `/api/subjects`. |
| `SessionController.java` | Handles CRUD operations for tutoring sessions. Mapped to `/api/sessions`. |
| `EnrollmentController.java` | Handles learner enrollment in sessions. Mapped to `/api/enrollments`. |
| `FeedbackController.java` | Handles feedback submission and viewing. Mapped to `/api/feedback`. |
| `AnalyticsController.java` | Handles platform statistics and mentor dashboards. Mapped to `/api/analytics`. |

**Key concept:** Every controller is annotated with `@RestController`, which means Spring automatically converts the return value into JSON and sends it as an HTTP response.

---

## 3. `service/` — Service Package

**Why it exists:** Services contain the **business logic** — the actual rules and workflows of the application. Controllers are thin (they just receive requests and return responses), but services do the real work.

### Files:

| File | Purpose |
|---|---|
| `AcademicAuthService.java` | Handles user registration and login logic. Checks email uniqueness, encodes passwords, validates account status, generates JWT tokens. |
| `AdministrativeService.java` | Computes platform-wide statistics (total learners, mentors, sessions, etc.) and mentor-specific dashboard stats. |
| `EnrollmentWorkflowService.java` | Handles the enrollment workflow: enrolling a learner in a session (with capacity checks) and canceling enrollment. Both methods are `@Transactional`. |
| `FeedbackModerationService.java` | Handles feedback submission (without enrollment check) and mentor performance stats. |
| `FeedbackService.java` | Handles feedback submission (with enrollment check) and listing all feedback. |
| `SessionManagementService.java` | Handles session creation, update, cancellation, status changes, and listing available sessions. |

**Key concept:** Services are annotated with `@Service`. They receive their dependencies (repositories) through **constructor injection** — Spring automatically passes the right repository when creating the service.

---

## 4. `repository/` — Repository Package

**Why it exists:** Repositories are the "data access layer." They talk to the database. In Spring Data JPA, you define an interface that extends `JpaRepository`, and Spring automatically implements it at runtime — you get CRUD methods (save, findById, deleteById, etc.) for free.

### Files:

| File | Purpose |
|---|---|
| `AcademicUserRepository.java` | Database access for `AcademicUser`. Custom methods: `findByEmail`, `existsByEmail`, `findByRole`, `countByRole`, `countByRoleAndStatus`. |
| `TutoringSessionRepository.java` | Database access for `TutoringSession`. Custom methods: `findByStatusIn` (paginated), `countByStatus`, `countByMentorId`, `countByMentorIdAndStatus`. |
| `StudySubjectRepository.java` | Database access for `StudySubject`. Custom methods: `findByName`, `getSubjectEnrollmentStats` (JPQL query). |
| `SessionEnrollmentRepository.java` | Database access for `SessionEnrollment`. Custom methods: `findByLearnerId`, `existsByLearnerIdAndSessionId`, `findByLearnerIdAndSessionIdAndStatus`. |
| `MentorFeedbackRepository.java` | Database access for `MentorFeedback`. Custom methods: `getAverageRatingByMentorId` (JPQL query), `countByMentorId`. |

**Key concept:** Repositories are interfaces annotated with `@Repository`. Spring Data JPA generates the implementation automatically. Method names like `findByEmail` are parsed by Spring to generate the corresponding SQL.

---

## 5. `entity/` — Entity Package

**Why it exists:** Entities are Java classes that represent **database tables**. Each entity class maps to one table. The fields map to columns, and annotations like `@ManyToOne` define relationships between tables.

### Files:

| File | Purpose | Table |
|---|---|---|
| `AcademicUser.java` | Represents a user (learner, mentor, admin, or support agent). | `academic_users` |
| `TutoringSession.java` | Represents a tutoring session created by a mentor. | `tutoring_sessions` |
| `StudySubject.java` | Represents a study subject (e.g., Mathematics, Physics). | `study_subjects` |
| `SessionEnrollment.java` | Represents a learner's enrollment in a session. | `session_enrollments` |
| `MentorFeedback.java` | Represents feedback a learner gives to a mentor. | `mentor_feedback` |

**Key concept:** Entities are annotated with `@Entity` and `@Table(name = "...")`. The `@Id` annotation marks the primary key. Relationships are defined with `@ManyToOne`, `@OneToOne`, etc.

---

## 6. `dto/` — Data Transfer Object Package

**Why it exists:** DTOs are plain Java objects used to **transfer data** between the frontend and backend. They are used instead of entities because:
- Entities may contain sensitive data (like passwords) that should not be sent to the client.
- Entities may have circular references (e.g., User → Session → User) that cause infinite loops in JSON serialization.
- DTOs allow you to flatten nested objects (e.g., include the mentor's name directly in a session response instead of the entire user object).

### Files:

| File | Purpose |
|---|---|
| `AuthRequestDto.java` | Used for login requests. Contains `email` and `password`. |
| `AuthResponseDto.java` | Returned after login/registration. Contains `id`, `token`, `fullName`, `email`, `role`. |
| `RegisterDto.java` | Used for registration requests. Contains `fullName`, `email`, `password`, `role`, `department`, `bio`. |
| `SessionDto.java` | A flattened view of a session. Contains session fields plus `mentorName` and `subjectName` (instead of full objects). |
| `EnrollmentResponseDto.java` | A flattened view of an enrollment. Contains enrollment fields plus learner and session details. Has a static `from()` factory method. |
| `FeedbackResponseDto.java` | A flattened view of feedback. Contains feedback fields plus learner, mentor, and session details. Has a static `from()` factory method. |

**Key concept:** DTOs are simple classes with private fields, getters, and setters. They are NOT entities — they do not map to database tables.

---

## 7. `enums/` — Enumerations Package

**Why it exists:** Enums define **fixed sets of values** that are used throughout the application. For example, a user's role can only be one of `LEARNER`, `MENTOR`, `ACADEMIC_ADMIN`, or `SUPPORT_AGENT` — it cannot be anything else.

### Files:

| File | Values | Purpose |
|---|---|---|
| `UserRole.java` | `LEARNER`, `MENTOR`, `ACADEMIC_ADMIN`, `SUPPORT_AGENT` | Defines the type of a user. |
| `UserStatus.java` | `PENDING`, `APPROVED`, `REJECTED`, `BLOCKED` | Defines the status of a user account. |
| `EnrollmentStatus.java` | `ENROLLED`, `ATTENDED`, `CANCELLED`, `DISCONTINUED` | Defines the status of an enrollment. |
| `SessionStatus.java` | `SCHEDULED`, `ACTIVE`, `COMPLETED`, `CANCELLED` | Defines the status of a tutoring session. |

**Key concept:** Enums are stored in the database as text strings (because of `@Enumerated(EnumType.STRING)`). This is more readable than storing them as numbers (0, 1, 2, 3).

---

## 8. `exception/` — Exception Package

**Why it exists:** This package contains custom exception classes and a global exception handler. Instead of letting errors crash the application, the system catches them and returns a clean JSON error message to the client.

### Files:

| File | Purpose |
|---|---|
| `BusinessValidationException.java` | Thrown when a business rule is violated (e.g., "Email already exists", "Session capacity exceeded"). Returns HTTP 400 (Bad Request). Annotated with `@ResponseStatus(HttpStatus.BAD_REQUEST)`. |
| `ResourceNotFoundException.java` | Thrown when a requested resource does not exist (e.g., "User not found", "Session not found"). Returns HTTP 404 (Not Found). Annotated with `@ResponseStatus(HttpStatus.NOT_FOUND)`. |
| `GlobalExceptionHandler.java` | A `@RestControllerAdvice` that catches all exceptions. Has specific handlers for `BusinessValidationException` (400), `ResourceNotFoundException` (404), and a generic handler for any other exception (500). Returns a JSON map with a "message" key. |

**Key concept:** `@RestControllerAdvice` is a special annotation that lets you handle exceptions globally — you write the handler once, and it applies to all controllers.

---

## 9. `util/` — Utility Package

**Why it exists:** This package holds helper classes that don't fit into any other category. These are typically stateless tools used across the application.

### Files:

| File | Purpose |
|---|---|
| `JwtUtil.java` | A `@Component` that handles JWT (JSON Web Token) operations: generating tokens, validating tokens, and extracting the email from a token. Reads the secret key and expiration time from `application.properties`. |

**Key concept:** `@Component` means Spring automatically discovers and creates this class as a bean. It can then be injected into any other class that needs it (like `AcademicAuthService` or `JwtAuthenticationFilter`).

---

## 10. Root Package (directly in `com.example.demo`)

### Files:

| File | Purpose |
|---|---|
| `DemoApplication.java` | The main entry point of the application. Contains the `public static void main(String[] args)` method. Annotated with `@SpringBootApplication`, which is a combination of `@Configuration`, `@EnableAutoConfiguration`, and `@ComponentScan`. |

---

## `resources/` — Resource Folder

**Why it exists:** This folder holds non-Java files that the application needs at runtime.

### Files:

| File | Purpose |
|---|---|
| `application.properties` | Configuration file. Contains database connection details, JPA settings, and application name. |

---

## `frontend/` — React Frontend

**Why it exists:** The frontend is a React application built with Vite. It provides the user interface that users interact with in their browser.

### Structure:

| Path | Purpose |
|---|---|
| `package.json` | Lists frontend dependencies and scripts. Uses React 19 and Vite 8. |
| `public/favicon.svg` | The favicon (browser tab icon). |
| `public/icons.svg` | SVG icon sprites used by the default Vite template. |
| `src/App.jsx` | The main React component (currently the default Vite template). |
| `src/main.jsx` | The entry point — mounts the React app into the DOM. |
| `src/App.css` | Styles for the default template. |
| `src/index.css` | Global CSS styles. |
| `src/assets/` | Image assets (hero.png, react.svg, vite.svg). |

> **Note:** The frontend currently only has the default Vite + React template. The full frontend described in the SRS (with Redux Toolkit, React Router, Axios, and all the pages/components) is planned but not yet implemented.
