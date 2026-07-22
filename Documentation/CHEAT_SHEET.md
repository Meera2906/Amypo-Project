# CHEAT_SHEET

Concise revision notes for the LoomLearn project.

---

## Quick Facts

| Item | Value |
|---|---|
| **Project Name** | LoomLearn (Academic Peer Tutoring System) |
| **Spring Boot Version** | 3.2.5 |
| **Java Version** | 17 |
| **Build Tool** | Maven |
| **Database** | MySQL (`loomlearn` at `localhost:3306`) |
| **Web Server** | Embedded Tomcat (port 8080) |
| **Frontend** | React 19 + Vite 8 (default template only) |
| **Authentication** | JWT (HS256) + BCrypt |
| **API Docs** | Swagger UI at `/swagger-ui.html` |

---

## Project Structure

```
backend/src/main/java/com/example/demo/
├── DemoApplication.java          ← Main entry point
├── config/
│   ├── SecurityConfig.java       ← Security rules, CORS, JWT
│   ├── JwtAuthenticationFilter.java ← JWT filter (runs every request)
│   └── DataSeeder.java           ← Seeds default data
├── controller/
│   ├── AuthController.java       ← /api/auth (login, register)
│   ├── UserController.java       ← /api/users (mentors, profile, status)
│   ├── SubjectController.java    ← /api/subjects (CRUD)
│   ├── SessionController.java    ← /api/sessions (CRUD, status)
│   ├── EnrollmentController.java ← /api/enrollments (enroll, cancel)
│   ├── FeedbackController.java   ← /api/feedback (submit, list)
│   └── AnalyticsController.java  ← /api/analytics (stats)
├── service/
│   ├── AcademicAuthService.java  ← Registration, login
│   ├── AdministrativeService.java ← Platform stats
│   ├── EnrollmentWorkflowService.java ← Enrollment (transactional)
│   ├── FeedbackModerationService.java ← Feedback (no enrollment check)
│   ├── FeedbackService.java      ← Feedback (with enrollment check, transactional)
│   └── SessionManagementService.java ← Session CRUD
├── repository/
│   ├── AcademicUserRepository.java
│   ├── TutoringSessionRepository.java
│   ├── StudySubjectRepository.java
│   ├── SessionEnrollmentRepository.java
│   └── MentorFeedbackRepository.java
├── entity/
│   ├── AcademicUser.java
│   ├── TutoringSession.java
│   ├── StudySubject.java
│   ├── SessionEnrollment.java
│   └── MentorFeedback.java
├── dto/
│   ├── AuthRequestDto.java
│   ├── AuthResponseDto.java
│   ├── RegisterDto.java
│   ├── SessionDto.java
│   ├── EnrollmentResponseDto.java
│   └── FeedbackResponseDto.java
├── enums/
│   ├── UserRole.java
│   ├── UserStatus.java
│   ├── EnrollmentStatus.java
│   └── SessionStatus.java
├── exception/
│   ├── BusinessValidationException.java  ← 400
│   ├── ResourceNotFoundException.java    ← 404
│   └── GlobalExceptionHandler.java       ← Catches all
└── util/
    └── JwtUtil.java          ← JWT create, validate, extract
```

---

## Entities & Tables

| Entity | Table | Key Fields | Relationships |
|---|---|---|---|
| AcademicUser | academic_users | id, fullName, email, password, role, status | Referenced by Session, Enrollment, Feedback |
| TutoringSession | tutoring_sessions | id, title, startTime, endTime, status | ManyToOne mentor (EAGER), ManyToOne subject (EAGER) |
| StudySubject | study_subjects | id, name (unique), description | Referenced by Session |
| SessionEnrollment | session_enrollments | id, status, feedbackSubmitted | ManyToOne learner (LAZY), ManyToOne session (LAZY) |
| MentorFeedback | mentor_feedback | id, rating, comment | ManyToOne learner (LAZY), ManyToOne mentor (LAZY), OneToOne session (EAGER, unique) |

---

## Enums

| Enum | Values |
|---|---|
| UserRole | LEARNER, MENTOR, ACADEMIC_ADMIN, SUPPORT_AGENT |
| UserStatus | PENDING, APPROVED, REJECTED, BLOCKED |
| EnrollmentStatus | ENROLLED, ATTENDED, CANCELLED, DISCONTINUED |
| SessionStatus | SCHEDULED, ACTIVE, COMPLETED, CANCELLED |

---

## Controllers & Endpoints

| Controller | Base URL | Endpoints | Auth |
|---|---|---|---|
| AuthController | /api/auth | POST /login, POST /register | Public |
| UserController | /api/users | GET /mentors, GET /{id}, PUT /{id}/status | Authenticated / Admin |
| SubjectController | /api/subjects | GET, POST, PUT /{id}, DELETE /{id} | Authenticated / Admin |
| SessionController | /api/sessions | GET, POST, PUT /{id}, PUT /{id}/status, DELETE /{id} | Authenticated |
| EnrollmentController | /api/enrollments | GET /my, POST /enroll, DELETE /cancel | LEARNER |
| FeedbackController | /api/feedback | POST, GET | LEARNER / Admin+Support |
| AnalyticsController | /api/analytics | GET /stats, GET /mentor/{id} | Admin / MENTOR |

