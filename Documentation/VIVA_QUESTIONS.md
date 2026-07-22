# VIVA_QUESTIONS

100 likely viva questions with answers and follow-up questions.

---

## Spring Boot Fundamentals

### Q1: What is Spring Boot and why is it used?
**A:** Spring Boot is a framework that simplifies Spring development. It provides auto-configuration, embedded servers (Tomcat), and starter dependencies. It reduces boilerplate configuration.
**Follow-up:** What is auto-configuration?

### Q2: What does `@SpringBootApplication` do?
**A:** It's a combination of `@Configuration`, `@EnableAutoConfiguration`, and `@ComponentScan`. It tells Spring to start the application, auto-configure everything, and scan for components.
**Follow-up:** What is the difference between `@Configuration` and `@ComponentScan`?

### Q3: What is Dependency Injection?
**A:** DI is a design pattern where Spring creates objects and injects their dependencies automatically. Instead of using `new`, Spring manages object creation.
**Follow-up:** What are the different types of dependency injection in Spring?

### Q4: What is a Bean in Spring?
**A:** A Bean is an object managed by the Spring container. Spring creates, configures, and manages the lifecycle of beans.
**Follow-up:** How are beans created?

### Q5: What is Component Scanning?
**A:** Component scanning is the process by which Spring automatically discovers beans in the classpath. It scans for `@Component`, `@Service`, `@Repository`, `@RestController`.
**Follow-up:** What package does it scan by default?

### Q6: What is the difference between `@Component`, `@Service`, and `@Repository`?
**A:** They are all stereotypes that tell Spring to discover and create the class as a bean. `@Service` is for service layer, `@Repository` is for data access (adds exception translation), `@Component` is generic.
**Follow-up:** Does `@Repository` do anything special?

### Q7: What is the Spring Boot Maven plugin?
**A:** It packages the application as an executable JAR with an embedded web server. You can run it with `java -jar`.
**Follow-up:** What is an embedded server?

### Q8: What is the difference between `@Bean` and `@Component`?
**A:** `@Component` is a class-level annotation for auto-discovery. `@Bean` is a method-level annotation that returns an object Spring should manage.
**Follow-up:** When would you use `@Bean` instead of `@Component`?

---

## Spring Security & JWT

### Q9: How does authentication work in this project?
**A:** Users log in with email and password. The server verifies the password with BCrypt, checks account status, and returns a JWT token. The client sends this token in the `Authorization: Bearer <token>` header for all subsequent requests.
**Follow-up:** What is BCrypt?

### Q10: What is a JWT and how is it structured?
**A:** JWT (JSON Web Token) has three parts: header.payload.signature. The header contains the algorithm (HS256). The payload contains claims (subject, issued at, expiration). The signature is HMAC SHA-256 of header + payload + secret key.
**Follow-up:** What is HS256?

### Q11: What does the JwtAuthenticationFilter do?
**A:** It runs on every HTTP request. It extracts the JWT from the Authorization header, validates it, extracts the email, looks up the user, checks if approved, and creates an authentication object stored in SecurityContextHolder.
**Follow-up:** What is SecurityContextHolder?

### Q12: Why is CSRF disabled in this project?
**A:** CSRF is disabled because the API is stateless (uses JWT, not cookies). CSRF protection is mainly needed for cookie-based authentication.
**Follow-up:** What is CSRF?

### Q13: What is stateless session management?
**A:** The server does not store any session data. Each request must include the JWT token. The server does not use cookies to track sessions.
**Follow-up:** What is the alternative?

### Q14: What is BCrypt and why is it used?
**A:** BCrypt is a one-way hashing algorithm with a salt. It encrypts passwords so they can't be reversed. Even if two users have the same password, their hashes are different.
**Follow-up:** What is a salt?

