# POM

This document explains every dependency in `pom.xml`.

---

## What is pom.xml?

`pom.xml` (Project Object Model) is the configuration file for Maven, the build tool used by this project. It defines:
- The project's name, version, and packaging.
- The parent project (Spring Boot Starter Parent).
- All dependencies (libraries) the project needs.
- Build plugins (like the Spring Boot Maven plugin).

---

## Project Coordinates

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.5</version>
    <relativePath/>
</parent>

<groupId>com.example</groupId>
<artifactId>demo</artifactId>
<version>0.0.1-SNAPSHOT</version>
<name>demo</name>
```

| Element | Value | Meaning |
|---|---|---|
| Parent | `spring-boot-starter-parent:3.2.5` | Inherits Spring Boot's default configuration (dependency versions, plugins, etc.) |
| groupId | `com.example` | The organization/group that created the project |
| artifactId | `demo` | The project name |
| version | `0.0.1-SNAPSHOT` | Development version (SNAPSHOT means it's not yet released) |
| Java version | 17 | The project uses Java 17 |

---

## Dependencies

### 1. Spring Boot Starter Web

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

**What it does:** Provides everything needed to build a web application (REST APIs). It includes:
- Spring MVC (for handling HTTP requests)
- Tomcat (embedded web server)
- Jackson (for JSON serialization/deserialization)

**Why it's needed:** All the controllers (`@RestController`) rely on this. Without it, the application can't handle HTTP requests.

**What happens if removed:** The application won't start. Controllers won't work. No web server will run.

---

### 2. Spring Boot Starter Data JPA

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

**What it does:** Provides everything needed for database access using JPA (Java Persistence API). It includes:
- Spring Data JPA (repository support)
- Hibernate (the JPA implementation)
- JPA annotations (`@Entity`, `@Table`, `@Id`, etc.)

**Why it's needed:** All the repositories (`@Repository` interfaces extending `JpaRepository`) and entities (`@Entity` classes) rely on this.

**What happens if removed:** Repositories won't work. Entities won't be recognized. Database access fails.

---

### 3. Spring Boot Starter Security

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

**What it does:** Provides everything needed for security. It includes:
- Spring Security (authentication and authorization)
- Default security filters
- Password encoding support

**Why it's needed:** The `SecurityConfig`, `JwtAuthenticationFilter`, and all role-based access control rely on this.

**What happens if removed:** No security. All endpoints would be public. The `@EnableWebSecurity` annotation wouldn't work.

---

### 4. Spring Security Core (explicit)

```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-core</artifactId>
</dependency>
```

**What it does:** Provides the core Spring Security classes.

**Why it's needed:** The comment says "Explicit security jars for test compilation." It ensures the security core classes are available even in test scope.

**What happens if removed:** Usually nothing, because `spring-boot-starter-security` already includes it. But it's kept for explicitness.

---

### 5. Spring Security Config (explicit)

```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-config</artifactId>
</dependency>
```

**What it does:** Provides Spring Security configuration support (e.g., `@EnableWebSecurity`, `SecurityFilterChain`).

**Why it's needed:** The `SecurityConfig` class uses these.

**What happens if removed:** The `SecurityConfig` class won't compile. Security configuration won't work.

---

### 6. Spring Security Web (explicit)

```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-web</artifactId>
</dependency>
```

**What it does:** Provides Spring Security web support (filters, `OncePerRequestFilter`, etc.).

**Why it's needed:** The `JwtAuthenticationFilter` extends `OncePerRequestFilter`, which is in this package.

**What happens if removed:** The `JwtAuthenticationFilter` won't compile. The JWT filter won't work.

---

### 7. Spring Boot Starter Validation

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

**What it does:** Provides Bean Validation (JSR-380) support. It includes Hibernate Validator.

**Why it's needed:** Although the current code doesn't use validation annotations (like `@NotNull`, `@Size`), the starter is included for future use. The SRS mentions validation requirements.

**What happens if removed:** Validation annotations won't work. But since the current code doesn't use them, nothing breaks.

---

### 8. MySQL Connector/J

```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.3.0</version>
</dependency>
```

**What it does:** The JDBC driver for MySQL. It allows Java to connect to and talk to a MySQL database.

**Why it's needed:** The `application.properties` configures a MySQL database (`jdbc:mysql://localhost:3306/loomlearn`). Without this driver, the application can't connect to MySQL.

**What happens if removed:** The application fails to start with a "No suitable driver" error. Database connections fail.

---

### 9. JJWT API

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
```

**What it does:** Provides the API for creating and parsing JWT (JSON Web Token) tokens.

**Why it's needed:** The `JwtUtil` class uses JJWT to generate, validate, and parse JWT tokens.

**What happens if removed:** The `JwtUtil` class won't compile. JWT authentication fails.

---

### 10. JJWT Impl (runtime)

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
```

**What it does:** Provides the implementation of the JJWT API.

**Why it's needed:** The API alone doesn't do anything — you need the implementation to actually create and parse tokens.

**What happens if removed:** Runtime error when trying to use JWT. "No implementation found" error.

---

