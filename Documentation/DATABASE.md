# DATABASE

This document explains the database structure, relationships, and how JPA works in this project.

---

## Database: MySQL

**Database name:** `loomlearn`
**Connection URL:** `jdbc:mysql://localhost:3306/loomlearn`
**Username:** `root`
**Password:** `root`

---

## Tables

### 1. `academic_users`

Stores all users (learners, mentors, admins, support agents).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | Primary key |
| `full_name` | VARCHAR(255) | NOT NULL | User's full name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User's email (used for login) |
| `password` | VARCHAR(255) | NOT NULL | BCrypt-hashed password |
| `role` | VARCHAR(255) | NOT NULL | LEARNER, MENTOR, ACADEMIC_ADMIN, or SUPPORT_AGENT |
| `department` | VARCHAR(255) | NULL | User's department |
| `bio` | TEXT | NULL | User's biography |
| `status` | VARCHAR(255) | NOT NULL | PENDING, APPROVED, REJECTED, or BLOCKED |

**Entity:** `AcademicUser.java`

---

### 2. `study_subjects`

Stores academic subjects (e.g., Mathematics, Physics).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | Primary key |
| `name` | VARCHAR(255) | NOT NULL, UNIQUE | Subject name |
| `description` | TEXT | NULL | Subject description |

**Entity:** `StudySubject.java`

---

### 3. `tutoring_sessions`

Stores tutoring sessions created by mentors.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | Primary key |
| `title` | VARCHAR(255) | NOT NULL | Session title |
| `description` | TEXT | NULL | Session description |
| `start_time` | DATETIME | NOT NULL | When the session starts |
| `end_time` | DATETIME | NOT NULL | When the session ends |
| `max_capacity` | INT | NOT NULL | Maximum number of learners |
| `current_enrollment` | INT | NULL | Current number of enrolled learners |
| `status` | VARCHAR(255) | NOT NULL | SCHEDULED, ACTIVE, COMPLETED, or CANCELLED |
| `mentor_id` | BIGINT | FK → academic_users.id, NOT NULL | The mentor who created the session |
| `subject_id` | BIGINT | FK → study_subjects.id, NOT NULL | The subject of the session |

**Entity:** `TutoringSession.java`

---

### 4. `session_enrollments`

Stores learner enrollments in sessions.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | Primary key |
| `enrollment_date` | DATETIME | NOT NULL | When the learner enrolled |
| `status` | VARCHAR(255) | NOT NULL | ENROLLED, ATTENDED, CANCELLED, or DISCONTINUED |
| `feedback_submitted` | TINYINT(1) | NOT NULL | 0 = false, 1 = true |
| `learner_id` | BIGINT | FK → academic_users.id, NOT NULL | The learner who enrolled |
| `session_id` | BIGINT | FK → tutoring_sessions.id, NOT NULL | The session the learner enrolled in |

**Entity:** `SessionEnrollment.java`

---

### 5. `mentor_feedback`

Stores feedback that learners give to mentors.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | Primary key |
| `rating` | INT | NOT NULL | Rating (e.g., 1-5) |
| `comment` | TEXT | NULL | Feedback comment |
| `learner_id` | BIGINT | FK → academic_users.id, NOT NULL | The learner who gave the feedback |
| `mentor_id` | BIGINT | FK → academic_users.id, NOT NULL | The mentor who received the feedback |
| `session_id` | BIGINT | FK → tutoring_sessions.id, NOT NULL, UNIQUE | The session the feedback is for |

**Entity:** `MentorFeedback.java`

---

## Relationship Diagram

```
academic_users
┌─────────────────────────────────────────────────────────────┐
│ id (PK)                                                     │
│ full_name                                                   │
│ email (UNIQUE)                                              │
│ password                                                    │
│ role                                                        │
│ department                                                  │
│ bio                                                         │
│ status                                                      │
└─────────────────────────────────────────────────────────────┘
        │
        │ (referenced by)
        │
        ├── tutoring_sessions (mentor_id)  [ManyToOne, EAGER]
        │   ┌──────────────────────────────────────────────────┐
        │   │ id (PK)                                          │
        │   │ title                                          │
        │   │ description                                    │
        │   │ start_time                                     │
        │   │ end_time                                       │
        │   │ max_capacity                                   │
        │   │ current_enrollment                             │
        │   │ status                                         │
        │   │ mentor_id (FK → academic_users.id)             │
        │   │ subject_id (FK → study_subjects.id)            │
        │   └──────────────────────────────────────────────────┘
        │
        ├── session_enrollments (learner_id)  [ManyToOne, LAZY]
        │   ┌──────────────────────────────────────────────────┐
        │   │ id (PK)                                          │
        │   │ enrollment_date                                  │
        │   │ status                                           │
        │   │ feedback_submitted                               │
        │   │ learner_id (FK → academic_users.id)              │
        │   │ session_id (FK → tutoring_sessions.id)           │
        │   └──────────────────────────────────────────────────┘
        │
        └── mentor_feedback (learner_id, mentor_id)  [ManyToOne, LAZY]
            ┌──────────────────────────────────────────────────┐
            │ id (PK)                                          │
            │ rating                                           │
            │ comment                                          │
            │ learner_id (FK → academic_users.id)              │
            │ mentor_id (FK → academic_users.id)               │
            │ session_id (FK → tutoring_sessions.id, UNIQUE)   │
            └──────────────────────────────────────────────────┘

study_subjects
┌─────────────────────────────────────────────┐
│ id (PK)                                     │
│ name (UNIQUE)                               │
│ description                                 │
└─────────────────────────────────────────────┘
        │
        │ (referenced by)
        │
        └── tutoring_sessions (subject_id)  [ManyToOne, EAGER]
```

