# ENTITIES

This document explains every entity in the project.

---

## What is an Entity?

An **Entity** is a Java class that represents a **database table**. Each entity class maps to one table in the database. The fields of the class map to columns, and annotations define the relationships between tables.

### Key Concepts

- **`@Entity`** — Marks the class as a JPA entity (it maps to a database table).
- **`@Table(name = "...")`** — Specifies the table name.
- **`@Id`** — Marks the primary key field.
- **`@GeneratedValue(strategy = GenerationType.IDENTITY)`** — The database auto-generates the primary key (auto-increment).
- **`@Column(name = "...")`** — Maps a field to a specific column name.
- **`@Enumerated(EnumType.STRING)`** — Stores enum values as text (e.g., "LEARNER") instead of numbers.
- **`@ManyToOne`** — Many entities can reference one other entity (e.g., many sessions belong to one mentor).
- **`@OneToOne`** — One entity references exactly one other entity.
- **`@JoinColumn(name = "...")`** — Specifies the foreign key column name.
- **`fetch = FetchType.LAZY`** — The related entity is loaded only when you call its getter (saves memory).
- **`fetch = FetchType.EAGER`** — The related entity is loaded immediately with the main entity.

---

## 1. AcademicUser

**File:** `entity/AcademicUser.java`
**Table:** `academic_users`
**Purpose:** Represents a user in the system (learner, mentor, admin, or support agent).

### Fields

| Field | Type | Column | Annotations | Description |
|---|---|---|---|---|
| `id` | `Long` | `id` | `@Id`, `@GeneratedValue(strategy = IDENTITY)` | Primary key — auto-incremented by the database. |
| `fullName` | `String` | `full_name` | `@JsonProperty(access = READ_ONLY)`, `@Column(nullable = false)` | User's full name. Cannot be null. |
| `email` | `String` | `email` | `@JsonProperty(access = READ_ONLY)`, `@Column(nullable = false, unique = true)` | User's email. Must be unique. Cannot be null. |
| `password` | `String` | `password` | `@JsonProperty(access = READ_ONLY)`, `@Column(nullable = false)` | BCrypt-hashed password. Cannot be null. |
| `role` | `UserRole` | `role` | `@JsonProperty(access = READ_ONLY)`, `@Enumerated(STRING)`, `@Column(nullable = false)` | User's role: LEARNER, MENTOR, ACADEMIC_ADMIN, or SUPPORT_AGENT. |
| `department` | `String` | `department` | `@JsonProperty(access = READ_ONLY)` | User's department (e.g., "Computer Science"). Can be null. |
| `bio` | `String` | `bio` | `@JsonProperty(access = READ_ONLY)`, `@Column(columnDefinition = "TEXT")` | User's biography. Stored as TEXT in the database. |
| `status` | `UserStatus` | `status` | `@JsonProperty(access = READ_ONLY)`, `@Enumerated(STRING)`, `@Column(nullable = false)` | Account status: PENDING, APPROVED, REJECTED, or BLOCKED. |

### Class-level Annotations

| Annotation | What it does |
|---|---|
| `@JsonIgnoreProperties(ignoreUnknown = true)` | When deserializing JSON to this entity, ignore any JSON fields that don't match entity fields. This prevents errors if the client sends extra fields. |
| `@Entity` | Marks this class as a JPA entity. |
| `@Table(name = "academic_users")` | Maps to the `academic_users` table. |

### `@JsonProperty(access = READ_ONLY)` Explained

This annotation means:
- **Reading (serialization):** The field IS included in the JSON response sent to the client.
- **Writing (deserialization):** The field is NOT set from JSON input. If the client sends a `password` field in a registration request, it will be ignored.

This is a security measure — it prevents clients from directly setting fields like `password`, `role`, or `status` through JSON.

### Builder Pattern

The class includes a static `builder()` method and an inner `AcademicUserBuilder` class. This allows you to create users like:

```java
AcademicUser user = AcademicUser.builder()
    .fullName("John")
    .email("john@example.com")
    .password("hashedPassword")
    .role(UserRole.LEARNER)
    .status(UserStatus.APPROVED)
    .build();
```

### Relationships

`AcademicUser` is the **target** of several `@ManyToOne` relationships:
- `TutoringSession` has `@ManyToOne AcademicUser mentor` (many sessions → one mentor)
- `SessionEnrollment` has `@ManyToOne AcademicUser learner` (many enrollments → one learner)
- `MentorFeedback` has `@ManyToOne AcademicUser learner` and `@ManyToOne AcademicUser mentor`

### Common Viva Questions

