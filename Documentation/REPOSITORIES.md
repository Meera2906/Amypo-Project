# REPOSITORIES

This document explains every repository in the project.

---

## What is a Repository?

A **Repository** is an interface that handles **database access**. In Spring Data JPA, you define an interface that extends `JpaRepository`, and Spring automatically creates the implementation at runtime. This means you get basic CRUD methods (save, findById, deleteById, findAll, etc.) for free — no SQL needed!

### Key Concepts

- **Annotated with `@Repository`** — Spring automatically discovers and creates this class as a bean.
- **Extends `JpaRepository<Entity, Long>`** — The first type parameter is the entity class, the second is the primary key type.
- **Method names are parsed by Spring** — Method names like `findByEmail` are automatically converted to SQL queries.
- **Custom queries use `@Query`** — For complex queries, you write JPQL (Java Persistence Query Language) or native SQL.

### What Spring Data JPA gives you for free

By extending `JpaRepository`, every repository automatically gets these methods:

| Method | What it does |
|---|---|
| `save(entity)` | Inserts or updates an entity |
| `findById(id)` | Returns `Optional<Entity>` by primary key |
| `findAll()` | Returns all entities |
| `findAllById(ids)` | Returns entities by a list of IDs |
| `deleteById(id)` | Deletes by primary key |
| `delete(entity)` | Deletes a specific entity |
| `count()` | Returns the total count |
| `existsById(id)` | Returns true if an entity with the ID exists |

---

## 1. AcademicUserRepository

**File:** `repository/AcademicUserRepository.java`
**Entity:** `AcademicUser`
**Primary Key Type:** `Long`

### Code

```java
@Repository
public interface AcademicUserRepository extends JpaRepository<AcademicUser, Long> {
    Optional<AcademicUser> findByEmail(String email);
    boolean existsByEmail(String email);
    List<AcademicUser> findByRole(UserRole role);
    long countByRole(UserRole role);
    long countByRoleAndStatus(UserRole role, UserStatus status);
}
```

### Custom Methods Explained

| Method | Generated SQL | Purpose |
|---|---|---|
| `findByEmail(String email)` | `SELECT * FROM academic_users WHERE email = ?` | Find a user by their email address. Used in login and JWT filter. |
| `existsByEmail(String email)` | `SELECT COUNT(*) > 0 FROM academic_users WHERE email = ?` | Check if an email is already registered. Used in registration. |
| `findByRole(UserRole role)` | `SELECT * FROM academic_users WHERE role = ?` | Get all users with a specific role. Used in UserController.getMentors(). |
| `countByRole(UserRole role)` | `SELECT COUNT(*) FROM academic_users WHERE role = ?` | Count users by role. Used in AdministrativeService.getPlatformStats(). |
| `countByRoleAndStatus(UserRole role, UserStatus status)` | `SELECT COUNT(*) FROM academic_users WHERE role = ? AND status = ?` | Count users by both role and status. Used to count pending mentors. |

### Database Interaction

- **Table:** `academic_users`
- **Columns:** `id`, `full_name`, `email`, `password`, `role`, `department`, `bio`, `status`
- **Unique constraint:** `email` is unique (enforced by `@Column(unique = true)` on the entity).

---

## 2. TutoringSessionRepository

**File:** `repository/TutoringSessionRepository.java`
**Entity:** `TutoringSession`
**Primary Key Type:** `Long`

### Code

```java
@Repository
public interface TutoringSessionRepository extends JpaRepository<TutoringSession, Long> {
    Page<TutoringSession> findByStatusIn(Collection<SessionStatus> statuses, Pageable pageable);
    long countByStatus(SessionStatus status);
    long countByMentorId(Long mentorId);
    long countByMentorIdAndStatus(Long mentorId, SessionStatus status);
}
```

### Custom Methods Explained

