# 🧪 Amypo Project — Complete Swagger UI API Testing Guide

> **Base URL**: `http://localhost:8080`  
> **Swagger UI**: `http://localhost:8080/swagger-ui/index.html`  
> **Server**: Spring Boot (JWT Secured) | **DB**: MySQL (`loomlearn`)

---

## ⚡ Pre-Flight Checklist

Before opening Swagger UI, confirm:
- [ ] MySQL is running with database `loomlearn` on port `3306`
- [ ] Spring Boot app is started (`mvn spring-boot:run`)
- [ ] DataSeeder has auto-seeded default subjects + admin/support users on first boot

---

## 🗂️ Endpoint Index

| # | Controller | Method | Path | Auth Required | Role |
|---|-----------|--------|------|---------------|------|
| 1 | Auth | POST | `/api/auth/register` | ❌ No | Any |
| 2 | Auth | POST | `/api/auth/login` | ❌ No | Any |
| 3 | Users | GET | `/api/users/mentors` | ✅ Yes | Any authenticated |
| 4 | Users | GET | `/api/users/{id}` | ✅ Yes | Any authenticated |
| 5 | Users | PUT | `/api/users/{id}/status` | ✅ Yes | ACADEMIC_ADMIN |
| 6 | Subjects | GET | `/api/subjects` | ✅ Yes | Any authenticated |
| 7 | Subjects | POST | `/api/subjects` | ✅ Yes | ACADEMIC_ADMIN |
| 8 | Subjects | PUT | `/api/subjects/{id}` | ✅ Yes | ACADEMIC_ADMIN |
| 9 | Subjects | DELETE | `/api/subjects/{id}` | ✅ Yes | ACADEMIC_ADMIN |
| 10 | Sessions | GET | `/api/sessions` | ✅ Yes | Any authenticated |
| 11 | Sessions | POST | `/api/sessions` | ✅ Yes | Any authenticated |
| 12 | Sessions | PUT | `/api/sessions/{id}` | ✅ Yes | Any authenticated |
| 13 | Sessions | PUT | `/api/sessions/{id}/status` | ✅ Yes | Any authenticated |
| 14 | Sessions | DELETE | `/api/sessions/{id}` | ✅ Yes | Any authenticated |
| 15 | Enrollments | GET | `/api/enrollments/my` | ✅ Yes | LEARNER |
| 16 | Enrollments | POST | `/api/enrollments/enroll` | ✅ Yes | LEARNER |
| 17 | Enrollments | DELETE | `/api/enrollments/cancel` | ✅ Yes | LEARNER |
| 18 | Feedback | POST | `/api/feedback` | ✅ Yes | LEARNER |
| 19 | Feedback | GET | `/api/feedback` | ✅ Yes | ACADEMIC_ADMIN / SUPPORT_AGENT |
| 20 | Analytics | GET | `/api/analytics/stats` | ✅ Yes | ACADEMIC_ADMIN |
| 21 | Analytics | GET | `/api/analytics/mentor/{mentorId}` | ✅ Yes | MENTOR |

---

## 🔐 STEP 1 — Register & Login to Get JWT Tokens

> **Important**: You need different tokens for different roles. Follow this order.

### 1a. Register a MENTOR

**`POST /api/auth/register`**

```json
{
  "fullName": "Dr. Arjun Mehta",
  "email": "mentor@test.com",
  "password": "mentor123",
  "role": "MENTOR",
  "department": "Computer Science",
  "bio": "Expert in algorithms and data structures"
}
```

📝 **Note the `id`** from the response — you'll use it as `mentorId` later.

---

### 1b. Register a LEARNER

**`POST /api/auth/register`**

```json
{
  "fullName": "Priya Sharma",
  "email": "learner@test.com",
  "password": "learner123",
  "role": "LEARNER",
  "department": "Physics",
  "bio": "First-year student"
}
```

📝 **Note the `id`** — you'll use it as `learnerId` later.

---

### 1c. Login as ACADEMIC_ADMIN (seeded by DataSeeder)

**`POST /api/auth/login`**

```json
{
  "email": "admin@loomlearn.com",
  "password": "admin123"
}
```

✅ Copy the `token` field from the response.

---

### 1d. Login as MENTOR

**`POST /api/auth/login`**

```json
{
  "email": "mentor@test.com",
  "password": "mentor123"
}
```

✅ Copy the `token` field.

---

### 1e. Login as LEARNER

**`POST /api/auth/login`**

```json
{
  "email": "learner@test.com",
  "password": "learner123"
}
```

✅ Copy the `token` field.

---

### 1f. Login as SUPPORT_AGENT (seeded by DataSeeder)

**`POST /api/auth/login`**

```json
{
  "email": "support@loomlearn.com",
  "password": "support123"
}
```

✅ Copy the `token` field.

---

## 🔑 STEP 2 — Authorize in Swagger UI

1. Click the **🔒 Authorize** button (top-right of Swagger UI)
2. In the `value` field, enter: `Bearer <your_token_here>`
3. Click **Authorize** → **Close**

