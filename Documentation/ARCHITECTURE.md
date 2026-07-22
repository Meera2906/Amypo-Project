# ARCHITECTURE

This document contains Mermaid diagrams showing the architecture of the project.

---

## 1. Overall Architecture

```mermaid
graph TB
    subgraph "Frontend (React + Vite)"
        FE[React App<br/>localhost:3000]
    end

    subgraph "Backend (Spring Boot)"
        subgraph "Controller Layer"
            C1[AuthController<br/>/api/auth]
            C2[UserController<br/>/api/users]
            C3[SubjectController<br/>/api/subjects]
            C4[SessionController<br/>/api/sessions]
            C5[EnrollmentController<br/>/api/enrollments]
            C6[FeedbackController<br/>/api/feedback]
            C7[AnalyticsController<br/>/api/analytics]
        end

        subgraph "Service Layer"
            S1[AcademicAuthService]
            S2[AdministrativeService]
            S3[EnrollmentWorkflowService]
            S4[FeedbackModerationService]
            S5[FeedbackService]
            S6[SessionManagementService]
        end

        subgraph "Repository Layer"
            R1[AcademicUserRepository]
            R2[TutoringSessionRepository]
            R3[StudySubjectRepository]
            R4[SessionEnrollmentRepository]
            R5[MentorFeedbackRepository]
        end

        subgraph "Config & Security"
            SEC[SecurityConfig]
            JWT[JwtAuthenticationFilter]
            SEED[DataSeeder]
            UTIL[JwtUtil]
        end
    end

    subgraph "Database"
        DB[(MySQL<br/>loomlearn)]
    end

    FE -->|HTTP requests| C1
    FE -->|HTTP requests| C2
    FE -->|HTTP requests| C3
    FE -->|HTTP requests| C4
    FE -->|HTTP requests| C5
    FE -->|HTTP requests| C6
    FE -->|HTTP requests| C7

    C1 --> S1
    C2 --> R1
    C3 --> R3
    C4 --> S6
    C5 --> S3
    C5 --> R4
    C6 --> S5
    C7 --> S2

    S1 --> R1
    S1 --> UTIL
    S2 --> R1
    S2 --> R2
    S2 --> R3
    S2 --> R5
    S3 --> R4
    S3 --> R2
    S3 --> R1
    S4 --> R5
    S4 --> R1
    S4 --> R2
    S5 --> R5
    S5 --> R1
    S5 --> R2
    S5 --> R4
    S6 --> R2
    S6 --> R1
    S6 --> R3

    R1 --> DB
    R2 --> DB
    R3 --> DB
    R4 --> DB
    R5 --> DB

    SEC --> JWT
    SEC --> SEED
    JWT --> UTIL
    JWT --> R1
```

---

## 2. Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant JwtFilter
    participant SpringSecurity
    participant Controller
    participant Service
    participant Repository
    participant Database

    Client->>JwtFilter: HTTP Request with Bearer Token
    JwtFilter->>JwtFilter: Extract token from Authorization header
    JwtFilter->>JwtFilter: Validate token (JwtUtil)
    JwtFilter->>JwtFilter: Extract email (JwtUtil)
    JwtFilter->>Repository: findByEmail(email)
    Repository->>Database: SELECT * FROM academic_users WHERE email = ?
    Database-->>Repository: User
    Repository-->>JwtFilter: User
    JwtFilter->>JwtFilter: Check status == APPROVED
    JwtFilter->>JwtFilter: Create UsernamePasswordAuthenticationToken
    JwtFilter->>SpringSecurity: Set authentication in SecurityContextHolder
    SpringSecurity->>SpringSecurity: Check role-based access
    SpringSecurity->>Controller: Forward request
    Controller->>Service: Call service method
    Service->>Repository: Call repository method
    Repository->>Database: Execute SQL
    Database-->>Repository: Results
    Repository-->>Service: Results
    Service-->>Controller: Results
    Controller-->>Client: HTTP Response (JSON)
