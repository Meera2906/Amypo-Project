# DTOS

This document explains every DTO (Data Transfer Object) in the project.

---

## What is a DTO?

A **DTO (Data Transfer Object)** is a simple Java class used to **transfer data** between the frontend and backend. DTOs are NOT entities — they do not map to database tables.

### Why DTOs are used

1. **Security** — Entities may contain sensitive data (like passwords) that should not be sent to the client. DTOs let you control exactly what data is exposed.
2. **Avoid circular references** — Entities may have circular references (e.g., User → Session → User → Session...). When converted to JSON, this causes infinite loops. DTOs break these cycles.
3. **Flatten nested objects** — Instead of sending the entire `AcademicUser` object inside a `TutoringSession` response, you can flatten it to just include the mentor's name.
4. **Decouple frontend from backend** — The frontend doesn't need to know the internal structure of entities. DTOs provide a stable API contract.

### Key Concepts

- DTOs are plain Java classes with private fields, getters, and setters.
- They do NOT have `@Entity` or any JPA annotations.
- Some DTOs have static `from()` factory methods that convert an entity to a DTO.
- Some DTOs have builder patterns (inner builder classes).

---

## 1. AuthRequestDto

**File:** `dto/AuthRequestDto.java`
**Purpose:** Used for login requests. Contains only the fields needed for authentication.

### Fields

| Field | Type | Description |
|---|---|---|
| `email` | `String` | The user's email address. |
| `password` | `String` | The user's password (plain text, sent over HTTPS). |

### Usage

Sent by the client in the body of `POST /api/auth/login`:

```json
{
  "email": "learner@example.com",
  "password": "password123"
}
```

### Why this DTO exists

Instead of sending the entire `AcademicUser` entity (which has 8 fields including password hash, role, department, bio, status), the client only sends the 2 fields needed for login. This is simpler and more secure.

---

## 2. AuthResponseDto

**File:** `dto/AuthResponseDto.java`
**Purpose:** Returned after successful login or registration. Contains the JWT token and user details.

### Fields

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | The user's ID. |
| `token` | `String` | The JWT token. Used for all subsequent authenticated requests. |
| `fullName` | `String` | The user's full name. |
| `email` | `String` | The user's email address. |
| `role` | `UserRole` | The user's role (LEARNER, MENTOR, etc.). |

### Usage

Returned in the response of `POST /api/auth/login` and `POST /api/auth/register`:

```json
{
  "id": 1,
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "fullName": "John Learner",
  "email": "learner@example.com",
  "role": "LEARNER"
}
```

### Why this DTO exists

- It includes the JWT token, which the client stores and sends in the `Authorization` header for all subsequent requests.
- It does NOT include the password hash — that would be a security vulnerability.
- It includes the role so the frontend can show/hide UI elements based on the user's role.

### Builder Pattern

This DTO has a builder pattern (`AuthResponseDto.builder()...build()`), which is used in the service layer:

```java
return AuthResponseDto.builder()
    .id(user.getId())
    .token(token)
    .fullName(user.getFullName())
    .email(user.getEmail())
    .role(user.getRole())
    .build();
```

---

## 3. RegisterDto

**File:** `dto/RegisterDto.java`
**Purpose:** Used for registration requests. Contains all fields needed to create a new user.

### Fields

| Field | Type | Description |
|---|---|---|
| `fullName` | `String` | The user's full name. |
| `email` | `String` | The user's email address. |
| `password` | `String` | The user's password (plain text, will be hashed by the service). |
| `role` | `UserRole` | The user's role (LEARNER or MENTOR). |
| `department` | `String` | The user's department (optional, mainly for mentors). |
| `bio` | `String` | The user's biography (optional, mainly for mentors). |

### Usage

Sent by the client in the body of `POST /api/auth/register`:

```json
{
  "fullName": "Jane Mentor",
  "email": "jane@example.com",
  "password": "password123",
  "role": "MENTOR",
  "department": "Computer Science",
  "bio": "Experienced in Java"
}
```

### Why this DTO exists

