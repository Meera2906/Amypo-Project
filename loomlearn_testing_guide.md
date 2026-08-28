# LoomLearn - System & Feature Testing Guide

This guide provides step-by-step instructions for testing the **LoomLearn Collaborative Peer-to-Peer Tutoring System**, covering backend automated tests, API testing, frontend unit/build verification, and role-based end-to-end user journeys.

---

## 1. Environment & Prerequisites Verification

Ensure the following prerequisites are ready before starting tests:
- **Java**: Java 17 or higher (`java -version`)
- **Maven**: Maven 3.8+ (or using `./mvnw`)
- **Node.js**: Node 18+ and `npm`
- **Database**: MySQL running on `localhost:3306` with database `loomlearn` (or auto-created via `createDatabaseIfNotExist=true`)

---

## 2. Pre-Seeded Default Accounts

The `DataSeeder` automatically initializes default reference data and administrative users on backend startup:

| Role | Email | Password | Status | Initial Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **ACADEMIC_ADMIN** | `admin@loomlearn.com` | `admin123` | `APPROVED` | Subjects CRUD, Mentor Approvals, Analytics Stats |
| **SUPPORT_AGENT** | `support@loomlearn.com` | `support123` | `APPROVED` | Support Dashboard, View Feedback |

---

## 3. Automated Backend Testing

Run Maven test compilation and surefire unit/integration test suites:

```powershell
# Navigate to backend directory
cd backend

# Compile test sources
powershell -ExecutionPolicy Bypass -Command "mvn test-compile"

# Execute test suite
powershell -ExecutionPolicy Bypass -Command "mvn test"
```

---

## 4. Frontend Build & Code Verification

Validate the frontend build pipeline and verify all dependencies:

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies (if needed)
npm install

# Test production bundle compilation
powershell -ExecutionPolicy Bypass -Command "npm run build"
```

---

## 5. End-to-End API Testing (Swagger & cURL)

### Accessing Swagger UI
When the Spring Boot application is running (`mvn spring-boot:run`):
- **Swagger Documentation URL**: `http://localhost:8080/swagger-ui/index.html`
- **OpenAPI Json Docs**: `http://localhost:8080/v3/api-docs`

---

### Key API Test Flows

#### A. Authentication API (`/api/auth`)
1. **Register Learner**:
   ```bash
   POST http://localhost:8080/api/auth/register
   Content-Type: application/json

   {
     "fullName": "Jane Learner",
     "email": "jane@example.com",
     "password": "password123",
     "role": "LEARNER"
   }
   ```
   *Expected Response*: `200 OK` returning `token`, `id`, `fullName`, `email`, and `role: "LEARNER"`.

2. **Register Mentor** (Status will be set to `PENDING`):
   ```bash
   POST http://localhost:8080/api/auth/register
   Content-Type: application/json

   {
     "fullName": "Dr. Alan Smith",
     "email": "alan@example.com",
     "password": "password123",
     "role": "MENTOR",
     "department": "Computer Science",
     "bio": "Algorithms & Data Structures expert."
   }
   ```

3. **Login Pending Mentor**:
   ```bash
   POST http://localhost:8080/api/auth/login
   Content-Type: application/json

   {
     "email": "alan@example.com",
     "password": "password123"
   }
   ```
   *Expected Response*: `400 Bad Request` with message `"Account is pending or blocked"`.

4. **Approve Mentor Account (as Admin)**:
   ```bash
   PUT http://localhost:8080/api/users/<MENTOR_ID>/status?status=APPROVED
   Authorization: Bearer <ADMIN_JWT_TOKEN>
   ```

5. **Login Approved Mentor**:
   Retry login to receive JWT Token.

---

#### B. Sessions API (`/api/sessions`)
1. **Create Tutoring Session (as Mentor)**:
   ```bash
   POST http://localhost:8080/api/sessions
   Authorization: Bearer <MENTOR_JWT_TOKEN>
   Content-Type: application/json

   {
     "title": "Calculus 101",
     "description": "Introduction to derivatives and integrals",
     "startTime": "2026-10-01T10:00:00",
     "endTime": "2026-10-01T12:00:00",
     "maxCapacity": 5,
     "mentor": { "id": <MENTOR_ID> },
     "subject": { "id": 1 }
   }
   ```

2. **Get Available Sessions (Paginated)**:
   ```bash
   GET http://localhost:8080/api/sessions?page=0&size=10
   Authorization: Bearer <JWT_TOKEN>
   ```

---

#### C. Enrollments API (`/api/enrollments`)
1. **Enroll Learner in Session**:
   ```bash
   POST http://localhost:8080/api/enrollments/enroll?learnerId=<LEARNER_ID>&sessionId=<SESSION_ID>
   Authorization: Bearer <LEARNER_JWT_TOKEN>
   ```
   *Expected Response*: `200 OK` with string `"Enrolled"`.

2. **Duplicate Enrollment Check**:
   Re-send the exact enrollment request.
   *Expected Response*: `400 Bad Request` with message `"Already enrolled in this session"`.

3. **Cancel / Discontinue Enrollment**:
   ```bash
   DELETE http://localhost:8080/api/enrollments/cancel?learnerId=<LEARNER_ID>&sessionId=<SESSION_ID>
   Authorization: Bearer <LEARNER_JWT_TOKEN>
   ```
   *Expected Response*: `200 OK` with string `"Enrollment cancelled"`.

---

#### D. Feedback API (`/api/feedback`)
1. **Submit Feedback (Learner)**:
   ```bash
   POST http://localhost:8080/api/feedback?learnerId=<LEARNER_ID>&sessionId=<SESSION_ID>&rating=5&comment=Great session!
   Authorization: Bearer <LEARNER_JWT_TOKEN>
   ```

2. **View Feedback (Support Agent or Admin)**:
   ```bash
   GET http://localhost:8080/api/feedback
   Authorization: Bearer <SUPPORT_AGENT_JWT_TOKEN>
   ```

---

## 6. Frontend UI Role-Based Manual Testing Checklist

| Test Scenario | Steps | Expected Outcome |
| :--- | :--- | :--- |
| **Login Validation** | Enter invalid credentials on `/login`. | Paragraph with `data-testid="error-message"` displays `"Invalid Credentials."`. |
| **Learner View** | Login as a `LEARNER`. | Navbar displays **Sessions**, **Subjects**, and **Enrollments**. Home displays `Welcome back <Name>`. |
| **Mentor View** | Login as an approved `MENTOR`. | Navbar displays **Sessions** and **Subjects**. Button `+ Add Session` is visible on `/sessions`. |
| **Admin View** | Login as `admin@loomlearn.com`. | Navbar displays **Subjects** and **Mentors**. Admin can create/delete study subjects and change mentor status (`APPROVED`, `BLOCKED`, `PENDING`). |
| **Support View** | Login as `support@loomlearn.com`. | Navbar displays **Support**. Displays feedback list or `EmptyState` (`No feedback received yet.`). |
| **Session Title Validation** | On session creation modal, submit with an empty title. | Form validation blocks API submission. |
| **Form Reset** | Click `Reset` button on form resetting fields. | Input element with `data-testid="reset-input"` clears correctly. |
| **Logout Flow** | Click `Logout` in Navbar. | JWT token cleared from `localStorage`, redirects to `/login`. |

---

## 7. Quick Sanity Verification Script

Run the backend and frontend simultaneously in separate terminals:

```powershell
# Terminal 1 - Start Backend
cd backend
./mvnw spring-boot:run

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

Open your browser at `http://localhost:5173` to conduct full interactive testing.
