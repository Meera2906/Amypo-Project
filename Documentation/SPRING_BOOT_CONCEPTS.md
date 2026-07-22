# SPRING_BOOT_CONCEPTS

This document explains every Spring Boot concept used in this project.

---

## 1. Dependency Injection (DI)

**What it is:** Dependency Injection is a design pattern where Spring creates objects and "injects" their dependencies automatically. Instead of you creating objects with `new`, Spring creates them and passes the dependencies.

**Example in this project:**
```java
@Service
public class AcademicAuthService {
    private final AcademicUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // Spring automatically passes these dependencies
    public AcademicAuthService(AcademicUserRepository userRepository,
                               PasswordEncoder passwordEncoder,
                               JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }
}
```

**Why it's used:** It makes the code more modular and testable. You can easily swap implementations (e.g., use a mock repository for testing).

---

## 2. IoC (Inversion of Control)

**What it is:** IoC is the principle behind Dependency Injection. Instead of your code controlling the creation of objects, the framework (Spring) controls it. The "control" is "inverted" — Spring creates the objects, not your code.

**Example:** Instead of `AcademicAuthService service = new AcademicAuthService(...)`, Spring creates the service and injects it wherever it's needed.

---

## 3. Bean

**What it is:** A Bean is an object that is managed by the Spring container. Spring creates, configures, and manages the lifecycle of beans.

**How beans are created:**
- `@Component` — Generic stereotype. Spring discovers and creates the class as a bean.
- `@Service` — Specific to service layer. Same as `@Component` but more descriptive.
- `@Repository` — Specific to data access layer. Same as `@Component` but adds exception translation.
- `@RestController` — Specific to web controllers. Combines `@Controller` + `@ResponseBody`.
- `@Configuration` — Marks a class as a configuration class. Methods annotated with `@Bean` create beans.
- `@Bean` — Method-level annotation. The method returns an object that Spring manages as a bean.

**Example:**
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

---

## 4. Component Scan

**What it is:** Component scanning is the process by which Spring automatically discovers beans in the classpath. When you use `@SpringBootApplication`, it enables component scanning for the package of the annotated class and all sub-packages.

**In this project:** `@SpringBootApplication` is on `DemoApplication.java` in the `com.example.demo` package. Spring scans all sub-packages: `com.example.demo.controller`, `com.example.demo.service`, `com.example.demo.repository`, etc.

---

## 5. REST Controller

**What it is:** A REST controller is a class that handles HTTP requests and returns HTTP responses. In Spring Boot, you use `@RestController` to mark a class as a REST controller.

**Key annotations:**
- `@RestController` — Combines `@Controller` + `@ResponseBody`. Return values are automatically converted to JSON.
- `@RequestMapping("/api/...")` — Base URL path for all endpoints.
- `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping` — Map HTTP methods to methods.
- `@RequestBody` — Converts JSON request body to Java object.
- `@PathVariable` — Extracts value from URL path.
- `@RequestParam` — Extracts value from URL query string.
- `ResponseEntity<T>` — Wrapper for HTTP response (status code + body).

---

## 6. Autowired

**What it is:** `@Autowired` tells Spring to automatically inject a dependency. It can be used on fields, constructors, or methods.

**In this project:**
- Most classes use **constructor injection** (dependencies are passed via the constructor).
- `JwtAuthenticationFilter` uses **field injection** (`@Autowired` on fields).

**Example (constructor injection):**
```java
public AcademicAuthService(AcademicUserRepository userRepository, ...) {
    this.userRepository = userRepository;
}
```

**Example (field injection):**
```java
@Autowired
private JwtUtil jwtUtil;
```

**Best practice:** Constructor injection is preferred because it makes dependencies explicit and allows them to be `final`.

---

## 7. Repository

**What it is:** A repository is a class (or interface) that handles data access. In Spring Data JPA, repositories are interfaces that extend `JpaRepository`. Spring automatically implements them at runtime.

**Key concepts:**
- `@Repository` — Stereotype annotation for data access classes.
- `JpaRepository<Entity, Long>` — Provides CRUD methods (save, findById, deleteById, etc.).
- Derived queries — Method names like `findByEmail` are parsed by Spring to generate SQL.
- `@Query` — Custom JPQL queries for complex operations.

---

## 8. Service

**What it is:** A service is a class that contains business logic. It sits between the controller (which handles HTTP) and the repository (which handles data access).

**Key concepts:**
- `@Service` — Stereotype annotation for service classes.
- Constructor injection — Services receive their dependencies (repositories) via the constructor.
- `@Transactional` — Methods run in a database transaction.

---

## 9. Entity

**What it is:** An entity is a Java class that represents a database table. Each entity class maps to one table.