---

## CRUD Operations

### Create (INSERT)

| Operation | Entity | Repository Method | SQL |
|---|---|---|---|
| Register user | AcademicUser | `userRepository.save(user)` | `INSERT INTO academic_users ...` |
| Create session | TutoringSession | `sessionRepository.save(session)` | `INSERT INTO tutoring_sessions ...` |
| Create subject | StudySubject | `subjectRepository.save(subject)` | `INSERT INTO study_subjects ...` |
| Enroll learner | SessionEnrollment | `enrollmentRepository.save(enrollment)` | `INSERT INTO session_enrollments ...` |
| Submit feedback | MentorFeedback | `feedbackRepository.save(feedback)` | `INSERT INTO mentor_feedback ...` |

### Read (SELECT)

| Operation | Repository Method | SQL |
|---|---|---|
| Find user by email | `findByEmail(email)` | `SELECT * FROM academic_users WHERE email = ?` |
| Find user by ID | `findById(id)` | `SELECT * FROM academic_users WHERE id = ?` |
| Find mentors | `findByRole(MENTOR)` | `SELECT * FROM academic_users WHERE role = 'MENTOR'` |
| Find session by ID | `findById(id)` | `SELECT * FROM tutoring_sessions WHERE id = ?` |
| Find available sessions | `findByStatusIn(statuses, pageable)` | `SELECT * FROM tutoring_sessions WHERE status IN (...) LIMIT ? OFFSET ?` |
| Find subject by name | `findByName(name)` | `SELECT * FROM study_subjects WHERE name = ?` |
| Find enrollments by learner | `findByLearnerId(learnerId)` | `SELECT * FROM session_enrollments WHERE learner_id = ?` |
| Check enrollment exists | `existsByLearnerIdAndSessionId(...)` | `SELECT COUNT(*) > 0 FROM session_enrollments WHERE learner_id = ? AND session_id = ?` |
| Find enrollment by learner+session+status | `findByLearnerIdAndSessionIdAndStatus(...)` | `SELECT * FROM session_enrollments WHERE learner_id = ? AND session_id = ? AND status = ?` |
| Get average rating | `@Query getAverageRatingByMentorId(...)` | `SELECT AVG(f.rating) FROM mentor_feedback f WHERE f.mentor_id = ?` |
| Get subject enrollment stats | `@Query getSubjectEnrollmentStats()` | `SELECT s.name, COUNT(e.id) FROM session_enrollments e JOIN ... GROUP BY s.name` |

### Update (UPDATE)

| Operation | Repository Method | SQL |
|---|---|---|
| Update user status | `userRepository.save(user)` | `UPDATE academic_users SET status = ? WHERE id = ?` |
| Update session | `sessionRepository.save(session)` | `UPDATE tutoring_sessions SET ... WHERE id = ?` |
| Update enrollment | `enrollmentRepository.save(enrollment)` | `UPDATE session_enrollments SET ... WHERE id = ?` |
| Cancel session | `sessionRepository.save(session)` | `UPDATE tutoring_sessions SET status = 'CANCELLED' WHERE id = ?` |

### Delete (DELETE)

| Operation | Repository Method | SQL |
|---|---|---|
| Delete subject | `subjectRepository.deleteById(id)` | `DELETE FROM study_subjects WHERE id = ?` |

---

## How JPA Works in This Project

### 1. Entity Mapping

Each entity class is annotated with `@Entity` and `@Table(name = "...")`. JPA uses these annotations to know which Java class maps to which database table.

```java
@Entity
@Table(name = "academic_users")
public class AcademicUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "full_name", nullable = false)
    private String fullName;
    
    // ... other fields
}
```

### 2. Schema Generation

The `application.properties` has:
```properties
spring.jpa.hibernate.ddl-auto=update
```

This tells Hibernate to automatically create or update the database schema based on the entity classes. When the application starts:
- If a table doesn't exist, Hibernate creates it.
- If a table exists but has missing columns, Hibernate adds them.
- Hibernate does NOT delete columns or tables.

### 3. Repository Pattern

Repositories are interfaces that extend `JpaRepository`. Spring Data JPA automatically implements them at runtime.

```java
@Repository
public interface AcademicUserRepository extends JpaRepository<AcademicUser, Long> {
    Optional<AcademicUser> findByEmail(String email);
    boolean existsByEmail(String email);
    // ... other methods
}
```

