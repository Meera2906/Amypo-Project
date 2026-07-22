# ANNOTATIONS

This document lists every annotation used in the project and explains what it does.

---

## Spring Boot Core Annotations

### `@SpringBootApplication`
- **What it does:** Combines `@Configuration`, `@EnableAutoConfiguration`, and `@ComponentScan`. Marks the main application class.
- **Where used:** `DemoApplication.java`
- **Why:** Tells Spring to start the application, auto-configure everything, and scan for components.

### `@Configuration`
- **What it does:** Marks a class as a configuration class. Spring processes it to create beans.
- **Where used:** `SecurityConfig.java`
- **Why:** Defines beans like `PasswordEncoder`, `OpenAPI`, and `SecurityFilterChain`.

### `@EnableWebSecurity`
- **What it does:** Enables Spring Security's web security support.
- **Where used:** `SecurityConfig.java`
- **Why:** Activates Spring Security so you can define security rules.

### `@Bean`
- **What it does:** Method-level annotation. The method returns an object that Spring manages as a bean.
- **Where used:** `SecurityConfig.java` (passwordEncoder, customOpenAPI, securityFilterChain)
- **Why:** Creates beans that aren't annotated with a stereotype.

### `@Component`
- **What it does:** Marks a class as a Spring component. Spring automatically discovers and creates it as a bean.
- **Where used:** `JwtAuthenticationFilter.java`, `DataSeeder.java`, `JwtUtil.java`
- **Why:** Makes the class available for dependency injection.

### `@ComponentScan`
- **What it does:** (Included in `@SpringBootApplication`) Tells Spring to scan packages for components.
- **Where used:** Implicit in `@SpringBootApplication`
- **Why:** Automatically discovers all `@Component`, `@Service`, `@Repository`, `@RestController` classes.

---

## Web/MVC Annotations

### `@RestController`
- **What it does:** Combines `@Controller` + `@ResponseBody`. Marks a class as a REST controller. Return values are automatically converted to JSON.
- **Where used:** All 7 controllers
- **Why:** Handles HTTP requests and returns JSON responses.

### `@RequestMapping`
- **What it does:** Sets the base URL path for all endpoints in a controller.
- **Where used:** All 7 controllers (e.g., `@RequestMapping("/api/auth")`)
- **Why:** Groups related endpoints under a common path.

### `@GetMapping`
- **What it does:** Maps HTTP GET requests to a method.
- **Where used:** All controllers (e.g., `@GetMapping("/stats")`)
- **Why:** Handles GET requests.

### `@PostMapping`
- **What it does:** Maps HTTP POST requests to a method.
- **Where used:** AuthController, SessionController, EnrollmentController, FeedbackController, SubjectController
- **Why:** Handles POST requests (create operations).

### `@PutMapping`
- **What it does:** Maps HTTP PUT requests to a method.
- **Where used:** SessionController, UserController, SubjectController
- **Why:** Handles PUT requests (update operations).

### `@DeleteMapping`
- **What it does:** Maps HTTP DELETE requests to a method.
- **Where used:** SessionController, EnrollmentController, SubjectController
- **Why:** Handles DELETE requests (delete operations).

### `@RequestBody`
- **What it does:** Converts the JSON body of an HTTP request to a Java object.
- **Where used:** AuthController, SessionController, SubjectController
- **Why:** Allows the client to send data in the request body.

### `@PathVariable`
- **What it does:** Extracts a value from the URL path (e.g., `/api/users/5` → `id = 5`).
- **Where used:** UserController, SessionController, SubjectController, AnalyticsController
- **Why:** Allows dynamic values in the URL.

### `@RequestParam`
- **What it does:** Extracts a value from the URL query string (e.g., `?learnerId=5`).
- **Where used:** EnrollmentController, FeedbackController, SessionController, UserController
- **Why:** Allows passing parameters in the URL.

### `ResponseEntity`
- **What it does:** A wrapper that lets you control the HTTP status code, headers, and body.
- **Where used:** All controllers
- **Why:** Allows returning specific HTTP status codes (200, 400, 404, etc.).

---

## Service/Data Access Annotations

### `@Service`
- **What it does:** Marks a class as a service. Same as `@Component` but more descriptive.
- **Where used:** All 6 service classes
- **Why:** Indicates the class contains business logic.

