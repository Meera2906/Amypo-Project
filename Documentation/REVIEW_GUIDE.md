# REVIEW_GUIDE

A structured study plan for mastering the LoomLearn project.

---

## One-Day Study Plan

### Morning (3 hours)

**Hour 1: Project Overview & Architecture**
- Read `PROJECT_OVERVIEW.md`
- Read `FOLDER_STRUCTURE.md`
- Understand the layered architecture (Controller → Service → Repository → Database)
- Know the technologies: Spring Boot 3.2.5, Java 17, MySQL, JWT, BCrypt

**Hour 2: Entities & Database**
- Read `ENTITIES.md`
- Read `DATABASE.md`
- Understand the 5 entities: AcademicUser, TutoringSession, StudySubject, SessionEnrollment, MentorFeedback
- Know the relationships: ManyToOne, OneToOne, Lazy vs Eager
- Understand the 4 enums: UserRole, UserStatus, EnrollmentStatus, SessionStatus

**Hour 3: Configuration & Properties**
- Read `CONFIGURATION.md`
- Read `APPLICATION_PROPERTIES.md`
- Read `POM.md`
- Know how the app starts (DemoApplication → Spring Boot → DataSeeder)
- Know the database connection (MySQL at localhost:3306/loomlearn)
- Know the security setup (JWT, BCrypt, CORS, CSRF disabled, stateless)

### Afternoon (3 hours)

**Hour 4: Repositories**
- Read `REPOSITORIES.md`
- Understand JpaRepository and derived queries
- Know the 5 repositories and their custom methods
- Understand @Query and JPQL

**Hour 5: Services**
- Read `SERVICES.md`
- Understand the 6 services and their business logic
- Know which methods are @Transactional and why
- Understand the enrollment workflow and feedback workflow

**Hour 6: Controllers & API Flow**
- Read `CONTROLLERS.md`
- Read `API_FLOW.md`
- Know all 7 controllers and their endpoints
- Understand role-based access control (who can access what)

### Evening (2 hours)

**Hour 7: DTOs, Exceptions, Concepts**
- Read `DTOS.md`
- Read `SPRING_BOOT_CONCEPTS.md`
- Understand why DTOs are used (security, lazy loading, flattening)
- Know the exception handling (GlobalExceptionHandler, BusinessValidationException, ResourceNotFoundException)

**Hour 8: Annotations & Viva Questions**
- Read `ANNOTATIONS.md`
- Read `VIVA_QUESTIONS.md`
- Practice answering viva questions
- Review `CHEAT_SHEET.md`

---

## Important Files (Must Know)

These files are the most critical to understand. If you know these well, you can answer most questions.

| File | Why It's Critical |
|---|---|
| `DemoApplication.java` | Main entry point. Knows how Spring Boot starts. |
| `SecurityConfig.java` | Defines all security rules. Knows CORS, CSRF, JWT, role-based access. |
| `JwtAuthenticationFilter.java` | Runs on every request. Knows how JWT authentication works. |
| `JwtUtil.java` | Creates, validates, and parses JWT tokens. Knows HS256 algorithm. |
| `AcademicAuthService.java` | Handles registration and login. Knows BCrypt, JWT, account status checks. |
| `EnrollmentWorkflowService.java` | Enrollment logic with @Transactional. Knows capacity checks, duplicate checks. |
| `FeedbackService.java` | Feedback logic with @Transactional. Knows enrollment check, feedbackSubmitted flag. |
| `SessionManagementService.java` | Session CRUD with validation. Knows mentor/subject resolution. |
| `GlobalExceptionHandler.java` | Centralized exception handling. Knows HTTP status codes. |
| `AcademicUser.java` | Central entity. Knows @JsonProperty(READ_ONLY), @Enumerated(STRING), builder pattern. |
| `application.properties` | Database config, JPA settings. Knows ddl-auto=update, show-sql=true. |
| `pom.xml` | All dependencies. Knows Spring Web, Data JPA, Security, MySQL, JWT. |

---

## Medium Priority Files

These files are important but less likely to be the focus of viva questions.

