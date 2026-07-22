# PROJECT OVERVIEW

## Purpose of the Project

**LoomLearn** is a **Collaborative Peer-to-Peer Tutoring System**.

The project connects three types of users:

1. **Learners** — students who want to learn a subject by enrolling in tutoring sessions.
2. **Mentors** — students or teachers who create and run tutoring sessions on a subject they know.
3. **Academic Admins / Support Agents** — administrators who manage the platform, approve mentors, and view analytics.

### What the system does

- **User Registration & Login** — Anyone can register as a Learner or Mentor. Login returns a JWT token.
- **Session Management** — Mentors (or admins) can create, update, cancel, and change the status of tutoring sessions.
- **Enrollment** — Learners can enroll in scheduled sessions. The system checks capacity and prevents duplicate enrollment.
- **Feedback** — Learners can submit feedback (rating + comment) for mentors after a session.
- **Analytics** — Admins can see platform-wide statistics. Mentors can see their own dashboard stats.
- **Subject Management** — Admins can create, update, and delete study subjects.
- **User Management** — Admins can view user profiles and change user status (approve/block).

---

## Technologies Used

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Java** | 17 | Programming language |
| **Spring Boot** | 3.2.5 | Main framework — makes building web apps easy |
| **Maven** | 3.9.16 (via wrapper) | Build tool — manages dependencies and packaging |
| **Spring Web** | (starter) | Builds REST APIs (HTTP endpoints) |
| **Spring Data JPA** | (starter) | Talks to the database using Java objects |
| **Hibernate** | (included with JPA) | The actual ORM engine that maps Java objects to database tables |
| **Spring Security** | (starter) | Handles authentication and authorization (who can do what) |
| **BCrypt** | (via Spring Security) | Encrypts passwords so they are never stored in plain text |
| **JWT (JJWT)** | 0.11.5 | Creates and verifies JSON Web Tokens for stateless login |
| **MySQL Connector/J** | 8.3.0 | Driver that lets Java talk to a MySQL database |
| **Spring Validation** | (starter) | Validates input data (e.g., checking if a field is empty) |
| **Lombok** | (optional) | Would reduce boilerplate code (getters/setters) — not actively used in this project |
| **springdoc-openapi** | 2.5.0 | Generates Swagger UI for API documentation |
| **Mockito** | 5.11.0 (test) | For writing unit tests with mock objects |
| **TestNG** | 7.7.1 (test) | Test framework |
| **Spring Security Test** | (test) | For testing security features |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2.6 | JavaScript library for building user interfaces |
| **Vite** | 8.0.12 | Build tool and dev server for React |
| **ESLint** | 10.3.0 | Code linting (checking for errors) |

> **Note:** The frontend currently contains only the default Vite + React template. The full frontend described in the SRS (with Redux Toolkit, React Router, Axios, etc.) is planned but not yet implemented in the actual code.

### Database

| Technology | Version | Purpose |
|---|---|---|
| **MySQL** | (any recent) | Relational database storing all application data |

---

## Folder Structure

```
Amypo Project/
├── LoomLearn_SRS.md              ← Software Requirements Specification (project plan)
├── backend/                      ← Spring Boot backend
│   ├── .mvn/wrapper/             ← Maven wrapper configuration
│   ├── mvnw                    ← Maven wrapper script
│   ├── pom.xml                 ← Maven build configuration (dependencies, plugins)
│   └── src/main/
│       ├── java/com/example/demo/
│       │   ├── DemoApplication.java          ← Main entry point
│       │   ├── config/
│       │   │   ├── DataSeeder.java           ← Seeds initial data on startup
│       │   │   ├── JwtAuthenticationFilter.java ← JWT filter for security
│       │   │   └── SecurityConfig.java       ← Security configuration
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   ├── UserController.java
│       │   │   ├── SubjectController.java
│       │   │   ├── SessionController.java
│       │   │   ├── EnrollmentController.java
│       │   │   ├── FeedbackController.java
│       │   │   └── AnalyticsController.java
│       │   ├── service/
│       │   │   ├── AcademicAuthService.java
│       │   │   ├── AdministrativeService.java
│       │   │   ├── EnrollmentWorkflowService.java
│       │   │   ├── FeedbackModerationService.java
│       │   │   ├── FeedbackService.java
│       │   │   └── SessionManagementService.java
│       │   ├── repository/
│       │   │   ├── AcademicUserRepository.java
│       │   │   ├── TutoringSessionRepository.java
│       │   │   ├── StudySubjectRepository.java
│       │   │   ├── SessionEnrollmentRepository.java
│       │   │   └── MentorFeedbackRepository.java
│       │   ├── entity/
│       │   │   ├── AcademicUser.java
│       │   │   ├── TutoringSession.java
│       │   │   ├── StudySubject.java
│       │   │   ├── SessionEnrollment.java
│       │   │   └── MentorFeedback.java
│       │   ├── dto/
│       │   │   ├── AuthRequestDto.java
│       │   │   ├── AuthResponseDto.java
│       │   │   ├── RegisterDto.java
│       │   │   ├── SessionDto.java
│       │   │   ├── EnrollmentResponseDto.java
│       │   │   └── FeedbackResponseDto.java
│       │   ├── enums/
│       │   │   ├── UserRole.java
│       │   │   ├── UserStatus.java
│       │   │   ├── EnrollmentStatus.java
│       │   │   └── SessionStatus.java
│       │   ├── exception/
│       │   │   ├── BusinessValidationException.java
│       │   │   ├── ResourceNotFoundException.java
│       │   │   └── GlobalExceptionHandler.java
│       │   └── util/
│       │       └── JwtUtil.java
│       └── resources/
│           └── application.properties
├── frontend/                     ← React frontend (basic template)
│   ├── package.json
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── App.css
│       ├── index.css
│       └── assets/
│           ├── hero.png
│           ├── react.svg
│           └── vite.svg
└── Documentation/                ← This documentation folder (newly created)
```