> ⚠️ **You must re-authorize every time you switch roles.** The token encodes the role.

---

## 👤 STEP 3 — User Endpoints

### 3a. Get All Mentors
- **Authorize as**: Any role
- **`GET /api/users/mentors`**
- No parameters needed
- ✅ Expected: List of users with `MENTOR` role

---

### 3b. Get User Profile by ID
- **Authorize as**: Any role
- **`GET /api/users/{id}`**
- Path param: `id` = the mentor or learner ID you noted earlier
- ✅ Expected: Single user object

---

### 3c. Update User Status *(Admin only)*
- **Authorize as**: ACADEMIC_ADMIN token
- **`PUT /api/users/{id}/status`**
- Path param: `id` = learner or mentor's ID
- Query param: `status` = one of `PENDING`, `APPROVED`, `REJECTED`, `BLOCKED`
- ✅ Expected: Updated user object

> ⚠️ If you try this with a LEARNER token, you'll get **403 Forbidden** — that's correct behaviour.

---

## 📚 STEP 4 — Subject Endpoints

### 4a. List All Subjects
- **Authorize as**: Any role
- **`GET /api/subjects`**
- No parameters needed
- ✅ Expected: List of 4 pre-seeded subjects (Mathematics, Physics, Computer Science, Chemistry)
- 📝 **Note the `id`** of any subject (e.g., `1` for Mathematics) for use in session creation.

---

### 4b. Create a New Subject *(Admin only)*
- **Authorize as**: ACADEMIC_ADMIN token
- **`POST /api/subjects`**

```json
{
  "name": "Biology",
  "description": "Study of living organisms"
}
```

- ✅ Expected: Created subject with generated `id`

---

### 4c. Update a Subject *(Admin only)*
- **Authorize as**: ACADEMIC_ADMIN token
- **`PUT /api/subjects/{id}`**
- Path param: `id` = subject ID you just created
- Body:

```json
{
  "name": "Biology Advanced",
  "description": "Advanced study of living organisms and genetics"
}
```

- ✅ Expected: Updated subject object

---

### 4d. Delete a Subject *(Admin only)*
- **Authorize as**: ACADEMIC_ADMIN token
- **`DELETE /api/subjects/{id}`**
- Path param: `id` = the subject ID to delete
- ✅ Expected: `"Subject deleted"`

---

## 🗓️ STEP 5 — Session Endpoints

> **Prerequisites**: You need a valid `mentorId` and `subjectId` before creating sessions.

### 5a. Get All Sessions (Paginated)
- **Authorize as**: Any role
- **`GET /api/sessions`**
- Optional Pageable params: `page=0`, `size=10`, `sort=startTime,asc`
- ✅ Expected: Paginated list of tutoring sessions

---

### 5b. Create a Session
- **Authorize as**: Any authenticated token (MENTOR recommended)
- **`POST /api/sessions`**

```json
{
  "title": "Intro to Algorithms",
  "description": "Covering sorting and searching algorithms",
  "startTime": "2026-07-10T10:00:00",
  "endTime": "2026-07-10T11:30:00",
  "maxCapacity": 20,
  "currentEnrollment": 0,
  "status": "SCHEDULED",
  "mentor": { "id": 1 },
  "subject": { "id": 3 }
}
```

> Replace `mentor.id` with your actual mentor's ID and `subject.id` with the Computer Science subject ID.

- ✅ Expected: Created session object with auto-generated `id`
- 📝 **Note the session `id`** for subsequent tests.

---

### 5c. Update a Session
- **Authorize as**: Any authenticated token
- **`PUT /api/sessions/{id}`**
- Path param: `id` = session ID
- Body (full object update):

```json
{
  "title": "Intro to Algorithms — Revised",
  "description": "Now also covering graphs and trees",
  "startTime": "2026-07-10T10:00:00",
  "endTime": "2026-07-10T12:00:00",
  "maxCapacity": 25,
  "currentEnrollment": 0,
  "status": "SCHEDULED",
  "mentor": { "id": 1 },
  "subject": { "id": 3 }
}
```

- ✅ Expected: Updated session object

---

### 5d. Update Session Status
- **Authorize as**: Any authenticated token
- **`PUT /api/sessions/{id}/status`**
- Path param: `id` = session ID
- Query param: `status` = one of `SCHEDULED`, `ACTIVE`, `COMPLETED`, `CANCELLED`
- ✅ Expected: `"Status updated..."`

> ⚠️ Passing an invalid status like `DONE` will return a **400 Bad Request** with the error message `"Invalid status: DONE"` — expected behaviour.

---

### 5e. Cancel (Delete) a Session
- **Authorize as**: Any authenticated token
- **`DELETE /api/sessions/{id}`**
- Path param: `id` = session ID
- ✅ Expected: `"Session cancelled"`

---

## 📋 STEP 6 — Enrollment Endpoints *(LEARNER only)*