**Key annotations:**
- `@Entity` — Marks the class as a JPA entity.
- `@Table(name = "...")` — Specifies the table name.
- `@Id` — Marks the primary key.
- `@GeneratedValue(strategy = IDENTITY)` — Auto-increment primary key.
- `@Column(name = "...")` — Maps a field to a column.
- `@Enumerated(EnumType.STRING)` — Stores enums as text.
- `@ManyToOne`, `@OneToOne` — Define relationships.
- `@JoinColumn(name = "...")` — Specifies the foreign key column.
- `fetch = FetchType.LAZY/EAGER` — Controls when related objects are loaded.

---

## 10. DTO (Data Transfer Object)

**What it is:** A DTO is a plain Java object used to transfer data between layers. It is NOT an entity — it does not map to a database table.

**Why DTOs are used:**
- Security — Don't expose sensitive data (like password hashes).
- Avoid circular references — Entities can reference each other, causing infinite loops in JSON.
- Flatten nested objects — Include only the needed fields from related entities.
- Stable API contract — The frontend doesn't need to know the internal structure of entities.

**Key concepts:**
- DTOs have private fields, getters, and setters.
- Some DTOs have `from()` factory methods that convert entities to DTOs.
- Some DTOs have builder patterns.

---

## 11. Validation

**What it is:** Validation is the process of checking that input data meets certain criteria (e.g., not null, not empty, within a range).

**In this project:** The `spring-boot-starter-validation` dependency is included, but the current code does manual validation (checking for null/empty in service methods). The SRS mentions validation requirements for the future.

**Common validation annotations (not yet used but available):**
- `@NotNull` — Field must not be null.
- `@NotEmpty` — String/collection must not be empty.
- `@Size(min, max)` — String/collection size must be within range.
- `@Min`, `@Max` — Numeric value must be within range.
- `@Email` — String must be a valid email.

---

## 12. Exception Handling

**What it is:** Exception handling is the process of catching errors and returning clean responses to the client.

**In this project:**
- `GlobalExceptionHandler` — Annotated with `@RestControllerAdvice`. Catches all exceptions globally.
- `BusinessValidationException` — Thrown when business rules are violated. Returns HTTP 400.
- `ResourceNotFoundException` — Thrown when a resource is not found. Returns HTTP 404.
- `@ResponseStatus` — Sets the HTTP status code for an exception.
- `@ExceptionHandler` — Method-level annotation that handles specific exception types.

---

## 13. Transactions

**What it is:** A transaction is a unit of work that is treated as a single unit. All operations in a transaction either succeed together or fail together.

**Key concepts:**
- `@Transactional` — Method-level annotation. All operations in the method run in one transaction.
- `rollbackFor = Exception.class` — Rolls back on any exception (not just RuntimeException).
- ACID properties — Atomicity, Consistency, Isolation, Durability.

**In this project:**
- `EnrollmentWorkflowService.enrollLearner()` — `@Transactional`. Updates both session and enrollment.
- `EnrollmentWorkflowService.cancelEnrollment()` — `@Transactional`. Updates both enrollment and session.
- `FeedbackService.submitFeedback()` — `@Transactional`. Updates both enrollment and feedback.

---

## 14. JPA (Java Persistence API)

**What it is:** JPA is a Java specification for accessing, persisting, and managing data between Java objects and a relational database. It's a specification — Hibernate is the implementation.

**Key concepts:**
- `@Entity` — Maps a Java class to a database table.
- `@Id` — Marks the primary key.
- `@ManyToOne`, `@OneToOne` — Define relationships.
- JPQL — Java Persistence Query Language. A query language that operates on entities, not tables.

---

## 15. Hibernate

**What it is:** Hibernate is the most popular JPA implementation. It's the engine that actually does the work of mapping Java objects to database tables.

**In this project:**
- Hibernate is included via `spring-boot-starter-data-jpa`.
- It generates SQL from entity classes and repository method names.
- It manages the persistence context (the set of entities being tracked).
- It handles lazy/eager loading of related entities.

---

## 16. Lombok

**What it is:** Lombok is a Java library that reduces boilerplate code (getters, setters, constructors) using annotations.

**In this project:** Lombok is included as a dependency but is NOT used. All getters/setters are written manually. The dependency is included for future use.

**Common Lombok annotations (not used in this project):**
- `@Getter` / `@Setter` — Generate getters/setters.
- `@Data` — Generates getters, setters, equals, hashCode, toString.
- `@Builder` — Generates a builder pattern.
- `@NoArgsConstructor` / `@AllArgsConstructor` — Generate constructors.

---

## 17. Spring Security

**What it is:** Spring Security is a powerful authentication and access-control framework.

**In this project:**
- `@EnableWebSecurity` — Enables Spring Security.
- `@Configuration` — Marks the security configuration class.
- `SecurityFilterChain` — Defines security rules (which URLs are public, which require roles).
- `PasswordEncoder` — Encodes passwords (BCrypt).
- `OncePerRequestFilter` — A filter that runs once per request (used for JWT).
- `SecurityContextHolder` — Stores the current authenticated user.
- `UsernamePasswordAuthenticationToken` — Represents an authenticated user.
- `SimpleGrantedAuthority` — Represents a role/permission.

---

## 18. JWT (JSON Web Token)