### `@Repository`
- **What it does:** Marks a class as a data access component. Adds exception translation.
- **Where used:** All 5 repository interfaces
- **Why:** Indicates the class handles database access.

### `@Transactional`
- **What it does:** Method-level annotation. All operations in the method run in one database transaction.
- **Where used:** `EnrollmentWorkflowService.enrollLearner()`, `EnrollmentWorkflowService.cancelEnrollment()`, `FeedbackService.submitFeedback()`
- **Why:** Ensures data consistency. If one operation fails, all are rolled back.

---

## JPA/Hibernate Annotations

### `@Entity`
- **What it does:** Marks a class as a JPA entity (maps to a database table).
- **Where used:** All 5 entity classes
- **Why:** Tells JPA to manage this class as a database table.

### `@Table`
- **What it does:** Specifies the table name for an entity.
- **Where used:** All 5 entity classes (e.g., `@Table(name = "academic_users")`)
- **Why:** Maps the Java class to a specific database table name.

### `@Id`
- **What it does:** Marks a field as the primary key.
- **Where used:** All 5 entity classes
- **Why:** Identifies the primary key column.

### `@GeneratedValue`
- **What it does:** Configures how the primary key is generated.
- **Where used:** All 5 entity classes (`strategy = GenerationType.IDENTITY`)
- **Why:** Auto-increments the primary key in the database.

### `@Column`
- **What it does:** Maps a field to a specific column. Can specify name, nullable, unique, length, etc.
- **Where used:** All entity classes
- **Why:** Controls the column mapping (name, constraints, etc.).

### `@Enumerated`
- **What it does:** Specifies how an enum is stored in the database.
- **Where used:** `AcademicUser` (role, status), `TutoringSession` (status), `SessionEnrollment` (status)
- **Why:** `EnumType.STRING` stores enums as text (e.g., "LEARNER") instead of numbers.

### `@ManyToOne`
- **What it does:** Defines a many-to-one relationship. Many entities reference one other entity.
- **Where used:** `TutoringSession` (mentor, subject), `SessionEnrollment` (learner, session), `MentorFeedback` (learner, mentor)
- **Why:** Maps foreign key relationships.

### `@OneToOne`
- **What it does:** Defines a one-to-one relationship.
- **Where used:** `MentorFeedback` (session)
- **Why:** Maps a foreign key with a unique constraint.

### `@JoinColumn`
- **What it does:** Specifies the foreign key column name for a relationship.
- **Where used:** All relationship fields in entities
- **Why:** Controls the foreign key column name.

### `FetchType.LAZY`
- **What it does:** The related entity is loaded only when its getter is called.
- **Where used:** `SessionEnrollment` (learner, session), `MentorFeedback` (learner, mentor)
- **Why:** Saves memory by not loading unnecessary data.

### `FetchType.EAGER`
- **What it does:** The related entity is loaded immediately when the main entity is loaded.
- **Where used:** `TutoringSession` (mentor, subject), `MentorFeedback` (session)
- **Why:** Ensures always-needed data is loaded.

### `@JsonIgnoreProperties`
- **What it does:** Controls JSON serialization/deserialization. `ignoreUnknown = true` ignores unknown JSON fields.
- **Where used:** `AcademicUser`
- **Why:** Prevents errors when the client sends extra fields.

### `@JsonProperty`
- **What it does:** Controls JSON serialization/deserialization for a field. `access = READ_ONLY` means the field is included in JSON output but not set from JSON input.
- **Where used:** `AcademicUser` (all fields)
- **Why:** Security measure — prevents clients from setting sensitive fields like password.

---

## Security Annotations

### `@EnableWebSecurity`
- **What it does:** Enables Spring Security's web security support.
- **Where used:** `SecurityConfig.java`
- **Why:** Activates Spring Security.

### `@Autowired`
- **What it does:** Tells Spring to automatically inject a dependency.
- **Where used:** `JwtAuthenticationFilter.java` (field injection)
- **Why:** Injects `JwtUtil` and `AcademicUserRepository` into the filter.

---

## Exception Handling Annotations

### `@RestControllerAdvice`
- **What it does:** Combines `@ControllerAdvice` + `@ResponseBody`. Catches exceptions globally and returns JSON responses.
- **Where used:** `GlobalExceptionHandler.java`
- **Why:** Centralized exception handling for all controllers.