- Q: Why is `@JsonProperty(access = READ_ONLY)` used on the password field?
- A: It prevents the password from being set via JSON (deserialization), but still allows it to be included in JSON responses (serialization). This is a basic security measure.
- Q: What does `@Enumerated(EnumType.STRING)` do?
- A: It stores the enum value as its string name (e.g., "LEARNER") instead of its ordinal number (e.g., 0). This is more readable and safer (if you add a new enum value, existing data won't be corrupted).
- Q: What is the Builder pattern?
- A: It's a design pattern that allows you to create objects step by step. Instead of a long constructor, you chain method calls: `.fullName("John").email("john@example.com").build()`.

---

## 2. TutoringSession

**File:** `entity/TutoringSession.java`
**Table:** `tutoring_sessions`
**Purpose:** Represents a tutoring session created by a mentor.

### Fields

| Field | Type | Column | Annotations | Description |
|---|---|---|---|---|
| `id` | `Long` | `id` | `@Id`, `@GeneratedValue(strategy = IDENTITY)` | Primary key. |
| `title` | `String` | `title` | `@Column(nullable = false)` | Session title (e.g., "Calculus 101"). |
| `description` | `String` | `description` | `@Column(columnDefinition = "TEXT")` | Session description. Stored as TEXT. |
| `startTime` | `LocalDateTime` | `start_time` | `@Column(nullable = false)` | When the session starts. |
| `endTime` | `LocalDateTime` | `end_time` | `@Column(nullable = false)` | When the session ends. |
| `maxCapacity` | `Integer` | `max_capacity` | `@Column(nullable = false)` | Maximum number of learners. |
| `currentEnrollment` | `Integer` | `current_enrollment` | (no constraints) | Current number of enrolled learners. |
| `status` | `SessionStatus` | `status` | `@Enumerated(STRING)`, `@Column(nullable = false)` | Session status: SCHEDULED, ACTIVE, COMPLETED, or CANCELLED. |
| `mentor` | `AcademicUser` | `mentor_id` | `@ManyToOne(fetch = EAGER)`, `@JoinColumn(nullable = false)` | The mentor who created the session. |
| `subject` | `StudySubject` | `subject_id` | `@ManyToOne(fetch = EAGER)`, `@JoinColumn(nullable = false)` | The subject of the session. |

### Relationships

| Relationship | Type | Fetch | Description |
|---|---|---|---|
| `mentor` | `@ManyToOne` | EAGER | Many sessions belong to one mentor. The mentor is loaded immediately when the session is loaded. |
| `subject` | `@ManyToOne` | EAGER | Many sessions belong to one subject. The subject is loaded immediately. |

### Why EAGER fetch?

The mentor and subject are loaded eagerly because they are needed whenever a session is displayed (e.g., to show the mentor's name and the subject name). Loading them eagerly avoids the "N+1 query problem" for these always-needed fields.

### Common Viva Questions

- Q: What is the difference between `@ManyToOne` and `@OneToMany`?
- A: `@ManyToOne` means many entities reference one other entity (e.g., many sessions → one mentor). `@OneToMany` means one entity references many others (e.g., one mentor → many sessions). In this project, the "many" side uses `@ManyToOne` (Session → Mentor), and the "one" side does not have an explicit `@OneToMany` (the relationship is unidirectional from Session to Mentor).
- Q: Why use `LocalDateTime` instead of `Date`?
- A: `LocalDateTime` is part of Java 8's modern date/time API. It is immutable, thread-safe, and easier to use than the old `Date` class.

---

## 3. StudySubject

**File:** `entity/StudySubject.java`
**Table:** `study_subjects`
**Purpose:** Represents a study subject (e.g., Mathematics, Physics).

### Fields

| Field | Type | Column | Annotations | Description |
|---|---|---|---|---|
| `id` | `Long` | `id` | `@Id`, `@GeneratedValue(strategy = IDENTITY)` | Primary key. |
| `name` | `String` | `name` | `@Column(nullable = false, unique = true)` | Subject name. Must be unique. |
| `description` | `String` | `description` | `@Column` | Subject description. |

### Relationships

`StudySubject` is the **target** of a `@ManyToOne` relationship:
- `TutoringSession` has `@ManyToOne StudySubject subject` (many sessions → one subject)

### Common Viva Questions

- Q: Why is the `name` field unique?
- A: To prevent duplicate subjects. You shouldn't have two "Mathematics" entries.

---

## 4. SessionEnrollment

**File:** `entity/SessionEnrollment.java`
**Table:** `session_enrollments`
**Purpose:** Represents a learner's enrollment in a tutoring session.

### Fields

| Field | Type | Column | Annotations | Description |
|---|---|---|---|---|
| `id` | `Long` | `id` | `@Id`, `@GeneratedValue(strategy = IDENTITY)` | Primary key. |
| `enrollmentDate` | `LocalDateTime` | `enrollment_date` | `@Column(nullable = false)` | When the learner enrolled. |
| `status` | `EnrollmentStatus` | `status` | `@Enumerated(STRING)`, `@Column(nullable = false)` | Enrollment status: ENROLLED, ATTENDED, CANCELLED, or DISCONTINUED. |
| `feedbackSubmitted` | `boolean` | `feedback_submitted` | `@Column(nullable = false)` | Whether the learner has submitted feedback for this session. |
| `learner` | `AcademicUser` | `learner_id` | `@ManyToOne(fetch = LAZY)`, `@JoinColumn(nullable = false)` | The learner who enrolled. |
| `session` | `TutoringSession` | `session_id` | `@ManyToOne(fetch = LAZY)`, `@JoinColumn(nullable = false)` | The session the learner enrolled in. |

### Relationships

| Relationship | Type | Fetch | Description |
|---|---|---|---|
| `learner` | `@ManyToOne` | LAZY | Many enrollments belong to one learner. Loaded only when accessed. |
| `session` | `@ManyToOne` | LAZY | Many enrollments belong to one session. Loaded only when accessed. |

### Why LAZY fetch?

The learner and session are loaded lazily because they are not always needed. For example, when listing all enrollments, you might only need the enrollment ID and status. Loading the full learner and session objects for every enrollment would be wasteful.

### Common Viva Questions

- Q: Why is `feedbackSubmitted` a primitive `boolean` instead of `Boolean`?
- A: A primitive `boolean` defaults to `false`, which is the correct default (no feedback submitted yet). Using `Boolean` (wrapper) would default to `null`, which could cause issues.
- Q: What is the purpose of the `feedbackSubmitted` flag?
- A: It tracks whether a learner has already submitted feedback for a session. This prevents duplicate feedback submissions.

---

## 5. MentorFeedback

**File:** `entity/MentorFeedback.java`
**Table:** `mentor_feedback`
**Purpose:** Represents feedback a learner gives to a mentor.

### Fields

| Field | Type | Column | Annotations | Description |
|---|---|---|---|---|
| `id` | `Long` | `id` | `@Id`, `@GeneratedValue(strategy = IDENTITY)` | Primary key. |
| `rating` | `Integer` | `rating` | `@Column(nullable = false)` | Rating (e.g., 1-5). |
| `comment` | `String` | `comment` | `@Column(columnDefinition = "TEXT")` | Feedback comment. Stored as TEXT. |
| `learner` | `AcademicUser` | `learner_id` | `@ManyToOne(fetch = LAZY)`, `@JoinColumn(nullable = false)` | The learner who gave the feedback. |
| `mentor` | `AcademicUser` | `mentor_id` | `@ManyToOne(fetch = LAZY)`, `@JoinColumn(nullable = false)` | The mentor who received the feedback. |
| `session` | `TutoringSession` | `session_id` | `@OneToOne(fetch = EAGER)`, `@JoinColumn(nullable = false)` | The session the feedback is for. |

### Relationships

| Relationship | Type | Fetch | Description |
|---|---|---|---|
| `learner` | `@ManyToOne` | LAZY | Many feedback entries belong to one learner. |
| `mentor` | `@ManyToOne` | LAZY | Many feedback entries belong to one mentor. |
| `session` | `@OneToOne` | EAGER | One feedback entry belongs to one session. Loaded immediately. |

### Why `@OneToOne` for session?

Each session can have at most one feedback entry. The `@OneToOne` relationship with `@JoinColumn(nullable = false)` means:
- The `session_id` column in the `mentor_feedback` table is unique (enforced by the database).
- Every feedback must be associated with a session.

### Why EAGER for session?

The session is loaded eagerly because it is always needed when displaying feedback (to show the session title).

### Common Viva Questions

- Q: Why does `MentorFeedback` reference both `learner` and `mentor`?
- A: The feedback is given by a learner to a mentor. Both references are needed to know who gave the feedback and who received it.
- Q: What happens if you try to submit feedback twice for the same session?
- A: The database would throw a unique constraint violation on `session_id`, which would be caught by the generic exception handler (HTTP 500). The `FeedbackService` also checks the `feedbackSubmitted` flag on the enrollment to prevent this.

---

## Entity Relationship Diagram (Text)

```
academic_users (1) ←──── (many) tutoring_sessions
    │                       │
    │                       │
    │                       └── (many) session_enrollments
    │                       │
    │                       └── (1) mentor_feedback (as mentor)
    │
    └── (many) session_enrollments (as learner)
    └── (many) mentor_feedback (as learner)

study_subjects (1) ←──── (many) tutoring_sessions
```

### Summary

| Entity | Table | Key Relationships |
|---|---|---|
| AcademicUser | academic_users | Referenced by TutoringSession (mentor), SessionEnrollment (learner), MentorFeedback (learner, mentor) |
| TutoringSession | tutoring_sessions | ManyToOne mentor (AcademicUser), ManyToOne subject (StudySubject) |
| StudySubject | study_subjects | Referenced by TutoringSession (subject) |
| SessionEnrollment | session_enrollments | ManyToOne learner (AcademicUser), ManyToOne session (TutoringSession) |
| MentorFeedback | mentor_feedback | ManyToOne learner (AcademicUser), ManyToOne mentor (AcademicUser), OneToOne session (TutoringSession) |