- It provides a clear contract for what fields are needed for registration.
- It does NOT include fields like `id`, `status`, or `password` hash — those are set by the service.
- The `status` field is intentionally excluded because the service sets it automatically (PENDING for mentors, APPROVED for others).

---

## 4. SessionDto

**File:** `dto/SessionDto.java`
**Purpose:** A flattened view of a tutoring session. Used to expose session information without the full entity graph.

### Fields

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | Session ID. |
| `title` | `String` | Session title. |
| `startTime` | `LocalDateTime` | When the session starts. |
| `endTime` | `LocalDateTime` | When the session ends. |
| `maxCapacity` | `Integer` | Maximum number of learners. |
| `currentEnrollment` | `Integer` | Current number of enrolled learners. |
| `mentorName` | `String` | The mentor's full name (flattened from the mentor entity). |
| `subjectName` | `String` | The subject's name (flattened from the subject entity). |

### Why this DTO exists

- Instead of sending the full `AcademicUser` object (with password hash, role, department, bio, status) as the `mentor` field, it only sends the mentor's name.
- Instead of sending the full `StudySubject` object, it only sends the subject's name.
- This reduces the response size and avoids exposing sensitive data.

### Note

This DTO is defined in the code but is NOT currently used by any controller. The `SessionController` returns `TutoringSession` entities directly. It may be intended for future use or for the frontend described in the SRS.

---

## 5. EnrollmentResponseDto

**File:** `dto/EnrollmentResponseDto.java`
**Purpose:** A flattened view of an enrollment. Contains enrollment fields plus learner and session details.

### Fields

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | Enrollment ID. |
| `enrollmentDate` | `LocalDateTime` | When the learner enrolled. |
| `status` | `EnrollmentStatus` | Enrollment status. |
| `feedbackSubmitted` | `boolean` | Whether feedback has been submitted. |
| `learnerId` | `Long` | The learner's ID (flattened). |
| `learnerName` | `String` | The learner's full name (flattened). |
| `learnerEmail` | `String` | The learner's email (flattened). |
| `sessionId` | `Long` | The session's ID (flattened). |
| `sessionTitle` | `String` | The session's title (flattened). |
| `sessionStartTime` | `LocalDateTime` | The session's start time (flattened). |
| `sessionEndTime` | `LocalDateTime` | The session's end time (flattened). |

### The `from()` Factory Method

```java
public static EnrollmentResponseDto from(SessionEnrollment e) {
    EnrollmentResponseDto dto = new EnrollmentResponseDto();
    dto.id = e.getId();
    dto.enrollmentDate = e.getEnrollmentDate();
    dto.status = e.getStatus();
    dto.feedbackSubmitted = e.isFeedbackSubmitted();
    
    if (e.getLearner() != null) {
        dto.learnerId = e.getLearner().getId();
        dto.learnerName = e.getLearner().getFullName();
        dto.learnerEmail = e.getLearner().getEmail();
    }
    
    if (e.getSession() != null) {
        dto.sessionId = e.getSession().getId();
        dto.sessionTitle = e.getSession().getTitle();
        dto.sessionStartTime = e.getSession().getStartTime();
        dto.sessionEndTime = e.getSession().getEndTime();
    }
    
    return dto;
}
```

### Why this DTO exists

- The `SessionEnrollment` entity has `@ManyToOne(fetch = LAZY)` relationships to `AcademicUser` (learner) and `TutoringSession` (session).
- When the entity is serialized to JSON, the lazy-loaded objects might not be loaded yet, causing a `LazyInitializationException`.
- The `from()` method converts the entity to a DTO **while the JPA session is still open** (inside a `@Transactional` method), so the lazy associations can be accessed.
- The DTO contains only the needed fields, not the entire entity objects.

### Usage

Used in `EnrollmentController.getMyEnrollments()`:

```java
List<SessionEnrollment> enrollments = sessionEnrollmentRepository.findByLearnerId(learnerId);
List<EnrollmentResponseDto> dtos = enrollments.stream()
    .map(EnrollmentResponseDto::from)
    .collect(Collectors.toList());
return ResponseEntity.ok(dtos);
```