### `@ControllerAdvice`
- **What it does:** Marks a class as a global exception handler.
- **Where used:** `GlobalExceptionHandler.java` (via `@RestControllerAdvice`)
- **Why:** Applies exception handling to all controllers.

### `@ExceptionHandler`
- **What it does:** Method-level annotation. Handles a specific exception type.
- **Where used:** `GlobalExceptionHandler.java` (3 methods)
- **Why:** Returns appropriate HTTP status codes for different exceptions.

### `@ResponseStatus`
- **What it does:** Sets the HTTP status code for an exception.
- **Where used:** `BusinessValidationException.java` (400), `ResourceNotFoundException.java` (404)
- **Why:** Returns the correct HTTP status code when an exception is thrown.

---

## Utility Annotations

### `@Value`
- **What it does:** Injects a value from a properties file into a field.
- **Where used:** `JwtUtil.java` (secret, expirationTime)
- **Why:** Reads configuration values from `application.properties`.

### `@Param`
- **What it does:** Binds a method parameter to a named parameter in a JPQL query.
- **Where used:** `MentorFeedbackRepository.java` (`@Param("mentorId")`)
- **Why:** Allows using named parameters in `@Query` annotations.

### `@Query`
- **What it does:** Defines a custom JPQL query for a repository method.
- **Where used:** `MentorFeedbackRepository.java`, `StudySubjectRepository.java`
- **Why:** Allows complex queries that can't be expressed as derived queries.

---

## Spring Boot Lifecycle Annotations

### `CommandLineRunner`
- **What it does:** Interface. The `run()` method is called after the application starts.
- **Where used:** `DataSeeder.java`
- **Why:** Initializes default data when the application starts.

---

## Summary Table

| Annotation | Category | Used In |
|---|---|---|
| `@SpringBootApplication` | Core | DemoApplication |
| `@Configuration` | Core | SecurityConfig |
| `@EnableWebSecurity` | Security | SecurityConfig |
| `@Bean` | Core | SecurityConfig |
| `@Component` | Core | JwtAuthenticationFilter, DataSeeder, JwtUtil |
| `@RestController` | Web | All 7 controllers |
| `@RequestMapping` | Web | All 7 controllers |
| `@GetMapping` | Web | All controllers |
| `@PostMapping` | Web | AuthController, SessionController, etc. |
| `@PutMapping` | Web | SessionController, UserController, etc. |
| `@DeleteMapping` | Web | SessionController, EnrollmentController, etc. |
| `@RequestBody` | Web | AuthController, SessionController, etc. |
| `@PathVariable` | Web | UserController, SessionController, etc. |
| `@RequestParam` | Web | EnrollmentController, FeedbackController, etc. |
| `ResponseEntity` | Web | All controllers |
| `@Service` | Service | All 6 services |
| `@Repository` | Data Access | All 5 repositories |
| `@Transactional` | Service | EnrollmentWorkflowService, FeedbackService |
| `@Entity` | JPA | All 5 entities |
| `@Table` | JPA | All 5 entities |
| `@Id` | JPA | All 5 entities |
| `@GeneratedValue` | JPA | All 5 entities |
| `@Column` | JPA | All entities |
| `@Enumerated` | JPA | AcademicUser, TutoringSession, SessionEnrollment |
| `@ManyToOne` | JPA | TutoringSession, SessionEnrollment, MentorFeedback |
| `@OneToOne` | JPA | MentorFeedback |
| `@JoinColumn` | JPA | All relationship fields |
| `@JsonIgnoreProperties` | JSON | AcademicUser |
| `@JsonProperty` | JSON | AcademicUser |
| `@EnableWebSecurity` | Security | SecurityConfig |
| `@Autowired` | DI | JwtAuthenticationFilter |
| `@RestControllerAdvice` | Exception | GlobalExceptionHandler |
| `@ExceptionHandler` | Exception | GlobalExceptionHandler |
| `@ResponseStatus` | Exception | BusinessValidationException, ResourceNotFoundException |
| `@Value` | Utility | JwtUtil |
| `@Param` | Utility | MentorFeedbackRepository |
| `@Query` | Utility | MentorFeedbackRepository, StudySubjectRepository |
| `CommandLineRunner` | Lifecycle | DataSeeder |