### 4. Derived Queries

Spring Data JPA generates SQL from method names:

| Method Name | Generated SQL |
|---|---|
| `findByEmail` | `WHERE email = ?` |
| `existsByEmail` | `WHERE email = ?` (returns boolean) |
| `findByRole` | `WHERE role = ?` |
| `countByRole` | `SELECT COUNT(*) WHERE role = ?` |
| `countByRoleAndStatus` | `SELECT COUNT(*) WHERE role = ? AND status = ?` |
| `findByLearnerId` | `WHERE learner_id = ?` |
| `existsByLearnerIdAndSessionId` | `WHERE learner_id = ? AND session_id = ?` |
| `findByLearnerIdAndSessionIdAndStatus` | `WHERE learner_id = ? AND session_id = ? AND status = ?` |
| `findByStatusIn` | `WHERE status IN (?, ?, ...)` |
| `countByStatus` | `SELECT COUNT(*) WHERE status = ?` |
| `countByMentorId` | `SELECT COUNT(*) WHERE mentor_id = ?` |
| `countByMentorIdAndStatus` | `SELECT COUNT(*) WHERE mentor_id = ? AND status = ?` |

### 5. Custom Queries with @Query

For complex queries, you use `@Query` with JPQL:

```java
@Query("SELECT AVG(f.rating) FROM MentorFeedback f WHERE f.mentor.id = :mentorId")
Double getAverageRatingByMentorId(@Param("mentorId") Long mentorId);

@Query("SELECT s.name AS name, COUNT(e.id) AS count FROM SessionEnrollment e JOIN e.session ts JOIN ts.subject s GROUP BY s.name")
List<Map<String, Object>> getSubjectEnrollmentStats();
```

### 6. Relationships

| Relationship | Annotation | Fetch Type | Example |
|---|---|---|---|
| Many sessions → 1 mentor | `@ManyToOne` | EAGER | `TutoringSession.mentor` |
| Many sessions → 1 subject | `@ManyToOne` | EAGER | `TutoringSession.subject` |
| Many enrollments → 1 learner | `@ManyToOne` | LAZY | `SessionEnrollment.learner` |
| Many enrollments → 1 session | `@ManyToOne` | LAZY | `SessionEnrollment.session` |
| Many feedback → 1 learner | `@ManyToOne` | LAZY | `MentorFeedback.learner` |
| Many feedback → 1 mentor | `@ManyToOne` | LAZY | `MentorFeedback.mentor` |
| 1 feedback → 1 session | `@OneToOne` | EAGER | `MentorFeedback.session` |

### 7. Lazy vs Eager Loading

- **EAGER:** The related object is loaded immediately when the main object is loaded. Used for always-needed fields (mentor name, subject name).
- **LAZY:** The related object is loaded only when you call its getter. Used for optional fields (learner details, session details in enrollments).

**LazyInitializationException:** If you try to access a lazy-loaded object after the JPA session is closed, you get this exception. To prevent it:
- Use `@Transactional` on the method that accesses lazy associations.
- Or use DTOs with `from()` factory methods (as done in this project).

### 8. Transactions

Methods annotated with `@Transactional` run in a database transaction:
- All operations succeed → transaction commits (changes are saved).
- Any operation fails → transaction rolls back (all changes are undone).

```java
@Transactional(rollbackFor = Exception.class)
public void enrollLearner(Long learnerId, Long sessionId) {
    // ... multiple database operations
    sessionRepository.save(session);  // UPDATE
    enrollmentRepository.save(enrollment);  // INSERT
}
```

If `enrollmentRepository.save()` fails, the `sessionRepository.save()` is rolled back.

---

## Common Viva Questions

- Q: What is the difference between `@ManyToOne` and `@OneToMany`?
- A: `@ManyToOne` means many entities reference one other entity. `@OneToMany` means one entity references many others. In this project, the "many" side uses `@ManyToOne`.
- Q: What is the N+1 query problem?
- A: When you load N entities and each one triggers a separate query to load its related entity, you get N+1 queries. EAGER fetching can cause this. The solution is to use JOIN FETCH in JPQL or pagination.
- Q: What is `LazyInitializationException`?
- A: It occurs when you try to access a lazy-loaded association after the JPA session is closed. Solutions: use `@Transactional`, use DTOs, or use `JOIN FETCH`.
- Q: What does `ddl-auto=update` do?
- A: It automatically creates or updates database tables based on entity classes. It adds new columns but doesn't delete existing ones.
- Q: What is a foreign key?
- A: A foreign key is a column that references the primary key of another table. It enforces referential integrity — you can't have a session with a mentor_id that doesn't exist in the academic_users table.
- Q: What is the difference between `@JoinColumn` and `@JoinTable`?
- A: `@JoinColumn` is used for foreign key columns in the entity's own table. `@JoinTable` is used for join tables (many-to-many relationships). This project only uses `@JoinColumn`.