### Q15: How does role-based access control work?
**A:** The JwtAuthenticationFilter creates `SimpleGrantedAuthority` objects based on the user's role. Spring Security checks these authorities against the URL rules in `SecurityConfig`. For example, `/api/enrollments/**` requires `ROLE_LEARNER`.
**Follow-up:** What is the difference between `hasRole` and `hasAnyRole`?

### Q16: What is the difference between authentication and authorization?
**A:** Authentication is verifying who the user is (login). Authorization is checking what the user can do (access control).
**Follow-up:** Which one does JWT handle?

### Q17: What is SecurityContextHolder?
**A:** It's a class that stores the current security context (including the authenticated user) for the current thread. Spring Security uses it to check who is making the request.
**Follow-up:** How is it populated?

### Q18: What is CORS and how is it configured?
**A:** CORS (Cross-Origin Resource Sharing) allows web pages to make requests to a different domain. It's configured in `SecurityConfig` to allow requests from `http://localhost:3000` (the frontend).
**Follow-up:** Why is CORS needed?

---

## Spring Data JPA & Hibernate

### Q19: What is JPA?
**A:** JPA (Java Persistence API) is a specification for mapping Java objects to relational databases. Hibernate is the implementation.
**Follow-up:** What is the difference between JPA and Hibernate?

### Q20: What is an Entity?
**A:** An entity is a Java class that represents a database table. It's annotated with `@Entity` and `@Table`.
**Follow-up:** What annotations map fields to columns?

### Q21: What is the difference between `@ManyToOne` and `@OneToMany`?
**A:** `@ManyToOne` means many entities reference one other entity (e.g., many sessions → one mentor). `@OneToMany` means one entity references many others (e.g., one mentor → many sessions).
**Follow-up:** Which side has the foreign key?

### Q22: What is Lazy vs Eager fetching?
**A:** EAGER loads the related entity immediately. LAZY loads it only when the getter is called. EAGER is used for always-needed data (mentor, subject). LAZY is used for optional data (learner, session in enrollments).
**Follow-up:** What is LazyInitializationException?

### Q23: What is LazyInitializationException and how to prevent it?
**A:** It occurs when you try to access a lazy-loaded association after the JPA session is closed. Solutions: use `@Transactional`, use DTOs with `from()` methods, or use `JOIN FETCH`.
**Follow-up:** How do DTOs prevent this?

### Q24: What are derived queries?
**A:** Derived queries are methods where Spring Data JPA generates SQL from the method name. For example, `findByEmail` generates `WHERE email = ?`.
**Follow-up:** What naming conventions does Spring use?

### Q25: What is the difference between `@Query` and derived queries?
**A:** Derived queries are generated from method names. `@Query` is a custom JPQL query you write yourself.
**Follow-up:** What is JPQL?

### Q26: What is JPQL?
**A:** JPQL (Java Persistence Query Language) is a query language that operates on entities (Java objects), not database tables. For example, `FROM MentorFeedback f` refers to the entity, not the table.
**Follow-up:** How is it different from SQL?

### Q27: What does `@Param` do?
**A:** It binds a method parameter to a named parameter in a JPQL query. For example, `@Param("mentorId") Long mentorId` binds to `:mentorId` in the query.
**Follow-up:** Why not just use positional parameters?

### Q28: What is `Pageable` and `Page<T>`?
**A:** `Pageable` is an interface that handles pagination (page number, page size). `Page<T>` is the result, containing the data and metadata (total pages, total elements).
**Follow-up:** How does the client request a specific page?

### Q29: What is `@Transactional` and why is it important?
**A:** `@Transactional` makes all operations in a method run in one database transaction. If one fails, all are rolled back. It's critical for multi-step operations like enrollment (updates both session and enrollment).
**Follow-up:** What happens without it?

### Q30: What does `rollbackFor = Exception.class` mean?
**A:** By default, `@Transactional` only rolls back on RuntimeException. `rollbackFor = Exception.class` means it also rolls back on checked exceptions.
**Follow-up:** What is the difference between checked and unchecked exceptions?