### Important Note

The `from()` method **must be called inside a `@Transactional` method** because it accesses lazy-loaded associations. The `EnrollmentController.getMyEnrollments()` method is annotated with `@Transactional` (from `jakarta.transaction`) for this reason.

---

## 6. FeedbackResponseDto

**File:** `dto/FeedbackResponseDto.java`
**Purpose:** A flattened view of feedback. Contains feedback fields plus learner, mentor, and session details.

### Fields

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | Feedback ID. |
| `rating` | `Integer` | Rating (1-5). |
| `comment` | `String` | Feedback comment. |
| `learnerId` | `Long` | The learner's ID (flattened). |
| `learnerName` | `String` | The learner's full name (flattened). |
| `learnerEmail` | `String` | The learner's email (flattened). |
| `mentorId` | `Long` | The mentor's ID (flattened). |
| `mentorName` | `String` | The mentor's full name (flattened). |
| `mentorEmail` | `String` | The mentor's email (flattened). |
| `sessionId` | `Long` | The session's ID (flattened). |
| `sessionTitle` | `String` | The session's title (flattened). |

### The `from()` Factory Method

Similar to `EnrollmentResponseDto.from()`, this method converts a `MentorFeedback` entity to a DTO:

```java
public static FeedbackResponseDto from(MentorFeedback f) {
    FeedbackResponseDto dto = new FeedbackResponseDto();
    dto.id = f.getId();
    dto.rating = f.getRating();
    dto.comment = f.getComment();
    
    if (f.getLearner() != null) {
        dto.learnerId = f.getLearner().getId();
        dto.learnerName = f.getLearner().getFullName();
        dto.learnerEmail = f.getLearner().getEmail();
    }
    
    if (f.getMentor() != null) {
        dto.mentorId = f.getMentor().getId();
        dto.mentorName = f.getMentor().getFullName();
        dto.mentorEmail = f.getMentor().getEmail();
    }
    
    if (f.getSession() != null) {
        dto.sessionId = f.getSession().getId();
        dto.sessionTitle = f.getSession().getTitle();
    }
    
    return dto;
}
```

### Why this DTO exists

Same reasons as `EnrollmentResponseDto`:
- Avoids `LazyInitializationException` by converting the entity to a DTO while the JPA session is open.
- Flattens nested objects to reduce response size and avoid exposing sensitive data.

### Usage

Used in `FeedbackController.submitFeedback()` and `FeedbackController.getAllFeedback()`.

### Important Note

The `from()` method **must be called inside a `@Transactional` method**. Both `FeedbackController` methods are annotated with `@Transactional` for this reason.

---

## Summary Table

| DTO | Purpose | Used In |
|---|---|---|
| AuthRequestDto | Login request (email + password) | AuthController.login() |
| AuthResponseDto | Login/register response (token + user details) | AuthController.login(), AuthController.register() |
| RegisterDto | Registration request (all user fields) | AuthController.register() |
| SessionDto | Flattened session view (with mentor/subject names) | Not currently used |
| EnrollmentResponseDto | Flattened enrollment view (with learner/session details) | EnrollmentController.getMyEnrollments() |
| FeedbackResponseDto | Flattened feedback view (with learner/mentor/session details) | FeedbackController.submitFeedback(), FeedbackController.getAllFeedback() |

**Common Viva Questions:**
- Q: Why not just return the entity directly instead of using a DTO?
- A: Entities may contain sensitive data (like password hashes), circular references, or lazy-loaded associations that cause errors. DTOs give you full control over what data is sent to the client.
- Q: What is the `from()` factory method?
- A: It's a static method that converts an entity to a DTO. It must be called inside a `@Transactional` method so that lazy-loaded associations can be accessed.
- Q: What is a `LazyInitializationException`?
- A: It occurs when you try to access a lazy-loaded association after the JPA session has been closed. By converting the entity to a DTO inside a `@Transactional` method, you ensure the session is still open when the associations are accessed.