---

## Services & Key Methods

| Service | Key Methods | Transactional |
|---|---|---|
| AcademicAuthService | register(), login() | No |
| AdministrativeService | getPlatformStats(), getMentorDashboardStats() | No |
| EnrollmentWorkflowService | enrollLearner(), cancelEnrollment() | Yes |
| FeedbackModerationService | submitFeedback(), getMentorPerformance() | No |
| FeedbackService | submitFeedback(), getAllFeedback() | Yes (submitFeedback) |
| SessionManagementService | createSession(), updateSession(), cancelSession(), updateSessionStatus(), getAvailableSessions() | No |

---

## Repositories & Key Methods

| Repository | Key Methods |
|---|---|
| AcademicUserRepository | findByEmail, existsByEmail, findByRole, countByRole, countByRoleAndStatus |
| TutoringSessionRepository | findByStatusIn (paginated), countByStatus, countByMentorId, countByMentorIdAndStatus |
| StudySubjectRepository | findByName, getSubjectEnrollmentStats (JPQL) |
| SessionEnrollmentRepository | findByLearnerId, existsByLearnerIdAndSessionId, findByLearnerIdAndSessionIdAndStatus |
| MentorFeedbackRepository | getAverageRatingByMentorId (JPQL), countByMentorId |

---

## Security Rules

| URL Pattern | Access |
|---|---|
| `/`, `/api/auth/**` | Public |
| `/swagger-ui/**`, `/v3/api-docs/**` | Public |
| `PUT /api/users/*/status` | ACADEMIC_ADMIN, ADMIN |
| `POST/PUT/DELETE /api/subjects/**` | ACADEMIC_ADMIN, ADMIN |
| `/api/enrollments/**` | LEARNER |
| `POST /api/feedback` | LEARNER |
| `GET /api/feedback` | ACADEMIC_ADMIN, ADMIN, SUPPORT_AGENT, SUPPORT |
| `/api/analytics/stats` | ACADEMIC_ADMIN, ADMIN |
| `/api/analytics/mentor/**` | MENTOR |
| Any other | Authenticated |

---

## JWT Flow

```
1. Client → POST /api/auth/login {email, password}
2. Server → BCrypt.verify(password) → check status → JWT.generate(email)
3. Server → Return {id, token, fullName, email, role}
4. Client → Store token → Send in Authorization: Bearer <token>
5. JwtAuthenticationFilter → Extract token → Validate → Extract email → Find user → Check approved → Set authentication
6. Spring Security → Check role → Forward to controller
```

---

## Transactional Methods (Critical)

| Method | Operations | Why Transactional |
|---|---|---|
| enrollLearner | UPDATE session (increment count) + INSERT enrollment | Both must succeed or both fail |
| cancelEnrollment | UPDATE enrollment (status) + UPDATE session (decrement count) | Both must succeed or both fail |
| submitFeedback | UPDATE enrollment (feedbackSubmitted) + INSERT feedback | Both must succeed or both fail |

---

## DTOs

| DTO | Purpose | from() Method |
|---|---|---|
| AuthRequestDto | Login request (email, password) | No |
| AuthResponseDto | Login response (token, user details) | No (builder) |
| RegisterDto | Registration request | No |
| SessionDto | Flattened session (not used) | No |
| EnrollmentResponseDto | Flattened enrollment | Yes |
| FeedbackResponseDto | Flattened feedback | Yes |

---

## Key Annotations

| Annotation | Used On | Purpose |
|---|---|---|
| @SpringBootApplication | DemoApplication | Start app, auto-configure, scan |
| @RestController | All controllers | REST endpoints |
| @Service | All services | Business logic |
| @Repository | All repositories | Data access |
| @Entity | All entities | Map to DB table |
| @Transactional | 3 service methods | Data consistency |
| @RequestBody | Controller params | JSON → Java |
| @PathVariable | Controller params | URL path value |
| @RequestParam | Controller params | URL query value |
| @ManyToOne | Entity fields | Many-to-one relationship |
| @OneToOne | Entity fields | One-to-one relationship |
| @JoinColumn | Entity fields | Foreign key column |
| @Enumerated(STRING) | Entity fields | Store enum as text |
| @JsonProperty(READ_ONLY) | Entity fields | Prevent JSON input |
| @RestControllerAdvice | GlobalExceptionHandler | Global exception handling |
| @ResponseStatus | Exception classes | HTTP status code |
| @Query | Repository methods | Custom JPQL |
| @Param | Repository params | Bind to JPQL parameter |
| @Value | JwtUtil fields | Inject from properties |
| @Component | Config/util classes | Auto-discover bean |
| @Configuration | SecurityConfig | Configuration class |
| @EnableWebSecurity | SecurityConfig | Enable Spring Security |
| @Bean | SecurityConfig methods | Create managed bean |
| @Autowired | JwtAuthenticationFilter | Inject dependency |
| @Transactional | Service methods | Database transaction |