---

## Entities & Database

### Q31: What are the 5 entities in this project?
**A:** AcademicUser, TutoringSession, StudySubject, SessionEnrollment, MentorFeedback.
**Follow-up:** Which entity is the most central?

### Q32: What is the relationship between TutoringSession and AcademicUser?
**A:** `@ManyToOne` — many sessions belong to one mentor. The fetch type is EAGER.
**Follow-up:** Why EAGER?

### Q33: What is the relationship between SessionEnrollment and AcademicUser?
**A:** `@ManyToOne` — many enrollments belong to one learner. The fetch type is LAZY.
**Follow-up:** Why LAZY?

### Q34: What is the relationship between MentorFeedback and TutoringSession?
**A:** `@OneToOne` — one feedback belongs to one session. The fetch type is EAGER. The session_id column has a unique constraint.
**Follow-up:** Why is session_id unique?

### Q35: What does `@Enumerated(EnumType.STRING)` do?
**A:** It stores enums as text (e.g., "LEARNER") instead of numbers (e.g., 0). This is more readable and safer.
**Follow-up:** What happens if you use `EnumType.ORDINAL`?

### Q36: What is the purpose of `@JsonProperty(access = READ_ONLY)` on AcademicUser?
**A:** It prevents the field from being set from JSON input (deserialization) but allows it in JSON output (serialization). This is a security measure for sensitive fields like password.
**Follow-up:** What would happen without it?

### Q37: What is the Builder pattern used in entities?
**A:** It allows creating objects step by step using chained method calls: `AcademicUser.builder().fullName("John").email("john@example.com").build()`.
**Follow-up:** Why not just use a constructor?

### Q38: What is the purpose of `@JsonIgnoreProperties(ignoreUnknown = true)`?
**A:** It ignores unknown JSON fields during deserialization. If the client sends extra fields, they won't cause errors.
**Follow-up:** When would this be useful?

### Q39: What are the 4 enums and their values?
**A:** UserRole (LEARNER, MENTOR, ACADEMIC_ADMIN, SUPPORT_AGENT), UserStatus (PENDING, APPROVED, REJECTED, BLOCKED), EnrollmentStatus (ENROLLED, ATTENDED, CANCELLED, DISCONTINUED), SessionStatus (SCHEDULED, ACTIVE, COMPLETED, CANCELLED).
**Follow-up:** Which enums are used for validation?

### Q40: What is the database schema?
**A:** MySQL database named `loomlearn` with 5 tables: academic_users, study_subjects, tutoring_sessions, session_enrollments, mentor_feedback.
**Follow-up:** What are the foreign key relationships?

---

## Services & Business Logic

### Q41: What does AcademicAuthService do?
**A:** It handles user registration and login. Registration checks email uniqueness, encodes password with BCrypt, sets status (PENDING for mentors, APPROVED for others), saves user, and generates JWT token. Login finds user, checks password, checks status, and generates JWT token.
**Follow-up:** Why are mentors PENDING?

### Q42: What does EnrollmentWorkflowService do?
**A:** It handles enrollment workflow. `enrollLearner` checks session status (SCHEDULED), capacity, and duplicate enrollment, then creates enrollment and increments session count. `cancelEnrollment` finds active enrollment, sets DISCONTINUED, and decrements count. Both methods are `@Transactional`.
**Follow-up:** Why are they transactional?

### Q43: What does FeedbackService do?
**A:** It handles feedback submission and listing. `submitFeedback` checks if learner is enrolled in the session, marks feedbackSubmitted=true, creates feedback, and saves both. `getAllFeedback` returns all feedback. `submitFeedback` is `@Transactional`.
**Follow-up:** Why check enrollment?

### Q44: What is the difference between FeedbackService and FeedbackModerationService?
**A:** FeedbackService checks enrollment before allowing feedback. FeedbackModerationService does not check enrollment — it just creates feedback directly. The controller uses FeedbackService.
**Follow-up:** Why have two services?

