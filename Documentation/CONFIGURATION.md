# CONFIGURATION

This document explains every configuration class and annotation in the project.

---

## What is Configuration?

In Spring Boot, **configuration** means setting up how the application works. Instead of writing XML files (like in older Spring versions), Spring Boot uses **annotations** on Java classes. Spring Boot also does **auto-configuration** — it automatically sets up common things (like database connections, security, etc.) based on what's on the classpath.

---

## 1. DemoApplication.java

**File:** `DemoApplication.java` (root package)
**Purpose:** The main entry point of the application.

### Code

```java
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

### Annotations Explained

| Annotation | What it does |
|---|---|
| `@SpringBootApplication` | This is a **combination** of three annotations: `@Configuration`, `@EnableAutoConfiguration`, and `@ComponentScan`. It tells Spring: "This is the main application class. Start here, auto-configure everything, and scan for components." |

### How the application starts

1. Java calls the `main()` method.
2. `SpringApplication.run(DemoApplication.class, args)` starts Spring Boot.
3. Spring Boot:
   - Creates the Spring container (a big box that holds all the beans).
   - Auto-configures common things (database, security, web server).
   - Scans the `com.example.demo` package and all sub-packages for components.
   - Runs `CommandLineRunner` beans (like `DataSeeder`).
4. The embedded Tomcat web server starts on port 8080.
5. The application is ready to receive HTTP requests.

---

## 2. SecurityConfig.java

**File:** `config/SecurityConfig.java`
**Purpose:** Configures Spring Security — who can access what, CORS, CSRF, JWT, and Swagger.

### Class-level Annotations

| Annotation | What it does |
|---|---|
| `@Configuration` | Marks this class as a configuration class. Spring processes it to create beans. |
| `@EnableWebSecurity` | Enables Spring Security's web security support. This is where you define security rules. |

### Constructor

```java
public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
    this.jwtAuthenticationFilter = jwtAuthenticationFilter;
}
```

Spring automatically passes the `JwtAuthenticationFilter` bean (which is annotated with `@Component`).

### Bean Methods

#### 1. `passwordEncoder()` → `PasswordEncoder`

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

**What it does:** Creates a `BCryptPasswordEncoder` bean. This is used to:
- **Encode** passwords when a user registers (so the password is hashed before storing).
- **Verify** passwords when a user logs in (compares the input password with the stored hash).

**Why BCrypt?** BCrypt is a one-way hashing algorithm with a "salt" (random data added to each password). Even if two users have the same password, their hashes will be different. This makes it very hard for attackers to crack passwords using rainbow tables.

#### 2. `customOpenAPI()` → `OpenAPI`

```java
@Bean
public OpenAPI customOpenAPI() {
    final String securitySchemeName = "bearerAuth";
    return new OpenAPI()
        .info(new Info().title("Your Application API").version("1.0"))
        .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
        .components(new Components()
            .addSecuritySchemes(securitySchemeName,
                new SecurityScheme()
                    .name(securitySchemeName)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")));
}
```

**What it does:** Configures Swagger/OpenAPI documentation. It tells Swagger UI that the API uses JWT Bearer authentication. This means the Swagger UI will show an "Authorize" button where you can paste your JWT token.

**Why this matters:** Swagger UI (at `/swagger-ui.html` or `/swagger-ui/index.html`) lets you test all API endpoints in a web browser. With this configuration, you can authenticate and test protected endpoints.

#### 3. `securityFilterChain(HttpSecurity http)` → `SecurityFilterChain`

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .cors(cors -> cors.configurationSource(...))
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/").permitAll()
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/swagger-ui/**").permitAll()
            .requestMatchers("/v3/api-docs/**").permitAll()
            .requestMatchers(HttpMethod.PUT, "/api/users/*/status").hasAnyRole("ACADEMIC_ADMIN", "ADMIN")
            .requestMatchers(HttpMethod.POST, "/api/subjects/**").hasAnyRole("ACADEMIC_ADMIN", "ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/subjects/**").hasAnyRole("ACADEMIC_ADMIN", "ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/subjects/**").hasAnyRole("ACADEMIC_ADMIN", "ADMIN")
            .requestMatchers("/api/enrollments/**").hasRole("LEARNER")
            .requestMatchers(HttpMethod.POST, "/api/feedback").hasRole("LEARNER")
            .requestMatchers(HttpMethod.GET, "/api/feedback").hasAnyRole("ACADEMIC_ADMIN", "ADMIN", "SUPPORT_AGENT", "SUPPORT")
            .requestMatchers("/api/analytics/stats").hasAnyRole("ACADEMIC_ADMIN", "ADMIN")
            .requestMatchers("/api/analytics/mentor/**").hasRole("MENTOR")
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
}
```

**What it does:** This is the main security configuration. Let's break it down:

### CORS Configuration

```java
.cors(cors -> cors.configurationSource(request -> {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(Collections.singletonList("http://localhost:3000"));
    config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
    config.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
    config.setAllowCredentials(true);
    return config;
}))
```

**What it does:** Configures Cross-Origin Resource Sharing (CORS). This allows the frontend (running on `http://localhost:3000`) to make requests to the backend (running on `http://localhost:8080`).

- **Allowed origins:** Only `http://localhost:3000` (the frontend).
- **Allowed methods:** GET, POST, PUT, DELETE, OPTIONS, PATCH.
- **Allowed headers:** Authorization (for JWT), Cache-Control, Content-Type.
- **Allow credentials:** true (allows cookies and HTTP authentication).

### CSRF Configuration

```java
.csrf(csrf -> csrf.disable())
```

**What it does:** Disables CSRF (Cross-Site Request Forgery) protection. CSRF is an attack where a malicious website tricks the user's browser into making unwanted requests. It's disabled here because:
- The API is stateless (uses JWT, not cookies).
- The frontend is a separate application (not a server-rendered page).
- CSRF protection is mainly needed for cookie-based authentication.

### Session Management

```java
.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
```

**What it does:** Sets the session creation policy to `STATELESS`. This means:
- The server does NOT store any session data.
- Each request must include the JWT token.
- The server does not use cookies to track sessions.
- This is the standard approach for JWT-based authentication.

### Authorization Rules

The `authorizeHttpRequests` section defines which URLs are public and which require authentication and specific roles:

| URL Pattern | Access | Explanation |
|---|---|---|
| `/` | Public | The root path. |
| `/api/auth/**` | Public | Login and registration endpoints. |
| `/swagger-ui/**` | Public | Swagger UI documentation. |
| `/v3/api-docs/**` | Public | OpenAPI JSON documentation. |
| `PUT /api/users/*/status` | ACADEMIC_ADMIN, ADMIN | Only admins can change user status. |
| `POST/PUT/DELETE /api/subjects/**` | ACADEMIC_ADMIN, ADMIN | Only admins can manage subjects. |
| `/api/enrollments/**` | LEARNER | Only learners can enroll/cancel. |
| `POST /api/feedback` | LEARNER | Only learners can submit feedback. |
| `GET /api/feedback` | ACADEMIC_ADMIN, ADMIN, SUPPORT_AGENT, SUPPORT | Admins and support can view all feedback. |
| `/api/analytics/stats` | ACADEMIC_ADMIN, ADMIN | Only admins can see platform stats. |
| `/api/analytics/mentor/**` | MENTOR | Only mentors can see their own stats. |
| Any other request | Authenticated | All other endpoints require login. |

### JWT Filter

```java
.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
```

**What it does:** Adds the `JwtAuthenticationFilter` before Spring's default `UsernamePasswordAuthenticationFilter`. This means the JWT filter runs first on every request, checking for a valid JWT token.

---

## 3. JwtAuthenticationFilter.java

**File:** `config/JwtAuthenticationFilter.java`
**Purpose:** A security filter that runs on every HTTP request. It reads the JWT token, validates it, and tells Spring Security who the user is.

### Class-level Annotations

| Annotation | What it does |
|---|---|
| `@Component` | Marks this class as a Spring component. Spring automatically discovers and creates it as a bean. |

### Class Declaration

```java
public class JwtAuthenticationFilter extends OncePerRequestFilter
```

**What it does:** Extends `OncePerRequestFilter`, which is a Spring Security filter that is guaranteed to run only once per request. This is important because filters can sometimes run multiple times (e.g., during forwards or error dispatches).

### Fields

| Field | Type | Annotation | Description |
|---|---|---|---|
| `jwtUtil` | `JwtUtil` | `@Autowired` | Used to validate tokens and extract emails. |
| `academicUserRepository` | `AcademicUserRepository` | `@Autowired` | Used to look up users by email. |

### The `doFilterInternal` Method

This is the main method that runs on every request. Here's what it does:

1. **Extract the Authorization header** — `request.getHeader("Authorization")`.
2. **Check if it starts with "Bearer "** — If so, extract the token (everything after "Bearer ").
3. **Validate the token** — `jwtUtil.validateToken(token)`. If valid, extract the email: `jwtUtil.extractEmail(token)`.
4. **Look up the user** — `academicUserRepository.findByEmail(email)`.
5. **Check if the user is approved** — If `user.getStatus() == APPROVED`, proceed.
6. **Create authorities** — Create a list of `SimpleGrantedAuthority` objects based on the user's role:
   - `ROLE_LEARNER` for learners.
   - `ROLE_MENTOR` for mentors.
   - `ROLE_ACADEMIC_ADMIN` and `ROLE_ADMIN` for admins (ADMIN is an alias).
   - `ROLE_SUPPORT_AGENT` and `ROLE_SUPPORT` for support agents (SUPPORT is an alias).
7. **Create authentication** — `new UsernamePasswordAuthenticationToken(user, null, authorities)`.
8. **Store in SecurityContext** — `SecurityContextHolder.getContext().setAuthentication(authentication)`.
9. **Continue the filter chain** — `filterChain.doFilter(request, response)`.

### Why `@Autowired` instead of constructor injection?

The `JwtAuthenticationFilter` uses `@Autowired` for field injection instead of constructor injection. This is a common pattern for filters because:
- Filters are created by the servlet container, not by Spring.
- Spring injects the dependencies after the filter is created.
- Constructor injection can be tricky with filters because of the order of creation.

### Common Viva Questions

- Q: What is the difference between `@Component` and `@Service`?
- A: Both are stereotypes that tell Spring to automatically discover and create the class as a bean. `@Service` is a more specific stereotype for service-layer classes. In practice, they work the same way.
- Q: What is `OncePerRequestFilter`?
- A: It's a Spring Security filter that is guaranteed to execute only once per request. This prevents issues where a filter might run multiple times during request dispatching.
- Q: What is `SecurityContextHolder`?
- A: It's a class that stores the current security context (including the authenticated user) for the current thread. Spring Security uses it to check who is making the request.
- Q: What are "authorities" or "roles"?
- A: Authorities are permissions granted to the authenticated user. In this project, they are based on the user's role (e.g., `ROLE_LEARNER`, `ROLE_MENTOR`). Spring Security uses them to check if the user is allowed to access a URL.

---

## 4. DataSeeder.java

**File:** `config/DataSeeder.java`
**Purpose:** Inserts default data into the database when the application starts.

### Class-level Annotations

| Annotation | What it does |
|---|---|
| `@Component` | Marks this class as a Spring component. |

### Class Declaration

```java
@Component
public class DataSeeder implements CommandLineRunner
```

**What it does:** Implements `CommandLineRunner`, which is a Spring Boot interface. The `run()` method is called automatically after the Spring container is fully initialized and the web server is started.

### Constructor

```java
public DataSeeder(AcademicUserRepository userRepository,
                  StudySubjectRepository subjectRepository,
                  PasswordEncoder passwordEncoder)
```

Spring automatically passes the repositories and password encoder.

### The `run()` Method

```java
@Override
public void run(String... args) throws Exception {
    // Seed default academic subjects
    seedSubject("Mathematics", "Study of numbers, space, and structure");
    seedSubject("Physics", "Study of matter, energy, space, and time");
    seedSubject("Computer Science", "Study of algorithmic processes and computation");
    seedSubject("Chemistry", "Study of substances and chemical reactions");

    // Seed admin user
    if (!userRepository.existsByEmail("admin@loomlearn.com")) {
        AcademicUser admin = AcademicUser.builder()
            .fullName("Academic Admin")
            .email("admin@loomlearn.com")
            .password(passwordEncoder.encode("admin123"))
            .role(UserRole.ACADEMIC_ADMIN)
            .status(UserStatus.APPROVED)
            .department("Administration")
            .bio("LoomLearn System Administrator")
            .build();
        userRepository.save(admin);
    }

    // Seed support agent user
    if (!userRepository.existsByEmail("support@loomlearn.com")) {
        AcademicUser support = AcademicUser.builder()
            .fullName("Support Agent")
            .email("support@loomlearn.com")
            .password(passwordEncoder.encode("support123"))
            .role(UserRole.SUPPORT_AGENT)
            .status(UserStatus.APPROVED)
            .department("Support")
            .bio("LoomLearn Customer Support Agent")
            .build();
        userRepository.save(support);
    }
}
```

### What it does

1. **Seeds subjects** — Creates 4 default subjects (Mathematics, Physics, Computer Science, Chemistry) if they don't already exist.
2. **Seeds admin user** — Creates an admin user with email `admin@loomlearn.com` and password `admin123` (BCrypt-hashed).
3. **Seeds support agent** — Creates a support agent with email `support@loomlearn.com` and password `support123` (BCrypt-hashed).

### The `seedSubject` Helper Method

```java
private void seedSubject(String name, String description) {
    if (!subjectRepository.findByName(name).isPresent()) {
        StudySubject subject = StudySubject.builder()
            .name(name)
            .description(description)
            .build();
        subjectRepository.save(subject);
    }
}
```

**What it does:** Checks if a subject with the given name already exists. If not, creates and saves it. This prevents duplicate subjects on restart.

### Why this matters

- Without the `DataSeeder`, the database would be empty on first run.
- The admin and support users are needed to test the admin features.
- The subjects are needed to create tutoring sessions.
- The `existsByEmail` and `findByName` checks ensure the seeder is **idempotent** — running it multiple times doesn't create duplicates.

### Common Viva Questions

- Q: What is `CommandLineRunner`?
- A: It's a Spring Boot interface with a `run()` method that is called after the application starts. It's used for initialization tasks like seeding data.
- Q: Why check `existsByEmail` before creating users?
- A: To make the seeder idempotent. If the application restarts, it shouldn't create duplicate users.
- Q: Why hash the passwords in the seeder?
- A: Passwords should never be stored in plain text. The `PasswordEncoder` (BCrypt) hashes them before saving.

---

## 5. JwtUtil.java

**File:** `util/JwtUtil.java`
**Purpose:** Handles JWT (JSON Web Token) operations.

### Class-level Annotations

| Annotation | What it does |
|---|---|
| `@Component` | Marks this class as a Spring component. |

### Fields

| Field | Type | Annotation | Description |
|---|---|---|---|
| `secret` | `String` | `@Value("${loomlearn.jwt.secret:defaultSecretKey...}")` | The secret key used to sign JWT tokens. Read from `application.properties`. If not set, uses a default. |
| `expirationTime` | `long` | `@Value("${loomlearn.jwt.expiration:86400000}")` | Token expiration time in milliseconds (default: 24 hours = 86,400,000 ms). |

### Methods

#### 1. `getSigningKey()` → `Key`

```java
private Key getSigningKey() {
    return Keys.hmacShaKeyFor(secret.getBytes());
}
```

**What it does:** Creates an HMAC SHA-256 signing key from the secret string. This key is used to sign and verify JWT tokens.

#### 2. `generateToken(String email)` → `String`

```java
public String generateToken(String email) {
    return Jwts.builder()
        .setSubject(email)
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
        .signWith(getSigningKey(), SignatureAlgorithm.HS256)
        .compact();
}
```

**What it does:** Creates a JWT token:
- **Subject:** The user's email (used to identify the user).
- **Issued at:** The current time.
- **Expiration:** Current time + expiration time (24 hours by default).
- **Signature:** HMAC SHA-256 using the secret key.

#### 3. `validateToken(String token)` → `boolean`

```java
public boolean validateToken(String token) {
    try {
        Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token);
        return true;
    } catch (Exception e) {
        return false;
    }
}
```

**What it does:** Tries to parse the token. If parsing succeeds, the token is valid. If it throws an exception (expired, invalid signature, etc.), the token is invalid.

#### 4. `extractEmail(String token)` → `String`

```java
public String extractEmail(String token) {
    Claims claims = Jwts.parserBuilder()
        .setSigningKey(getSigningKey())
        .build()
        .parseClaimsJws(token)
        .getBody();
    return claims.getSubject();
}
```

**What it does:** Parses the token and returns the subject (the user's email).

### What is `@Value`?

`@Value` is a Spring annotation that injects values from configuration files (like `application.properties`) into fields. The syntax is:

```java
@Value("${property.name:default_value}")
```

- `${property.name}` — The property name in `application.properties`.
- `:default_value` — The default value if the property is not set.

### Common Viva Questions

- Q: What is a JWT?
- A: JWT (JSON Web Token) is a compact, URL-safe way to transmit information between parties. It consists of three parts: header.payload.signature. The header contains the algorithm, the payload contains claims (like the subject and expiration), and the signature is used to verify the token hasn't been tampered with.
- Q: What is HS256?
- A: HS256 is HMAC with SHA-256. It's a symmetric signing algorithm — the same key is used to sign and verify the token.
- Q: What happens if the JWT secret is compromised?
- A: An attacker could forge tokens and impersonate any user. The secret should be kept secure and rotated periodically.
- Q: What is the default secret in this project?
- A: `defaultSecretKeyWithAtLeast256BitsLengthToAvoidWeakExceptions!` — This is a fallback if the property is not set in `application.properties`. In production, you should set a strong, unique secret.