| Method | Generated SQL | Purpose |
|---|---|---|
| `findByStatusIn(Collection<SessionStatus> statuses, Pageable pageable)` | `SELECT * FROM tutoring_sessions WHERE status IN (?, ?, ?) LIMIT ? OFFSET ?` | Get sessions with specific statuses, paginated. Used in SessionManagementService.getAvailableSessions(). |
| `countByStatus(SessionStatus status)` | `SELECT COUNT(*) FROM tutoring_sessions WHERE status = ?` | Count sessions by status. Used in AdministrativeService.getPlatformStats(). |
| `countByMentorId(Long mentorId)` | `SELECT COUNT(*) FROM tutoring_sessions WHERE mentor_id = ?` | Count sessions by mentor. Used in AdministrativeService.getMentorDashboardStats(). |
| `countByMentorIdAndStatus(Long mentorId, SessionStatus status)` | `SELECT COUNT(*) FROM tutoring_sessions WHERE mentor_id = ? AND status = ?` | Count sessions by mentor and status. Used in mentor dashboard stats. |

### Database Interaction

- **Table:** `tutoring_sessions`
- **Columns:** `id`, `title`, `description`, `start_time`, `end_time`, `max_capacity`, `current_enrollment`, `status`, `mentor_id`, `subject_id`
- **Foreign keys:** `mentor_id` → `academic_users.id`, `subject_id` → `study_subjects.id`

---

## 3. StudySubjectRepository

**File:** `repository/StudySubjectRepository.java`
**Entity:** `StudySubject`
**Primary Key Type:** `Long`

### Code

```java
@Repository
public interface StudySubjectRepository extends JpaRepository<StudySubject, Long> {
    Optional<StudySubject> findByName(String name);

    @Query("SELECT s.name AS name, COUNT(e.id) AS count FROM SessionEnrollment e JOIN e.session ts JOIN ts.subject s GROUP BY s.name")
    List<Map<String, Object>> getSubjectEnrollmentStats();
}
```

### Custom Methods Explained

| Method | Type | Purpose |
|---|---|---|
| `findByName(String name)` | Derived query | `SELECT * FROM study_subjects WHERE name = ?`. Find a subject by name. Used in SubjectController and DataSeeder. |
| `getSubjectEnrollmentStats()` | `@Query` (JPQL) | Custom query that returns a list of maps. Each map has `name` (subject name) and `count` (number of enrollments). |

### The JPQL Query Explained

```sql
SELECT s.name AS name, COUNT(e.id) AS count 
FROM SessionEnrollment e 
JOIN e.session ts 
JOIN ts.subject s 
GROUP BY s.name
```

This query:
1. Starts from `SessionEnrollment` (the enrollment table).
2. Joins to `TutoringSession` (via `e.session`).
3. Joins to `StudySubject` (via `ts.subject`).
4. Groups by subject name.
5. Counts the number of enrollments per subject.

**Result:** A list of maps like `{"name": "Mathematics", "count": 5}`.

### Database Interaction

- **Table:** `study_subjects`
- **Columns:** `id`, `name`, `description`
- **Unique constraint:** `name` is unique.

---

## 4. SessionEnrollmentRepository

**File:** `repository/SessionEnrollmentRepository.java`
**Entity:** `SessionEnrollment`
**Primary Key Type:** `Long`

### Code

```java
@Repository
public interface SessionEnrollmentRepository extends JpaRepository<SessionEnrollment, Long> {
    List<SessionEnrollment> findByLearnerId(Long learnerId);
    boolean existsByLearnerIdAndSessionId(Long learnerId, Long sessionId);
    Optional<SessionEnrollment> findByLearnerIdAndSessionIdAndStatus(Long learnerId, Long sessionId, EnrollmentStatus status);
}
```

### Custom Methods Explained

| Method | Generated SQL | Purpose |
|---|---|---|
| `findByLearnerId(Long learnerId)` | `SELECT * FROM session_enrollments WHERE learner_id = ?` | Get all enrollments for a learner. Used in EnrollmentController.getMyEnrollments() and FeedbackService.submitFeedback(). |
| `existsByLearnerIdAndSessionId(Long learnerId, Long sessionId)` | `SELECT COUNT(*) > 0 FROM session_enrollments WHERE learner_id = ? AND session_id = ?` | Check if a learner is already enrolled in a session. Used in EnrollmentWorkflowService.enrollLearner() to prevent duplicate enrollment. |
| `findByLearnerIdAndSessionIdAndStatus(Long learnerId, Long sessionId, EnrollmentStatus status)` | `SELECT * FROM session_enrollments WHERE learner_id = ? AND session_id = ? AND status = ?` | Find a specific enrollment by learner, session, and status. Used in EnrollmentWorkflowService.cancelEnrollment() to find an active (ENROLLED) enrollment. |