---

## High-Level Architecture

The project follows a **layered (n-tier) architecture**:

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                 │
│                    (planned, not built)             │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP requests (REST API)
┌──────────────────────▼──────────────────────────────┐
│                  Controller Layer                   │
│   (Receives HTTP requests, returns HTTP responses)  │
│   AuthController, SessionController, etc.           │
└──────────────────────┬──────────────────────────────┘
                       │ Calls
┌──────────────────────▼──────────────────────────────┐
│                  Service Layer                       │
│   (Contains business logic — the "rules" of the app)│
│   AcademicAuthService, SessionManagementService, etc.│
└──────────────────────┬──────────────────────────────┘
                       │ Calls
┌──────────────────────▼──────────────────────────────┐
│                Repository Layer                      │
│   (Talks to the database using Spring Data JPA)     │
│   AcademicUserRepository, SessionRepository, etc.   │
└──────────────────────┬──────────────────────────────┘
                       │ Talks to
┌──────────────────────▼──────────────────────────────┐
│                  Database (MySQL)                   │
│   Tables: academic_users, tutoring_sessions,        │
│   study_subjects, session_enrollments, mentor_feedback│
└─────────────────────────────────────────────────────┘
```

### Key Concepts

- **Controller** = The "receptionist." It receives your HTTP request, asks the service to do something, and sends back the response.
- **Service** = The "manager." It contains the business rules (e.g., "you can only enroll if the session is SCHEDULED and not full").
- **Repository** = The "filing clerk." It saves, reads, updates, and deletes data from the database.
- **Entity** = A Java class that represents one database table.
- **DTO** = A plain Java object used to transfer data between the frontend and backend.
- **Security Filter** = A gatekeeper that checks the JWT token on every request.

---

## How the Application Starts

1. **You run** `DemoApplication.java` (the `main` method).
2. Spring Boot starts up and does a **component scan** — it finds all classes annotated with `@Component`, `@Service`, `@Repository`, `@RestController`, `@Configuration`, etc.
3. Spring Boot reads `application.properties` to learn:
   - The app name is "demo"
   - The database is MySQL at `localhost:3306/loomlearn` with username `root` / password `root`
   - JPA should auto-create/update tables (`ddl-auto=update`)
   - SQL should be printed to the console (`show-sql=true`)
4. Spring Boot creates **beans** (objects managed by Spring):
   - `PasswordEncoder` (BCrypt)
   - `SecurityFilterChain` (security rules)
   - `OpenAPI` (Swagger docs)
   - All `@Service`, `@Repository`, `@RestController`, `@Component` classes
5. **`DataSeeder`** runs (it implements `CommandLineRunner`) — it inserts default subjects (Math, Physics, etc.) and default admin/support users.
6. The app is now **listening** on port 8080 (default Spring Boot port).

---

## Request Lifecycle

Here is what happens when a client (e.g., a browser or mobile app) sends an HTTP request:

### Step-by-step for a protected API (e.g., `GET /api/sessions`)

1. **Client sends** `GET /api/sessions` with an `Authorization: Bearer <jwt-token>` header.
2. **CORS check** — Spring Security checks if the origin (e.g., `http://localhost:3000`) is allowed.
3. **CSRF check** — Disabled (stateless API, no browser form submissions).
4. **`JwtAuthenticationFilter`** runs (it is placed before Spring's default filter):
   - Extracts the `Bearer` token from the `Authorization` header.
   - Calls `JwtUtil.validateToken()` to check if the token is valid.
   - If valid, calls `JwtUtil.extractEmail()` to get the user's email.
   - Looks up the user in the database (`AcademicUserRepository.findByEmail`).
   - If the user is `APPROVED`, creates an `UsernamePasswordAuthenticationToken` with the user's roles and stores it in `SecurityContextHolder`.
5. **Authorization check** — Spring Security checks if the user's role is allowed to access `/api/sessions`.
6. **Controller** — `SessionController.getAll()` is called.
7. **Service** — `SessionManagementService.getAvailableSessions()` is called.
8. **Repository** — `TutoringSessionRepository.findByStatusIn()` runs a SQL query.
9. **Database** — MySQL returns the results.
10. **Response** — The results flow back: Repository → Service → Controller → HTTP response → Client.

### For a public API (e.g., `POST /api/auth/login`)

1. **Client sends** `POST /api/auth/login` with email and password in the JSON body.
2. Spring Security allows this through (it is in the `permitAll` list).
3. **`AuthController.login()`** is called.
4. **`AcademicAuthService.login()`** is called:
   - Finds the user by email.
   - Checks the password using BCrypt.
   - Checks if the account is `APPROVED`.
   - Generates a JWT token using `JwtUtil.generateToken()`.
5. **Response** — Returns `AuthResponseDto` (with token, user id, name, email, role) as JSON.

---

## Database Flow

### Tables and Their Relationships

```
academic_users
├── id (PK)
├── full_name
├── email (unique)
├── password
├── role (enum)
├── department
├── bio (TEXT)
└── status (enum)

study_subjects
├── id (PK)
├── name (unique)
└── description (TEXT)

tutoring_sessions
├── id (PK)
├── title
├── description (TEXT)
├── start_time
├── end_time
├── max_capacity
├── current_enrollment
├── status (enum)
├── mentor_id (FK → academic_users.id)
└── subject_id (FK → study_subjects.id)

session_enrollments
├── id (PK)
├── enrollment_date
├── status (enum)
├── feedback_submitted (boolean)
├── learner_id (FK → academic_users.id)
└── session_id (FK → tutoring_sessions.id)

mentor_feedback
├── id (PK)
├── rating
├── comment (TEXT)
├── learner_id (FK → academic_users.id)
├── mentor_id (FK → academic_users.id)
└── session_id (FK → tutoring_sessions.id, unique)
```

### How JPA Works in This Project

1. **Entity classes** (like `AcademicUser`, `TutoringSession`) are annotated with `@Entity` and `@Table`.
2. **Spring Data JPA** automatically generates the SQL `CREATE TABLE` statements based on these entities (because `ddl-auto=update`).
3. **Repositories** (like `AcademicUserRepository`) extend `JpaRepository`. You don't write SQL for basic operations — Spring Data JPA generates it from method names:
   - `findByEmail(email)` → `SELECT * FROM academic_users WHERE email = ?`
   - `countByRole(role)` → `SELECT COUNT(*) FROM academic_users WHERE role = ?`
4. For custom queries, you use `@Query` with JPQL (Java Persistence Query Language):
   - `getAverageRatingByMentorId` → `SELECT AVG(f.rating) FROM MentorFeedback f WHERE f.mentor.id = :mentorId`
5. **Relationships** are defined with annotations:
   - `@ManyToOne` — Many sessions belong to one mentor.
   - `@OneToOne` — One feedback belongs to one session.
   - `@Enumerated(EnumType.STRING)` — Store enums as text (e.g., "LEARNER") instead of numbers.
6. **Lazy vs Eager loading**:
   - `@ManyToOne(fetch = FetchType.LAZY)` — The related object is loaded only when you call its getter (saves memory).
   - `@ManyToOne(fetch = FetchType.EAGER)` — The related object is loaded immediately with the main object.

### Transactions

- Methods annotated with `@Transactional` run in a database transaction.
- If something goes wrong, the transaction **rolls back** (all changes are undone).
- `EnrollmentWorkflowService.enrollLearner()` and `cancelEnrollment()` are `@Transactional(rollbackFor = Exception.class)` — this is critical because they modify both the enrollment and the session's `currentEnrollment` count. If one fails, both must be undone.