### Q45: What does SessionManagementService do?
**A:** It handles session CRUD. `createSession` validates title, start time, end time, resolves mentor and subject from database, sets defaults (currentEnrollment=0, status=SCHEDULED), and saves. `updateSession` updates session details. `cancelSession` sets status to CANCELLED. `updateSessionStatus` changes status with validation. `getAvailableSessions` returns paginated sessions.
**Follow-up:** Why resolve mentor/subject from database?

### Q46: What does AdministrativeService do?
**A:** It computes statistics. `getPlatformStats` aggregates user counts, session counts, and subject enrollment stats. `getMentorDashboardStats` aggregates mentor-specific feedback and session stats.
**Follow-up:** What is subject enrollment stats?

### Q47: Why is `@Transactional` critical for enrollLearner?
**A:** The method updates both the session (increments currentEnrollment) and the enrollment (creates new record). If one fails, both must be rolled back to maintain data consistency.
**Follow-up:** What would happen without it?

### Q48: What validation is performed in createSession?
**A:** Title must not be empty, start time must be in the future, end time must be after start time, mentor and subject must be provided and must exist.
**Follow-up:** Why check start time is in the future?

### Q49: What happens when you cancel a session?
**A:** The session status is set to CANCELLED. The session is not deleted from the database.
**Follow-up:** Why not delete it?

### Q50: What is the feedbackSubmitted flag?
**A:** It's a boolean on SessionEnrollment that tracks whether the learner has submitted feedback for a session. It prevents duplicate feedback.
**Follow-up:** How is it used?

---

## Controllers & API

### Q51: How many controllers are there and what are they?
**A:** 7 controllers: AuthController, UserController, SubjectController, SessionController, EnrollmentController, FeedbackController, AnalyticsController.
**Follow-up:** Which one handles authentication?

### Q52: What is the base URL for AuthController?
**A:** `/api/auth`
**Follow-up:** What endpoints does it have?

### Q53: Which endpoints are public?
**A:** `/`, `/api/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**`.
**Follow-up:** Why is login public?

### Q54: Who can access /api/enrollments/**?
**A:** Only users with the LEARNER role.
**Follow-up:** What happens if a mentor tries?

### Q55: Who can access /api/analytics/stats?
**A:** Only ACADEMIC_ADMIN or ADMIN.
**Follow-up:** Who can access /api/analytics/mentor/{mentorId}?

### Q56: What is the difference between @RequestBody and @RequestParam?
**A:** `@RequestBody` takes data from the JSON body of the request. `@RequestParam` takes data from the URL query string.
**Follow-up:** When would you use each?

### Q57: What is ResponseEntity?
**A:** It's a wrapper that lets you control the HTTP status code, headers, and body of the response.
**Follow-up:** Why not just return the object directly?

### Q58: What is the purpose of DTOs?
**A:** DTOs transfer data between frontend and backend without exposing entities. They prevent exposing sensitive data (passwords), avoid circular references, and flatten nested objects.
**Follow-up:** What is a circular reference?

### Q59: What is the from() factory method in DTOs?
**A:** It's a static method that converts an entity to a DTO. It must be called inside a `@Transactional` method so lazy associations can be loaded.
**Follow-up:** Why must it be transactional?

### Q60: What is the Swagger UI URL?
**A:** `http://localhost:8080/swagger-ui.html`
**Follow-up:** What does it do?

---

## Configuration & Properties

### Q61: What is in application.properties?
**A:** Application name (demo), forward headers strategy, database URL (MySQL localhost:3306/loomlearn), username (root), password (root), driver class, ddl-auto (update), show-sql (true).
**Follow-up:** What does ddl-auto=update do?

### Q62: What does ddl-auto=update do?
**A:** It automatically creates or updates database tables based on entity classes. It adds new columns but doesn't delete existing ones.
**Follow-up:** Is it safe for production?