---

## LazyInitializationException Prevention

```
Problem: Accessing lazy-loaded associations after JPA session closes
Solution: Use @Transactional on the method that calls DTO.from()
Example: EnrollmentController.getMyEnrollments() is @Transactional
         → calls EnrollmentResponseDto.from() inside transaction
         → lazy associations (learner, session) can be loaded
```

---

## Database Relationships

```
academic_users (1) ← (many) tutoring_sessions [mentor_id, EAGER]
academic_users (1) ← (many) session_enrollments [learner_id, LAZY]
academic_users (1) ← (many) mentor_feedback [learner_id, LAZY]
academic_users (1) ← (many) mentor_feedback [mentor_id, LAZY]
study_subjects (1) ← (many) tutoring_sessions [subject_id, EAGER]
tutoring_sessions (1) ← (many) session_enrollments [session_id, LAZY]
tutoring_sessions (1) ← (1) mentor_feedback [session_id, EAGER, UNIQUE]
```

---

## Default Seeded Data

| Email | Password | Role | Status |
|---|---|---|---|
| admin@loomlearn.com | admin123 | ACADEMIC_ADMIN | APPROVED |
| support@loomlearn.com | support123 | SUPPORT_AGENT | APPROVED |

**Subjects:** Mathematics, Physics, Computer Science, Chemistry

---

## Common Error Responses

| Exception | HTTP Status | When |
|---|---|---|
| BusinessValidationException | 400 | Invalid input, duplicate email, capacity exceeded |
| ResourceNotFoundException | 404 | User/session/subject/enrollment not found |
| Generic Exception | 500 | Unexpected errors |

---

## Key Business Rules

1. **Registration:** Email must be unique. Password is BCrypt-hashed. Mentors get PENDING status. Others get APPROVED.
2. **Login:** Password must match. Account must be APPROVED (not PENDING/BLOCKED).
3. **Enrollment:** Session must be SCHEDULED. Capacity must not be exceeded. No duplicate enrollment.
4. **Feedback:** Learner must be enrolled in the session. feedbackSubmitted flag prevents duplicates.
5. **Session Status:** Cannot change status of COMPLETED or CANCELLED sessions.
6. **Session Cancellation:** Sets status to CANCELLED (doesn't delete).
7. **Role-based Access:** LEARNER can enroll. ADMIN can manage users/subjects. MENTOR can see own stats. SUPPORT can view feedback.

---

## Maven Dependencies (Key)

| Dependency | Purpose |
|---|---|
| spring-boot-starter-web | Web server, REST APIs |
| spring-boot-starter-data-jpa | Database access, Hibernate |
| spring-boot-starter-security | Security framework |
| mysql-connector-j | MySQL JDBC driver |
| jjwt-api/impl/jackson | JWT creation and parsing |
| springdoc-openapi-starter-webmvc-ui | Swagger UI |
| spring-boot-starter-validation | Bean validation (not used yet) |
| lombok | Reduce boilerplate (not used yet) |
| mockito/testng/spring-security-test | Testing (no tests exist) |

---

## Application Properties

```properties
spring.application.name=demo
server.forward-headers-strategy=framework
spring.datasource.url=jdbc:mysql://localhost:3306/loomlearn
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
# JWT (not in file, uses defaults)
# loomlearn.jwt.secret=defaultSecretKeyWithAtLeast256BitsLengthToAvoidWeakExceptions!
# loomlearn.jwt.expiration=86400000 (24 hours)
```

---

## How to Run

```bash
# Backend
cd backend
./mvnw spring-boot:run

# Or build and run JAR
./mvnw clean package
java -jar target/demo-0.0.1-SNAPSHOT.jar

# Swagger UI
http://localhost:8080/swagger-ui.html

# Default users
admin@loomlearn.com / admin123
support@loomlearn.com / support123
```

---

## Most Important Concepts to Remember

1. **Layered Architecture:** Controller → Service → Repository → Database
2. **JWT Authentication:** Login → Get token → Send in Authorization header → Filter validates → Spring Security checks role
3. **Transactional:** enrollLearner, cancelEnrollment, submitFeedback — all modify multiple tables, need transactions
4. **LazyInitializationException:** Prevented by @Transactional + DTO.from() methods
5. **DTOs:** Flatten entities, prevent security issues, avoid lazy loading problems
6. **Role-based Access:** Defined in SecurityConfig, checked by Spring Security
7. **Derived Queries:** Spring generates SQL from method names (findByEmail, countByRole, etc.)
8. **Builder Pattern:** Used in entities and DTOs for object creation
9. **@JsonProperty(READ_ONLY):** Security — prevents setting password/role/status from JSON
10. **@Enumerated(STRING):** Stores enums as text, not numbers