> **Authorize as**: LEARNER token for all endpoints in this section.

### 6a. Enroll in a Session
- **`POST /api/enrollments/enroll`**
- Query params:
  - `learnerId` = learner's user ID
  - `sessionId` = session ID (use the one created in Step 5b)
- ✅ Expected: `"Enrolled"`

> ⚠️ Testing with ADMIN/MENTOR token returns **403 Forbidden** — correct!

---

### 6b. View My Enrollments
- **`GET /api/enrollments/my`**
- Query param: `learnerId` = learner's user ID
- ✅ Expected: List of `SessionEnrollment` objects for that learner

---

### 6c. Cancel an Enrollment
- **`DELETE /api/enrollments/cancel`**
- Query params:
  - `learnerId` = learner's user ID
  - `sessionId` = session ID to un-enroll from
- ✅ Expected: `"Enrollment cancelled"`

---

## 💬 STEP 7 — Feedback Endpoints

### 7a. Submit Feedback *(LEARNER only)*
- **Authorize as**: LEARNER token
- **`POST /api/feedback`**
- Query params:
  - `learnerId` = learner's user ID
  - `sessionId` = session ID
  - `rating` = integer 1–5
  - `comment` = `"Great session! Very helpful."`
- ✅ Expected: `MentorFeedback` object with all fields

---

### 7b. Get All Feedback *(Admin/Support only)*
- **Authorize as**: ACADEMIC_ADMIN or SUPPORT_AGENT token
- **`GET /api/feedback`**
- No parameters needed
- ✅ Expected: List of all `MentorFeedback` objects

> ⚠️ LEARNER token on this endpoint returns **403 Forbidden** — correct!

---

## 📊 STEP 8 — Analytics Endpoints

### 8a. Platform Stats *(Admin only)*
- **Authorize as**: ACADEMIC_ADMIN token
- **`GET /api/analytics/stats`**
- No parameters needed
- ✅ Expected: `Map<String, Object>` with platform-wide statistics

---

### 8b. Mentor Dashboard Stats *(Mentor only)*
- **Authorize as**: MENTOR token
- **`GET /api/analytics/mentor/{mentorId}`**
- Path param: `mentorId` = the mentor's user ID
- ✅ Expected: `Map<String, Object>` with mentor-specific statistics

---

## 🔄 Recommended Full Test Flow (Copy-Paste Order)

```
1.  POST /api/auth/register   → Register MENTOR
2.  POST /api/auth/register   → Register LEARNER
3.  POST /api/auth/login      → Login as ADMIN  → 🔑 Authorize in Swagger
4.  GET  /api/users/mentors
5.  GET  /api/users/{id}
6.  PUT  /api/users/{id}/status  (status=APPROVED for mentor)
7.  GET  /api/subjects
8.  POST /api/subjects        → Create "Biology"
9.  PUT  /api/subjects/{id}   → Update it
10. DELETE /api/subjects/{id} → Delete it
11. POST /api/auth/login      → Login as MENTOR → 🔑 Re-authorize
12. POST /api/sessions        → Create session
13. GET  /api/sessions
14. PUT  /api/sessions/{id}   → Update it
15. PUT  /api/sessions/{id}/status  (status=ACTIVE)
16. GET  /api/analytics/mentor/{mentorId}
17. POST /api/auth/login      → Login as LEARNER → 🔑 Re-authorize
18. POST /api/enrollments/enroll
19. GET  /api/enrollments/my
20. POST /api/feedback
21. DELETE /api/enrollments/cancel
22. POST /api/auth/login      → Login as ADMIN → 🔑 Re-authorize
23. GET  /api/feedback
24. GET  /api/analytics/stats
25. DELETE /api/sessions/{id} → Cancel session
```

---

## 🐛 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `403 Forbidden` | Wrong role token | Re-authorize with correct role token |
| `401 Unauthorized` | Token missing or expired | Re-login, get fresh token, re-authorize |
| `400 Bad Request` on session status | Invalid status string | Use only: `SCHEDULED`, `ACTIVE`, `COMPLETED`, `CANCELLED` |
| `400 Subject already exists` | Duplicate subject name | Use a unique name |
| `404 User not found` | Wrong ID in path | Verify the ID from registration response |
| `403 on /api/enrollments/**` | Using Admin/Mentor token | Must use LEARNER token |
| `403 on GET /api/feedback` | Using LEARNER token | Must use ADMIN or SUPPORT_AGENT token |

---

## 💡 Tips

- **Swagger UI URL**: `http://localhost:8080/swagger-ui/index.html`  
  *(If it shows 404, add `springdoc-openapi-starter-webmvc-ui` to your `pom.xml`)*
- **Token format in Authorize dialog**: `Bearer eyJhbGci...` (include the word `Bearer`)
- **Pageable in Swagger**: Click "Try it out" on `/api/sessions`, then you can fill in `page`, `size`, and `sort` fields
- **DateTime format** for session fields: `"2026-07-10T10:00:00"` (ISO 8601, no timezone)