### Q63: What does show-sql=true do?
**A:** It prints all SQL statements to the console. Useful for debugging.
**Follow-up:** Should it be true in production?

### Q64: What is the purpose of DataSeeder?
**A:** It implements CommandLineRunner to seed default data (subjects, admin user, support agent) when the application starts. It's idempotent (checks before creating).
**Follow-up:** What is CommandLineRunner?

### Q65: What is the JWT secret and expiration?
**A:** The secret is `defaultSecretKeyWithAtLeast256BitsLengthToAvoidWeakExceptions!` (from @Value default). The expiration is 86,400,000 ms (24 hours).
**Follow-up:** Are these set in application.properties?

### Q66: What is server.forward-headers-strategy=framework?
**A:** It tells Spring Boot to forward HTTP headers from the reverse proxy (e.g., X-Forwarded-Proto) to the application.
**Follow-up:** Why is this needed?

### Q67: What is the purpose of the OpenAPI bean in SecurityConfig?
**A:** It configures Swagger/OpenAPI documentation to use JWT Bearer authentication.
**Follow-up:** What does this enable in Swagger UI?

### Q68: What is the purpose of the PasswordEncoder bean?
**A:** It creates a BCryptPasswordEncoder for encoding and verifying passwords.
**Follow-up:** Why BCrypt?

---

## Exceptions & Error Handling

### Q69: What is GlobalExceptionHandler?
**A:** It's a `@RestControllerAdvice` that catches all exceptions globally. It has handlers for BusinessValidationException (400), ResourceNotFoundException (404), and generic Exception (500).
**Follow-up:** What is @RestControllerAdvice?

### Q70: What is the difference between BusinessValidationException and ResourceNotFoundException?
**A:** BusinessValidationException is for business rule violations (400 Bad Request). ResourceNotFoundException is for missing resources (404 Not Found).
**Follow-up:** Give an example of each.

### Q71: What HTTP status codes are used?
**A:** 200 (OK), 400 (Bad Request), 404 (Not Found), 500 (Internal Server Error).
**Follow-up:** When is each used?

### Q72: What is @ResponseStatus?
**A:** It sets the HTTP status code for an exception. BusinessValidationException has 400, ResourceNotFoundException has 404.
**Follow-up:** What happens if you don't use it?

### Q73: What is @ExceptionHandler?
**A:** It's a method-level annotation in @RestControllerAdvice that handles a specific exception type.
**Follow-up:** How does it differ from @ResponseStatus?

---

## Repositories

### Q74: What is JpaRepository?
**A:** It's a Spring Data JPA interface that provides CRUD methods (save, findById, deleteById, findAll, etc.).
**Follow-up:** What do you get for free?

### Q75: How many repositories are there?
**A:** 5: AcademicUserRepository, TutoringSessionRepository, StudySubjectRepository, SessionEnrollmentRepository, MentorFeedbackRepository.
**Follow-up:** Which one has custom JPQL queries?

### Q76: What derived queries are in AcademicUserRepository?
**A:** findByEmail, existsByEmail, findByRole, countByRole, countByRoleAndStatus.
**Follow-up:** What SQL does countByRoleAndStatus generate?

### Q77: What custom queries are in MentorFeedbackRepository?
**A:** getAverageRatingByMentorId (JPQL with AVG), countByMentorId (derived).
**Follow-up:** What does AVG do?

### Q78: What custom query is in StudySubjectRepository?
**A:** getSubjectEnrollmentStats — a JPQL query that joins SessionEnrollment, TutoringSession, and StudySubject, groups by subject name, and counts enrollments.
**Follow-up:** What does it return?

### Q79: What is the difference between findByStatusIn and findByStatus?
**A:** findByStatusIn accepts a collection of statuses and returns entities matching ANY of them. findByStatus accepts a single status.
**Follow-up:** Where is findByStatusIn used?