### Database Interaction

- **Table:** `session_enrollments`
- **Columns:** `id`, `enrollment_date`, `status`, `feedback_submitted`, `learner_id`, `session_id`
- **Foreign keys:** `learner_id` → `academic_users.id`, `session_id` → `tutoring_sessions.id`

---

## 5. MentorFeedbackRepository

**File:** `repository/MentorFeedbackRepository.java`
**Entity:** `MentorFeedback`
**Primary Key Type:** `Long`

### Code

```java
@Repository
public interface MentorFeedbackRepository extends JpaRepository<MentorFeedback, Long> {
    @Query("SELECT AVG(f.rating) FROM MentorFeedback f WHERE f.mentor.id = :mentorId")
    Double getAverageRatingByMentorId(@Param("mentorId") Long mentorId);
    
    long countByMentorId(Long mentorId);
}
```

### Custom Methods Explained

| Method | Type | Purpose |
|---|---|---|
| `getAverageRatingByMentorId(Long mentorId)` | `@Query` (JPQL) | Calculates the average rating for a mentor. Returns `Double` (or null if no feedback). |
| `countByMentorId(Long mentorId)` | Derived query | `SELECT COUNT(*) FROM mentor_feedback WHERE mentor_id = ?`. Counts the total number of feedback entries for a mentor. |

### The JPQL Query Explained

```sql
SELECT AVG(f.rating) FROM MentorFeedback f WHERE f.mentor.id = :mentorId
```

This query:
1. Calculates the average (`AVG`) of the `rating` field.
2. From the `MentorFeedback` entity (table `mentor_feedback`).
3. Where the mentor's ID matches the parameter.

**Note:** The `@Param("mentorId")` annotation binds the method parameter to the `:mentorId` placeholder in the JPQL query.

### Database Interaction

- **Table:** `mentor_feedback`
- **Columns:** `id`, `rating`, `comment`, `learner_id`, `mentor_id`, `session_id`
- **Foreign keys:** `learner_id` → `academic_users.id`, `mentor_id` → `academic_users.id`, `session_id` → `tutoring_sessions.id`
- **Unique constraint:** `session_id` is unique (enforced by `@OneToOne` on the entity — one feedback per session).

---

## Summary Table

| Repository | Entity | Table | Key Methods |
|---|---|---|---|
| AcademicUserRepository | AcademicUser | academic_users | findByEmail, existsByEmail, findByRole, countByRole, countByRoleAndStatus |
| TutoringSessionRepository | TutoringSession | tutoring_sessions | findByStatusIn, countByStatus, countByMentorId, countByMentorIdAndStatus |
| StudySubjectRepository | StudySubject | study_subjects | findByName, getSubjectEnrollmentStats (JPQL) |
| SessionEnrollmentRepository | SessionEnrollment | session_enrollments | findByLearnerId, existsByLearnerIdAndSessionId, findByLearnerIdAndSessionIdAndStatus |
| MentorFeedbackRepository | MentorFeedback | mentor_feedback | getAverageRatingByMentorId (JPQL), countByMentorId |

**Common Viva Questions:**
- Q: What is the difference between a derived query and a `@Query`?
- A: A derived query is created by Spring from the method name (e.g., `findByEmail` → `WHERE email = ?`). A `@Query` is a custom query you write yourself using JPQL or native SQL.
- Q: What is JPQL?
- A: JPQL (Java Persistence Query Language) is a query language that looks like SQL but operates on entities (Java objects) instead of database tables. For example, `FROM MentorFeedback f` refers to the entity, not the table.
- Q: What does `@Param` do?
- A: It binds a method parameter to a named parameter in a JPQL query. For example, `@Param("mentorId") Long mentorId` binds the `mentorId` parameter to the `:mentorId` placeholder in the query.
- Q: What is the difference between `findByStatusIn` and `findByStatus`?
- A: `findByStatusIn` accepts a collection of statuses and returns entities matching ANY of them (`WHERE status IN (?, ?, ?)`). `findByStatus` would accept a single status (`WHERE status = ?`).