**What it is:** JWT is a compact, URL-safe token format for securely transmitting information.

**In this project:**
- `JwtUtil` — Generates, validates, and parses JWT tokens.
- `JwtAuthenticationFilter` — Extracts the JWT from the Authorization header on every request.
- HS256 — The signing algorithm (HMAC with SHA-256).
- `@Value` — Injects the secret key and expiration time from `application.properties`.

**JWT structure:**
- Header — Contains the algorithm (HS256).
- Payload — Contains claims (subject = email, issued at, expiration).
- Signature — HMAC SHA-256 of the header + payload + secret key.

---

## 19. Spring Data JPA

**What it is:** Spring Data JPA is a sub-project of Spring Data that provides repository support for JPA.

**Key concepts:**
- `JpaRepository<Entity, Long>` — Base interface with CRUD methods.
- Derived queries — Method names are parsed to generate SQL.
- `@Query` — Custom JPQL queries.
- `@Param` — Binds method parameters to JPQL query parameters.
- `Pageable` — Handles pagination.
- `Page<T>` — Paginated result.

---

## 20. Spring Boot Auto-Configuration

**What it is:** Spring Boot automatically configures your application based on what's on the classpath. For example, if `spring-boot-starter-web` is on the classpath, Spring Boot automatically configures a web server (Tomcat).

**In this project:**
- `@SpringBootApplication` enables auto-configuration.
- `spring-boot-starter-web` → Tomcat web server, Spring MVC.
- `spring-boot-starter-data-jpa` → Hibernate, DataSource.
- `spring-boot-starter-security` → Spring Security.
- `mysql-connector-j` → MySQL DataSource.

---

## 21. CommandLineRunner

**What it is:** `CommandLineRunner` is a Spring Boot interface. The `run()` method is called after the application starts. It's used for initialization tasks.

**In this project:** `DataSeeder` implements `CommandLineRunner` to seed default data (subjects, admin user, support agent) when the application starts.

---

## 22. CORS (Cross-Origin Resource Sharing)

**What it is:** CORS is a security feature that allows web pages to make requests to a different domain than the one that served the page.

**In this project:** Configured in `SecurityConfig` to allow requests from `http://localhost:3000` (the frontend).

---

## 23. CSRF (Cross-Site Request Forgery)

**What it is:** CSRF is an attack where a malicious website tricks the user's browser into making unwanted requests.

**In this project:** Disabled (`csrf.disable()`) because the API is stateless (uses JWT, not cookies).

---

## 24. Stateless Session

**What it is:** In a stateless application, the server does not store any session data. Each request must include all necessary information (like the JWT token).

**In this project:** `sessionCreationPolicy(SessionCreationPolicy.STATELESS)` is set in `SecurityConfig`.

---

## 25. OpenAPI / Swagger

**What it is:** OpenAPI is a specification for documenting REST APIs. Swagger UI is a web interface that lets you test API endpoints.

**In this project:** `springdoc-openapi-starter-webmvc-ui` generates the documentation. `SecurityConfig` configures JWT authentication for Swagger UI.

**URL:** `http://localhost:8080/swagger-ui.html`

---

## 26. Builder Pattern

**What it is:** A design pattern that allows you to create objects step by step. Instead of a long constructor, you chain method calls.

**In this project:** Used in entities (`AcademicUser.builder()...build()`) and DTOs (`AuthResponseDto.builder()...build()`).

```java
AcademicUser user = AcademicUser.builder()
    .fullName("John")
    .email("john@example.com")
    .password("hashedPassword")
    .role(UserRole.LEARNER)
    .status(UserStatus.APPROVED)
    .build();
```

---

## 27. Enum (Enumeration)

**What it is:** An enum is a special data type that enables a variable to be a set of predefined constants.

**In this project:**
- `UserRole` — LEARNER, MENTOR, ACADEMIC_ADMIN, SUPPORT_AGENT
- `UserStatus` — PENDING, APPROVED, REJECTED, BLOCKED
- `EnrollmentStatus` — ENROLLED, ATTENDED, CANCELLED, DISCONTINUED
- `SessionStatus` — SCHEDULED, ACTIVE, COMPLETED, CANCELLED

**Key concept:** `@Enumerated(EnumType.STRING)` stores enums as text (e.g., "LEARNER") instead of numbers (e.g., 0). This is more readable and safer.

---

## 28. Optional

**What it is:** `Optional` is a container object which may or may not contain a non-null value. If a value is present, `isPresent()` returns true. If absent, the object is empty.

**In this project:** Used in repository methods like `findByEmail()` which returns `Optional<AcademicUser>`.

**Why it's used:** It forces you to handle the case where a value might not exist, preventing `NullPointerException`.

```java
Optional<AcademicUser> userOpt = userRepository.findByEmail(email);
if (userOpt.isPresent()) {
    AcademicUser user = userOpt.get();
    // ...
}
```

Or with `orElseThrow`:
```java
AcademicUser user = userRepository.findByEmail(email)
    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
```