```

---

## 3. Package Dependency

```mermaid
graph LR
    subgraph "com.example.demo"
        ROOT[DemoApplication]
        CONFIG[config/]
        CONTROLLER[controller/]
        SERVICE[service/]
        REPOSITORY[repository/]
        ENTITY[entity/]
        DTO[dto/]
        ENUMS[enums/]
        EXCEPTION[exception/]
        UTIL[util/]
    end

    ROOT --> CONFIG
    ROOT --> CONTROLLER
    ROOT --> SERVICE
    ROOT --> REPOSITORY
    ROOT --> ENTITY
    ROOT --> DTO
    ROOT --> ENUMS
    ROOT --> EXCEPTION
    ROOT --> UTIL

    CONTROLLER --> SERVICE
    CONTROLLER --> REPOSITORY
    CONTROLLER --> ENTITY
    CONTROLLER --> DTO
    CONTROLLER --> EXCEPTION

    SERVICE --> REPOSITORY
    SERVICE --> ENTITY
    SERVICE --> DTO
    SERVICE --> EXCEPTION
    SERVICE --> ENUMS
    SERVICE --> UTIL

    REPOSITORY --> ENTITY
    REPOSITORY --> ENUMS

    CONFIG --> ENTITY
    CONFIG --> REPOSITORY
    CONFIG --> UTIL
    CONFIG --> ENUMS

    ENTITY --> ENUMS

    DTO --> ENTITY
    DTO --> ENUMS
```

---

## 4. Database Relationships

```mermaid
erDiagram
    ACADEMIC_USERS ||--o{ TUTORIAL_SESSIONS : "mentor_id"
    ACADEMIC_USERS ||--o{ SESSION_ENROLLMENTS : "learner_id"
    ACADEMIC_USERS ||--o{ MENTOR_FEEDBACK : "learner_id"
    ACADEMIC_USERS ||--o{ MENTOR_FEEDBACK : "mentor_id"
    STUDY_SUBJECTS ||--o{ TUTORIAL_SESSIONS : "subject_id"
    TUTORIAL_SESSIONS ||--o{ SESSION_ENROLLMENTS : "session_id"
    TUTORIAL_SESSIONS ||--|| MENTOR_FEEDBACK : "session_id"

    ACADEMIC_USERS {
        BIGINT id PK
        VARCHAR full_name
        VARCHAR email UK
        VARCHAR password
        VARCHAR role
        VARCHAR department
        TEXT bio
        VARCHAR status
    }

    STUDY_SUBJECTS {
        BIGINT id PK
        VARCHAR name UK
        TEXT description
    }

    TUTORIAL_SESSIONS {
        BIGINT id PK
        VARCHAR title
        TEXT description
        DATETIME start_time
        DATETIME end_time
        INT max_capacity
        INT current_enrollment
        VARCHAR status
        BIGINT mentor_id FK
        BIGINT subject_id FK
    }

    SESSION_ENROLLMENTS {
        BIGINT id PK
        DATETIME enrollment_date
        VARCHAR status
        TINYINT feedback_submitted
        BIGINT learner_id FK
        BIGINT session_id FK
    }

    MENTOR_FEEDBACK {
        BIGINT id PK
        INT rating
        TEXT comment
        BIGINT learner_id FK
        BIGINT mentor_id FK
        BIGINT session_id FK UK
    }
```

---

## 5. Layered Architecture

```mermaid
graph TD
    subgraph "Layer 1: Presentation"
        FE[Frontend<br/>React/Vite<br/>localhost:3000]
    end

    subgraph "Layer 2: Web/API"
        CTRL[Controllers<br/>@RestController<br/>Handle HTTP requests]
    end

    subgraph "Layer 3: Business Logic"
        SVC[Services<br/>@Service<br/>Business rules]
    end

    subgraph "Layer 4: Data Access"
        REPO[Repositories<br/>@Repository<br/>JPA/Hibernate]
    end

    subgraph "Layer 5: Database"
        DB[(MySQL<br/>loomlearn)]
    end

    subgraph "Cross-Cutting"
        SEC[Security<br/>JWT Filter<br/>Spring Security]
        CFG[Configuration<br/>DataSeeder<br/>SecurityConfig]
    end

    FE --> CTRL
    CTRL --> SVC
    SVC --> REPO
    REPO --> DB

    SEC -.-> CTRL
    SEC -.-> SVC
    SEC -.-> REPO

    CFG -.-> REPO
```

---

## 6. Authentication Flow

```mermaid
flowchart TD
    A[Client sends POST /api/auth/login] --> B{Email exists?}
    B -- No --> C[ResourceNotFoundException → 404]
    B -- Yes --> D[Check password with BCrypt]
    D -- Wrong --> E[BusinessValidationException → 400]
    D -- Correct --> F{Status approved?}
    F -- No --> G[BusinessValidationException → 400]
    F -- Yes --> H[Generate JWT token]
    H --> I[Return AuthResponseDto with token]
    I --> J[Client stores token]
    J --> K[Client sends token in Authorization header]
    K --> L[JwtAuthenticationFilter validates token]
    L --> M[Extract email from token]
    M --> N[Look up user by email]
    N --> O{User approved?}
    O -- No --> P[Request blocked]
    O -- Yes --> Q[Create authentication with roles]
    Q --> R[Spring Security checks role-based access]
    R --> S[Controller processes request]
```