| File | Why It's Important |
|---|---|
| `DataSeeder.java` | Knows CommandLineRunner, idempotent seeding. |
| `AdministrativeService.java` | Knows platform statistics aggregation. |
| `FeedbackModerationService.java` | Knows the difference from FeedbackService. |
| `TutoringSession.java` | Knows EAGER fetch for mentor/subject. |
| `SessionEnrollment.java` | Knows LAZY fetch, feedbackSubmitted flag. |
| `MentorFeedback.java` | Knows @OneToOne for session, unique constraint. |
| `EnrollmentResponseDto.java` | Knows from() factory method, LazyInitializationException. |
| `FeedbackResponseDto.java` | Knows from() factory method, LazyInitializationException. |
| `AuthResponseDto.java` | Knows builder pattern, JWT token in response. |
| `SubjectController.java` | Knows direct repository access (no service). |
| `UserController.java` | Knows direct repository access, password exposure concern. |
| `StudySubjectRepository.java` | Knows custom JPQL query for enrollment stats. |
| `MentorFeedbackRepository.java` | Knows @Query with @Param, AVG function. |

---

## Optional Files

These files are less likely to be asked about in viva, but you should be aware of them.

| File | Notes |
|---|---|
| `SessionDto.java` | Not currently used by any controller. |
| `AuthRequestDto.java` | Simple DTO with email and password. |
| `RegisterDto.java` | Simple DTO for registration. |
| `EnrollmentController.java` | Knows @Transactional for DTO conversion. |
| `FeedbackController.java` | Knows @Transactional for DTO conversion. |
| `AnalyticsController.java` | Simple controller delegating to service. |
| `SessionController.java` | Knows Pageable for pagination. |
| `AcademicUserRepository.java` | Knows derived queries (findByEmail, countByRole, etc.). |
| `TutoringSessionRepository.java` | Knows findByStatusIn with Pageable. |
| `SessionEnrollmentRepository.java` | Knows composite key queries. |
| `BusinessValidationException.java` | Simple exception with @ResponseStatus(400). |
| `ResourceNotFoundException.java` | Simple exception with @ResponseStatus(404). |
| `frontend/src/App.jsx` | Default Vite template, not the actual app. |
| `frontend/src/main.jsx` | React entry point. |
| `frontend/package.json` | React 19 + Vite 8. |
| `LoomLearn_SRS.md` | Software Requirements Specification (project plan). |
| `backend/.mvn/wrapper/maven-wrapper.properties` | Maven wrapper configuration. |
| `backend/mvnw` | Maven wrapper script. |

---

## Key Concepts to Master

### 1. Spring Boot Fundamentals
- `@SpringBootApplication` = `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan`
- Dependency Injection via constructor injection
- Bean lifecycle and component scanning
- Auto-configuration

### 2. Spring Security & JWT
- JWT structure (header.payload.signature)
- HS256 signing algorithm
- `OncePerRequestFilter` runs on every request
- `SecurityContextHolder` stores the authenticated user
- Role-based access control (`hasRole`, `hasAnyRole`)
- BCrypt password encoding
- Stateless session management
- CORS and CSRF configuration

### 3. Spring Data JPA
- `@Entity`, `@Table`, `@Id`, `@GeneratedValue`
- `@ManyToOne`, `@OneToOne`, `@JoinColumn`
- Lazy vs Eager fetching
- Derived queries (findByEmail, countByRole, etc.)
- `@Query` with JPQL and `@Param`
- `Pageable` and `Page<T>` for pagination
- `@Transactional` for data consistency
- `LazyInitializationException` and how to prevent it

### 4. REST API Design
- `@RestController`, `@RequestMapping`, `@GetMapping`, `@PostMapping`, etc.
- `@RequestBody`, `@PathVariable`, `@RequestParam`
- `ResponseEntity<T>` for HTTP status codes
- DTOs for data transfer
- Exception handling with `@RestControllerAdvice`

### 5. Database Design
- 5 tables with foreign key relationships
- Enums stored as strings (`@Enumerated(STRING)`)
- Unique constraints (email, subject name, session_id in feedback)
- `ddl-auto=update` for schema generation
- Transactions for multi-step operations

### 6. Business Logic
- Registration: email uniqueness, password encoding, status assignment
- Login: password verification, account status check
- Enrollment: capacity check, duplicate check, status check
- Feedback: enrollment check, feedbackSubmitted flag
- Session management: validation, status transitions