### 11. JJWT Jackson (runtime)

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
```

**What it does:** Provides JSON serialization/deserialization for JJWT using the Jackson library.

**Why it's needed:** JWT tokens contain JSON payloads. This library handles the JSON conversion.

**What happens if removed:** Runtime error when trying to create or parse JWT tokens.

---

### 12. Lombok

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

**What it does:** Reduces boilerplate code (getters, setters, constructors, etc.) using annotations like `@Getter`, `@Setter`, `@Data`, `@Builder`.

**Why it's needed:** The current code does NOT use Lombok annotations — all getters/setters are written manually. However, the dependency is included for future use or because the SRS mentions it.

**What happens if removed:** Nothing, since the current code doesn't use Lombok. But if Lombok annotations were added, the code wouldn't compile.

**Note:** The `optional=true` flag means Lombok is not included in the final package. It's only needed at compile time.

---

### 13. Mockito (test)

```xml
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-core</artifactId>
    <version>5.11.0</version>
    <scope>test</scope>
</dependency>
```

**What it does:** A mocking framework for unit tests. It allows you to create "mock" objects that simulate the behavior of real objects.

**Why it's needed:** For writing unit tests. You can mock repositories and services to test controllers in isolation.

**What happens if removed:** Unit tests that use mocks won't compile. But since there are no test files in the project, nothing breaks.

**Note:** The `scope=test` flag means this dependency is only available during testing, not in the final application.

---

### 14. TestNG (test)

```xml
<dependency>
    <groupId>org.testng</groupId>
    <artifactId>testng</artifactId>
    <version>7.7.1</version>
    <scope>test</scope>
</dependency>
```

**What it does:** A test framework (alternative to JUnit). It provides annotations like `@Test`, `@BeforeMethod`, `@AfterMethod`.

**Why it's needed:** For writing and running tests.

**What happens if removed:** Tests that use TestNG annotations won't compile.

**Note:** The `scope=test` flag means this is only for testing.

---

### 15. Spring Security Test (test)

```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-test</artifactId>
    <scope>test</scope>
</dependency>
```

**What it does:** Provides utilities for testing Spring Security features (e.g., mocking authenticated users, testing role-based access).

**Why it's needed:** For testing security-related features.

**What happens if removed:** Security tests won't compile.

**Note:** The `scope=test` flag means this is only for testing.

---

### 16. SpringDoc OpenAPI UI

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.5.0</version>
</dependency>
```

**What it does:** Automatically generates API documentation and provides a Swagger UI web interface.

**Why it's needed:** The `SecurityConfig` class configures OpenAPI (Swagger). Without this dependency, the Swagger UI wouldn't be available.

**What happens if removed:** The `/swagger-ui.html` and `/v3/api-docs` endpoints won't work. The `OpenAPI` bean in `SecurityConfig` won't compile.

**Swagger UI URL:** `http://localhost:8080/swagger-ui.html`

---

## Build Plugins

### Spring Boot Maven Plugin

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
</plugin>
```

**What it does:** Allows you to package the application as an executable JAR file (with an embedded web server). You can run it with `java -jar demo-0.0.1-SNAPSHOT.jar`.

**What happens if removed:** You can't create an executable JAR. The application can only be run from the IDE or with `mvn spring-boot:run`.

### Maven Surefire Plugin

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>3.1.2</version>
    <configuration>
        <includes>
            <include>**/*Tests.java</include>
            <include>**/*Test.java</include>
        </includes>
    </configuration>
</plugin>
```

**What it does:** Runs unit tests during the build process. It's configured to look for test classes matching `**/*Tests.java` or `**/*Test.java`.

**What happens if removed:** Tests are not run during the build.

---

## Summary Table

| Dependency | Scope | Purpose | Critical? |
|---|---|---|---|
| spring-boot-starter-web | compile | Web server, REST APIs | Yes |
| spring-boot-starter-data-jpa | compile | Database access | Yes |
| spring-boot-starter-security | compile | Security framework | Yes |
| spring-security-core | compile | Security core classes | Yes (via starter) |
| spring-security-config | compile | Security configuration | Yes (via starter) |
| spring-security-web | compile | Security web filters | Yes (via starter) |
| spring-boot-starter-validation | compile | Bean validation | No (not used yet) |
| mysql-connector-j | compile | MySQL JDBC driver | Yes |
| jjwt-api | compile | JWT API | Yes |
| jjwt-impl | runtime | JWT implementation | Yes |
| jjwt-jackson | runtime | JWT JSON support | Yes |
| lombok | compile (optional) | Reduce boilerplate | No (not used) |
| mockito-core | test | Mocking for tests | No (no tests) |
| testng | test | Test framework | No (no tests) |
| spring-security-test | test | Security test utils | No (no tests) |
| springdoc-openapi-starter-webmvc-ui | compile | Swagger UI | No (but useful) |

**Common Viva Questions:**
- Q: What is the difference between `compile`, `runtime`, and `test` scope?
- A: `compile` is available at compile time and runtime. `runtime` is only needed at runtime (not for compilation). `test` is only available during testing.
- Q: What does `optional=true` mean for Lombok?
- A: It means Lombok is not included in the final package. It's only needed at compile time.
- Q: What is the Spring Boot Maven plugin?
- A: It packages the application as an executable JAR with an embedded web server.
- Q: What is Swagger/OpenAPI?
- A: It's a tool that automatically generates API documentation. You can test all endpoints in a web browser at `/swagger-ui.html`.