### Q80: What does existsByLearnerIdAndSessionId do?
**A:** It checks if a learner is already enrolled in a session. Returns boolean.
**Follow-up:** Where is it used?

---

## Frontend

### Q81: What frontend framework is used?
**A:** React 19 with Vite 8.
**Follow-up:** Is the frontend fully implemented?

### Q82: Is the frontend complete?
**A:** No. The frontend currently has only the default Vite + React template. The full frontend described in the SRS is planned but not implemented.
**Follow-up:** What does the SRS describe?

### Q83: What is in the frontend package.json?
**A:** React 19, Vite 8, ESLint, and related dev dependencies.
**Follow-up:** What is Vite?

---

## Architecture & Design

### Q84: What architecture pattern is used?
**A:** Layered (n-tier) architecture: Controller → Service → Repository → Database.
**Follow-up:** What are the benefits?

### Q85: What is the difference between Controller and Service?
**A:** Controller handles HTTP requests and responses. Service contains business logic. Controller is thin; Service does the real work.
**Follow-up:** Can a controller talk directly to a repository?

### Q86: What is the N+1 query problem?
**A:** When you load N entities and each triggers a separate query to load its related entity, you get N+1 queries. EAGER fetching can cause this.
**Follow-up:** How to solve it?

### Q87: What is the purpose of DTOs in the context of lazy loading?
**A:** DTOs with from() methods convert entities to plain objects while the JPA session is still open (inside @Transactional), preventing LazyInitializationException.
**Follow-up:** What happens if you don't use DTOs?

### Q88: What is the Builder pattern?
**A:** A design pattern that allows creating objects step by step using chained method calls.
**Follow-up:** Where is it used in this project?

### Q89: What is the purpose of the @JsonIgnoreProperties annotation?
**A:** It ignores unknown JSON fields during deserialization, preventing errors when the client sends extra fields.
**Follow-up:** What would happen without it?

### Q90: What is the difference between @Component and @Service?
**A:** They are functionally the same. @Service is a more specific stereotype for service-layer classes.
**Follow-up:** Does it affect behavior?

---

## Miscellaneous

### Q91: What Java version is used?
**A:** Java 17.
**Follow-up:** What are the new features in Java 17?

### Q92: What is the Spring Boot version?
**A:** 3.2.5.
**Follow-up:** What is the parent POM?

### Q93: What database is used?
**A:** MySQL.
**Follow-up:** What is the database name?

### Q94: What is the purpose of Lombok in this project?
**A:** Lombok is included as a dependency but is NOT used. All getters/setters are written manually.
**Follow-up:** Why include it if not used?

### Q95: What testing frameworks are included?
**A:** Mockito (mocking), TestNG (test framework), Spring Security Test (security testing).
**Follow-up:** Are there any test files?

### Q96: What is the purpose of springdoc-openapi?
**A:** It generates Swagger UI for API documentation. You can test all endpoints at /swagger-ui.html.
**Follow-up:** What is OpenAPI?

### Q97: What is the difference between compile, runtime, and test scope?
**A:** compile is available at compile time and runtime. runtime is only needed at runtime. test is only available during testing.
**Follow-up:** Which scope is Lombok?

### Q98: What is the purpose of the maven-surefire-plugin?
**A:** It runs unit tests during the build process. It's configured to look for *Tests.java and *Test.java files.
**Follow-up:** Are there any test files?

### Q99: What is the purpose of the spring-boot-starter-validation dependency?
**A:** It provides Bean Validation (JSR-380) support. The current code does manual validation, but this is included for future use.
**Follow-up:** What validation annotations are available?

### Q100: What is the most important thing to remember about this project?
**A:** The project is a peer-to-peer tutoring system with JWT authentication, role-based access control, and transactional business logic. The key concepts are: layered architecture, Spring Security with JWT, Spring Data JPA with derived queries, DTOs for lazy loading, and @Transactional for data consistency.
**Follow-up:** What is the most critical method?
