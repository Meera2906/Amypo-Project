LoomLearn - Collaborative Peer-to-Peer Tutoring System
Table of Contents
Overall Description
System Architecture and Design Philosophy
Project Folder Structure and File Definitions
Functional Requirements and Workflow Specifications
Module-Wise Detailed Design
Data Management
Routing & Navigation
Non-Functional Requirements
Conclusion
Project Overview
The system orchestrates a collaborative peer-to-peer tutoring ecosystem, natively facilitating mentor-led session scheduling, learner-driven enrollment tracking, and academic subject management. It provides structural entry points for tutoring session creation with automated capacity validation, enrollment workflow moderation, mentor feedback ingestion, and platform-wide analytics for administrative oversight securely.
The system enforces role-based access control, dynamically allocating distinct application privileges for LEARNER, MENTOR, ACADEMIC_ADMIN, and SUPPORT_AGENT roles inherently. All interactions strictly utilize a stateless filter topology that executes the standard HS256 JWT algorithm, implicitly signing JSON Web Tokens to prevent unauthorized session modifications and natively restricting administrative data access internally and safely.
Technology Stack
Framework: Spring Boot
Java Version: Java 17+
Build Tool: Maven
Frontend: React
Database: MySQL
ORM: Spring Data JPA
Security: Spring Security
Password Encoding: BCrypt
JWT Library: JJWT (io.jsonwebtoken)
Project Structure
Backend Structure

backend/
└── src/
    └── main/
        └── java/
            └── com/example/demo/
                ├── config/
                │   ├── DataSeeder.java
                │   ├── JwtAuthenticationFilter.java
                │   └── SecurityConfig.java
                │
                ├── controller/
                │   ├── AnalyticsController.java
                │   ├── AuthController.java
                │   ├── EnrollmentController.java
                │   ├── FeedbackController.java
                │   ├── SessionController.java
                │   ├── SubjectController.java
                │   └── UserController.java
                │
                ├── dto/
                │   ├── AuthRequestDto.java
                │   ├── AuthResponseDto.java
                │   ├── RegisterDto.java
                │   └── SessionDto.java
                │
                ├── entity/
                │   ├── AcademicUser.java
                │   ├── MentorFeedback.java
                │   ├── SessionEnrollment.java
                │   ├── StudySubject.java
                │   └── TutoringSession.java
                │
                ├── exception/
                │   ├── BusinessValidationException.java
                │   ├── GlobalExceptionHandler.java
                │   └── ResourceNotFoundException.java
                │
                ├── repository/
                │   ├── AcademicUserRepository.java
                │   ├── MentorFeedbackRepository.java
                │   ├── SessionEnrollmentRepository.java
                │   ├── StudySubjectRepository.java
                │   └── TutoringSessionRepository.java
                │
                ├── service/
                │   ├── AcademicAuthService.java
                │   ├── AdministrativeService.java
                │   ├── EnrollmentWorkflowService.java
                │   ├── FeedbackModerationService.java
                │   ├── FeedbackService.java
                │   └── SessionManagementService.java
                │
                ├── util/
                │   └── JwtUtil.java
                │
                └── DemoApplication.java

Frontend Structure

frontend/
├── node_modules/
├── public/
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── CapacityBar.js
│   │       ├── EmptyState.js
│   │       ├── Modal.js
│   │       ├── Navbar.js
│   │       ├── StatCards.js
│   │       ├── SubjectChart.js
│   │       └── Timeline.js
│   │
│   ├── pages/
│   │   ├── EnrollmentTracking.js
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── MentorProfiles.js
│   │   ├── MyEnrollments.js
│   │   ├── Register.js
│   │   ├── SessionList.js
│   │   ├── SubjectList.js
│   │   └── SupportDashboard.js
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── enrollmentService.js
│   │   ├── feedbackService.js
│   │   ├── sessionService.js
│   │   ├── subjectService.js
│   │   └── userService.js
│   │
│   ├── store/
│   │   └── slices/
│   │       ├── authSlice.js
│   │       ├── enrollmentSlice.js
│   │       ├── index.js
│   │       ├── sessionSlice.js
│   │       ├── store.js
│   │       └── subjectSlice.js
│   │
│   ├── App.css
│   ├── App.js
│   └── index.js
│
└── package.json


Backend Structure Description
The backend follows a standard Spring Boot layered architecture. The main package is com.example.demo.
It contains the following subpackages:
controller
service
repository
entity
dto
config
util
exception
Controller Package
Contains:
AuthController
SessionController
UserController
SubjectController
EnrollmentController
FeedbackController
AnalyticsController
Service Package
Contains:
AcademicAuthService
SessionManagementService
EnrollmentWorkflowService
AdministrativeService
FeedbackService
FeedbackModerationService
Repository Package
Contains:
AcademicUserRepository
TutoringSessionRepository
StudySubjectRepository
SessionEnrollmentRepository
MentorFeedbackRepository
Entity Package
Contains:
AcademicUser
TutoringSession
StudySubject
SessionEnrollment
MentorFeedback
DTO Package
Contains:
AuthRequestDto
AuthResponseDto
RegisterDto
SessionDto
Config Package
Contains:
SecurityConfig
Util Package
Contains:
JwtUtil
Exception Package
Contains:
GlobalExceptionHandler
BusinessValidationException
ResourceNotFoundException
Root Package
Contains:
LoomLearnApplication.java
Frontend Structure Description
The frontend src directory contains the following subdirectories:
pages
components
services
store
Pages Directory
Contains:
Login.jsx
Register.jsx
Home.jsx
SessionList.jsx
SubjectList.jsx
MyEnrollments.jsx
EnrollmentTracking.jsx
MentorProfiles.jsx
SupportDashboard.jsx
Components Directory
Contains:
Navbar.jsx
StatCards.jsx
SubjectChart.jsx
Timeline.jsx
CapacityBar.jsx
EmptyState.jsx
Modal.jsx
LoadingSpinner.jsx
FormReset.jsx
Services Directory
Contains:
api.js
authService.js
sessionService.js
enrollmentService.js
feedbackService.js
subjectService.js
userService.js
Store Directory
Contains:
store.js
authSlice.js
sessionSlice.js
subjectSlice.js
enrollmentSlice.js
Root Directory
Contains:
App.js
index.js
Dependencies and Configuration
Backend Dependencies
Spring Boot Starter Web
Spring Boot Starter Data JPA
Spring Boot Starter Security
MySQL Connector/J
JWT Library (JJWT)
Lombok
Frontend Dependencies
React Router DOM
Redux Toolkit
React Redux
Axios
Documentation
Swagger API
Testing
Testing Library Jest DOM
React Testing Library
Database Configuration
URL
jdbc:mysql://localhost:3306/loomlearn_db?createDatabaseIfNotExist=true&useSSL=false

Username
root

Password
Configured in application.properties
JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect

Entity Models
AcademicUser (Table: academic_users)
Fields
id (Long)
fullName (String)
email (String)
password (String)
role (UserRole enum)
department (String)
bio (String)
status (UserStatus enum)
Validation
email is unique and not nullable
fullName is not nullable
password is not nullable
role is enumerated as String and not nullable
status is enumerated as String and not nullable
UserRole Enum Values
LEARNER
MENTOR
ACADEMIC_ADMIN
SUPPORT_AGENT
UserStatus Enum Values
PENDING
APPROVED
REJECTED
BLOCKED

TutoringSession (Table: tutoring_sessions)
Fields
id (Long)
title (String)
description (String)
startTime (LocalDateTime)
endTime (LocalDateTime)
maxCapacity (Integer)
currentEnrollment (Integer)
status (SessionStatus enum)
mentor (AcademicUser ManyToOne)
subject (StudySubject ManyToOne)
Validation
title is not nullable
startTime is not nullable
endTime is not nullable
maxCapacity is not nullable
status is enumerated as String and not nullable
SessionStatus Enum Values
SCHEDULED
ACTIVE
COMPLETED
CANCELLED
Relationships
ManyToOne eager fetch for mentor with join column not nullable
ManyToOne eager fetch for subject with join column not nullable

StudySubject (Table: study_subjects)
Fields
id (Long)
name (String)
description (String)
Validation
name is unique and not nullable
SessionEnrollment (Table: session_enrollments)
Fields
id (Long)
enrollmentDate (LocalDateTime)
status (EnrollmentStatus enum)
feedbackSubmitted (boolean)
learner (AcademicUser ManyToOne)
session (TutoringSession ManyToOne)
Validation
enrollmentDate is not nullable
status is enumerated as String and not nullable
learner join column is not nullable
session join column is not nullable
EnrollmentStatus Enum Values
ENROLLED
ATTENDED
CANCELLED
DISCONTINUED
Relationships
ManyToOne lazy fetch for learner
ManyToOne lazy fetch for session
MentorFeedback (Table: mentor_feedback)
Fields
id (Long)
rating (Integer)
comment (String)
learner (AcademicUser ManyToOne)
mentor (AcademicUser ManyToOne)
session (TutoringSession OneToOne)
Validation
rating is not nullable
learner join column is not nullable
mentor join column is not nullable
session join column is not nullable
Relationships
ManyToOne lazy fetch for learner
ManyToOne lazy fetch for mentor
OneToOne for session

Repositories
All repositories must be interfaces extending JpaRepository with entity type and Long.
AcademicUserRepository
Contains the following methods:
Optional findByEmail(String email);
boolean existsByEmail(String email);
List findByRole(UserRole role);
long countByRole(UserRole role);
long countByRoleAndStatus(UserRole role, UserStatus status);

TutoringSessionRepository
Contains the following methods:
Page findByStatusIn(
    Collection<SessionStatus> statuses,
    Pageable pageable
);

long countByStatus(SessionStatus status);

StudySubjectRepository
Contains the following methods:
Optional findByName(String name);

Query (Native or JPQL) for:
getSubjectEnrollmentStats()

Returning:
List<Map<String, Object>>

SessionEnrollmentRepository
Contains the following methods:
List findByLearnerId(Long learnerId);

boolean existsByLearnerIdAndSessionId(
    Long learnerId,
    Long sessionId
);

MentorFeedbackRepository
Contains the following method:
Double getAverageRatingByMentorId(Long mentorId);

Implemented using a JPQL or Native Query.
Service Layer
AcademicAuthService
Contains the following methods:
register
The register method accepts RegisterDto.
Validates email uniqueness via existsByEmail()
Throws BusinessValidationException if email already exists
Encodes password using BCrypt
Sets status to PENDING for MENTOR role
Sets status to APPROVED for all other roles
Saves the AcademicUser
Generates JWT token using JwtUtil
Returns AuthResponseDto containing token and user details
login
The login method accepts AuthRequestDto.
Loads user by email
Throws ResourceNotFoundException if user does not exist
Validates BCrypt password hash
Throws BusinessValidationException if password validation fails
Validates account status
Throws BusinessValidationException if status is PENDING or BLOCKED
Generates JWT token
Returns AuthResponseDto

SessionManagementService
Contains the following methods:
createSession
The createSession method accepts TutoringSession.
Validates that start time is not in the past
Throws BusinessValidationException if invalid
Resolves mentor and subject
Saves and returns the session
updateSession
The updateSession method accepts:
Long id,
TutoringSession sessionDetails

Loads session by id
Updates:
title
description
startTime
endTime
subject
Saves and returns the session
cancelSession
The cancelSession method accepts Long id.
Loads session
Sets status to CANCELLED
Saves the session
updateSessionStatus
The updateSessionStatus method accepts:
Long id,
SessionStatus status

Loads session
Validates business transitions
Saves updated status
getAvailableSessions
The getAvailableSessions method accepts Pageable.
Returns paginated sessions using:
findByStatusIn(...)

for:
SCHEDULED
ACTIVE
COMPLETED

EnrollmentWorkflowService
Contains the following methods:
enrollLearner
The enrollLearner method accepts:
Long learnerId,
Long sessionId

Loads session
Validates session status equals SCHEDULED
Validates currentEnrollment < maxCapacity
Throws BusinessValidationException if validation fails
Checks duplicate enrollment via:
existsByLearnerIdAndSessionId(...)

Creates SessionEnrollment
Sets status to ENROLLED
Increments session.currentEnrollment
The method is annotated:
@Transactional(rollbackFor = Exception.class)

cancelEnrollment
The cancelEnrollment method accepts:
Long learnerId,
Long sessionId

Finds active SessionEnrollment
Sets status to DISCONTINUED
Decrements session.currentEnrollment
The method is annotated:
@Transactional(rollbackFor = Exception.class)

AdministrativeService
Contains the following methods:
getPlatformStats
The getPlatformStats method returns:
Map<String, Object>

It aggregates counts using:
countByRole()
countByRoleAndStatus()
countByStatus()
getSubjectEnrollmentStats()
getMentorDashboardStats
The getMentorDashboardStats method accepts:
Long mentorId

It aggregates mentor-specific metrics and returns:
Map<String, Object>


FeedbackService
Contains the following methods:
submitFeedback
The submitFeedback method accepts:
Long learnerId,
Long sessionId,
Integer rating,
String comment

Creates MentorFeedback
Sets rating and comment
Marks feedbackSubmitted = true on SessionEnrollment
Saves and returns the feedback
getAllFeedback
The getAllFeedback method:
Retrieves all feedback
Returns:
List<MentorFeedback>


FeedbackModerationService
Contains the following methods:
submitFeedback
The submitFeedback method accepts:
Long learnerId,
Long sessionId,
Integer rating,
String comment

Creates and saves MentorFeedback
getMentorPerformance
The getMentorPerformance method accepts:
Long mentorId

Returns a map containing:
averageRating
totalReviews

Controller Layer
Controllers leverage @RestController for JSON serialization.
All responses are wrapped in Spring's ResponseEntity.

AuthController
Mapped to:
/api/auth

The AuthController receives AcademicAuthService as a constructor argument.
login
Method name: login
Accepts: AuthRequestDto as @RequestBody
HTTP Method: POST
Endpoint:
/login

Publicly accessible
Returns:
ResponseEntity<AuthResponseDto>

register
Method name: register
Accepts: RegisterDto as @RequestBody
HTTP Method: POST
Endpoint:
/register

Publicly accessible
Returns:
ResponseEntity<AuthResponseDto>

SessionController
Mapped to:
/api/sessions

The SessionController receives SessionManagementService as a constructor argument.
getAll
Method name: getAll
Accepts: Pageable
HTTP Method: GET
Requires authentication
Returns:
ResponseEntity<Page<TutoringSession>>

create
Method name: create
Accepts: TutoringSession as @RequestBody
HTTP Method: POST
Requires authentication
Returns:
ResponseEntity<TutoringSession>

update
HTTP Method: PUT
Endpoint:
/{id}

Accepts: TutoringSession as @RequestBody
Requires authentication
Returns:
ResponseEntity<TutoringSession>

updateStatus
HTTP Method: PUT
Endpoint:
/{id}/status

Accepts: @RequestParam String status
Requires authentication
Returns:
ResponseEntity<String>

Response message:
Status updated...

cancel
Method name: cancel
Accepts: Long id
HTTP Method: DELETE
Endpoint:
/{id}

Requires authentication
Returns:
ResponseEntity<String>

Response message:
Session cancelled


UserController
Mapped to:
/api/users

getMentors
Method name: getMentors
HTTP Method: GET
Endpoint:
/mentors

Requires authentication
Returns:
ResponseEntity<List<AcademicUser>>

getProfile
Method name: getProfile
Accepts: Long id
HTTP Method: GET
Endpoint:
/{id}

Requires authentication
Returns:
ResponseEntity<AcademicUser>

updateStatus
HTTP Method: PUT
Endpoint:
/{id}/status

Accepts:
@RequestParam UserStatus status

Requires ADMIN role
Returns:
ResponseEntity<AcademicUser>

SubjectController
Mapped to:
/api/subjects

listAll
Method name: listAll
HTTP Method: GET
Requires authentication
Returns:
ResponseEntity<List<StudySubject>>

create
Method name: create
Accepts: StudySubject as @RequestBody
HTTP Method: POST
Requires ADMIN role
Returns:
ResponseEntity<StudySubject>

update
HTTP Method: PUT
Endpoint:
/{id}

Accepts: StudySubject as @RequestBody
Requires ADMIN role
Returns:
ResponseEntity<StudySubject>

delete
Method name: delete
Accepts: Long id
HTTP Method: DELETE
Endpoint:
/{id}

Requires ADMIN role
Returns:
ResponseEntity<String>

Response message:
Subject deleted

The SubjectController receives StudySubjectRepository as a constructor argument.

EnrollmentController
Mapped to:
/api/enrollments

The EnrollmentController receives:
EnrollmentWorkflowService
SessionEnrollmentRepository
as constructor arguments.
getMyEnrollments
Method name: getMyEnrollments
Accepts: Long learnerId
HTTP Method: GET
Endpoint:
/my

Requires LEARNER role
Returns:
ResponseEntity<List<SessionEnrollment>>

enroll
Method name: enroll
Accepts:
Long learnerId
Long sessionId
HTTP Method: POST
Endpoint:
/enroll

Requires LEARNER role
Returns:
ResponseEntity<String>

Response message:
Enrolled

cancelEnrollment
Method name: cancelEnrollment
Accepts:
Long learnerId
Long sessionId
HTTP Method: DELETE
Endpoint:
/cancel

Requires LEARNER role
Returns:
ResponseEntity<String>

Response message:
Enrollment cancelled

FeedbackController
Mapped to:
/api/feedback

submitFeedback
HTTP Method: POST
Accepts RequestParam values:
learnerId
sessionId
rating
comment
Requires LEARNER role
Returns:
ResponseEntity<MentorFeedback>

getAllFeedback
HTTP Method: GET
Requires ADMIN or SUPPORT role
Returns:
ResponseEntity<List<MentorFeedback>>


AnalyticsController
Mapped to:
/api/analytics

getStats
HTTP Method: GET
Endpoint:
/stats

Requires ADMIN role
Returns:
ResponseEntity<Map<String, Object>>

getMentorStats
HTTP Method: GET
Endpoint:
/mentor/{mentorId}

Requires MENTOR role
Returns:
ResponseEntity<Map<String, Object>>


Security Implementation
JWT Configuration
JWT Signing Algorithm: HS256
Security Utility Class: JwtUtil
Package:
com.example.demo.util

JwtUtil Fields
@Value("${loomlearn.jwt.secret}")
private String secret;

@Value("${loomlearn.jwt.expiration}")
private long expirationTime;

JwtUtil Methods
generateToken
Accepts:
String email

Functionality:
Builds JWT token
Sets subject to email
Sets issuedAt timestamp
Sets expiration timestamp
validateToken
Accepts:
String token

Returns:
boolean

Functionality:
Validates JWT by parsing claims
Returns true if parsing succeeds
extractEmail
Accepts:
String token

Returns:
String

Functionality:
Extracts subject (email) from JWT claims
SecurityConfig
Must declare a Bean method:
@Bean
public PasswordEncoder passwordEncoder()

Returning:
BCryptPasswordEncoder

Must declare a Bean method:
@Bean
public SecurityFilterChain securityFilterChain(
    HttpSecurity http
)

CORS Configuration
Allowed Origin:
http://localhost:3000

Allowed:
Methods
Headers
Credentials
Route Security
Public Routes:
/api/auth/**

Authenticated Routes:
All remaining routes

Session Management
STATELESS

JwtAuthenticationFilter
Extends:
OncePerRequestFilter

Responsibilities:
Extract Bearer token
Extract email from token
Validate token
Create UsernamePasswordAuthenticationToken
Store authentication in SecurityContextHolder
DataSeeder
Package:
com.example.demo.config

Purpose:
The DataSeeder class initializes default application data during application startup.
Responsibilities:
Create default academic subjects
Create administrative users
Seed reference records
Prevent duplicate initialization
Typically executes through:
CommandLineRunner

during Spring Boot application startup.

Exception Handling
Package:
com.example.demo.exception

The application centralizes exception management using:
GlobalExceptionHandler

annotated with:
@RestControllerAdvice

BusinessValidationException
Used when business rules are violated.
Examples:
Duplicate email registration
Session capacity exceeded
Invalid session status transition
Enrollment conflicts
Returns:
HTTP 400 - Bad Request


ResourceNotFoundException
Used when requested resources cannot be found.
Examples:
User not found
Session not found
Subject not found
Enrollment not found
Returns:
HTTP 404 - Not Found


Generic Exception Handling
Handles unexpected runtime exceptions.
Returns:
HTTP 500 - Internal Server Error


Data Transfer Objects (DTOs)
Package:
com.example.demo.dto

DTOs are used to transfer data between client and server while avoiding direct exposure of entity classes.

AuthRequestDto
Fields:
private String email;
private String password;

Purpose:
Used during user authentication requests.

AuthResponseDto
Fields:
private Long id;
private String token;
private String fullName;
private String email;
private UserRole role;

Purpose:
Returned after successful authentication or registration.
Contains:
User details
JWT token
Assigned role

RegisterDto
Fields:
private String fullName;
private String email;
private String password;
private UserRole role;
private String department;
private String bio;

Purpose:
Used for user registration requests.

SessionDto
Fields:
private Long id;
private String title;
private LocalDateTime startTime;
private LocalDateTime endTime;
private Integer maxCapacity;
private Integer currentEnrollment;
private String mentorName;
private String subjectName;

Purpose:
Used to expose session information to frontend consumers without exposing the complete entity graph.
Utility Classes
JwtUtil
Located in the com.example.demo.util package.

API Endpoints
The following API endpoints are defined:
Authentication
POST /api/auth/login
Public access
Returns: AuthResponseDto
POST /api/auth/register
Public access
Returns: AuthResponseDto

Sessions
GET /api/sessions
Authenticated access
Returns: Page<TutoringSession>
POST /api/sessions
MENTOR / ADMIN access
Returns: TutoringSession
PUT /api/sessions/{id}
MENTOR / ADMIN access
Returns: TutoringSession
PUT /api/sessions/{id}/status
MENTOR / ADMIN access
Returns: String message
DELETE /api/sessions/{id}
MENTOR / ADMIN access
Returns: String message

Subjects
GET /api/subjects
Authenticated access
Returns: List<StudySubject>
POST /api/subjects
ADMIN access
Returns: StudySubject
PUT /api/subjects/{id}
ADMIN access
Returns: StudySubject
DELETE /api/subjects/{id}
ADMIN access
Returns: String message

Enrollments
GET /api/enrollments/my
LEARNER access
Returns: List<SessionEnrollment>
POST /api/enrollments/enroll
LEARNER access
Returns: String message
DELETE /api/enrollments/cancel
LEARNER access
Returns: String message

Users
GET /api/users/mentors
Authenticated access
Returns: List<AcademicUser>
GET /api/users/{id}
Authenticated access
Returns: AcademicUser
PUT /api/users/{id}/status
ADMIN access
Returns: AcademicUser

Feedback
POST /api/feedback
LEARNER access
Returns: MentorFeedback
GET /api/feedback
ADMIN / SUPPORT access
Returns: List<MentorFeedback>

Analytics
GET /api/analytics/stats
ADMIN access
Returns: Map<String, Object>
GET /api/analytics/mentor/{mentorId}
MENTOR access
Returns: Map<String, Object>

Frontend Component Specifications
App.js (Global Architecture)
Purpose
Application routing and root-level style wrappers.
Implementation Requirements
Must include a container div with className="glass-card" simulating the main application wrapper styling required by the testing framework.
Implements React Router Routes mapping individual pages to paths including:
/
/login
/register
/sessions
/subjects
/enrollments
/mentors
/support
Utilizes a ProtectedRoute wrapper component checking state.auth.token before permitting navigation.

Login.jsx
Purpose
Actively configures authentication fields explicitly validating credential extraction internally and dynamically.
Implementation Requirements
Email input must have the exact placeholder:
"Enter your email"
Password input must have the exact placeholder:
"Enter your password"
Submit button must have the exact label:
"Login"
Dispatches login async thunk via Redux.
Displays error string via a paragraph element with:
data-testid="error-message"

containing the exact text:
Invalid Credentials.

when authentication fails.

Register.jsx
Purpose
Captures new account registration for MENTOR and LEARNER roles.
Implementation Requirements
Role toggle switch mapping to LEARNER or MENTOR.
Inputs for:
Full Name
Email
Password
Conditionally renders Department and Bio inputs if MENTOR is selected.
Submit button dispatches register async thunk.
Navigates to root path upon successful registration.

Navbar.jsx
Purpose
Exposes native structural constraints tracking authorizations conditionally modifying standard navigation seamlessly.
Implementation Requirements
Must render an HTML tag with:
role="navigation"

Conditional rendering based on user role:
LEARNER
Sees:
Sessions
Subjects
Enrollments
MENTOR
Sees:
Sessions
Subjects
ACADEMIC_ADMIN
Sees:
Subjects
Mentors
SUPPORT_AGENT
Sees:
Support
Implements Logout link that dispatches the auth logout action.

Home.jsx
Purpose
Renders role-specific platform overview.
Implementation Requirements
Upon successful dashboard load, must display a welcome heading inside an h1 element exactly matching:
Welcome back {fullName}

where fullName is the user's name.
Fetches platform stats via API on mount.
Renders:
StatCards
SubjectChart
Timeline
based on response.

SessionList.jsx
Purpose
Orchestrates session management providing CRUD interfaces with pagination.
Implementation Requirements
The main container mapping the list must render a heading with the exact text:
Tutoring Sessions

Must be wrapped inside:
<div className="container">

For MENTOR and ADMIN roles, there must be an exact button labeled:
+ Add Session

that opens the creation form modal.
The creation form modal must contain a title input with the exact placeholder:
e.g. Calculus 101

The creation form modal must use inputs with:
type="datetime-local"

and these must have a required HTML attribute.
The modal submit button must have the exact label:
Create Session

The form submission button must have the CSS class:
btn-primary

On successful creation, backend expects:
Session created successfully.

feedback flow logic.
On successful deletion, backend expects:
Session deleted successfully.

feedback flow logic.
Maps items using specific status colors for:
SCHEDULED
ACTIVE
COMPLETED
CANCELLED
Ensures titles like:
Advanced Quantum Physics

render correctly from backend payloads.
The form must perform frontend validation that blocks submission when the title input field is empty.
The system shall not dispatch the create API call if the title value is:
empty
null
whitespace only
When a network error occurs during session fetch, such as when the API request fails:
The component must gracefully handle the error.
The application must not crash.
An error message should be displayed.
The loading state should be cleared.

SubjectList.jsx
Purpose
Exposes academic subject listings with CRUD management.
Implementation Requirements
Fetches subjects on mount.
ADMIN role sees:
Add Subject button
Edit action
Delete action
for each row.
Opens Modal component for creating and updating.
Handles subject deletion feedback properly, expecting the success string:
Deleted

from the backend response.
The frontend shall display a success notification or update the UI to reflect the deletion.
Must properly render backend subject titles such as:
Quantum Mechanics


MyEnrollments.jsx
Purpose
Personal enrollment tracking and feedback loop for LEARNERs.
Implementation Requirements
Renders a heading element with the text:
My Enrollments

Fetches and displays a list of the user's current session enrollments via:
enrollmentService.getMyEnrollments()

Action button:
Discontinue

is rendered for SCHEDULED status enrollments, dispatching a delete call to the enrollments cancel endpoint.
Action button:
Give Feedback

is rendered for COMPLETED status enrollments.
Delete operation expects the exact success string:
Deleted

when an enrollment is successfully discontinued.
EnrollmentTracking.jsx
Purpose
Administrative or Mentor view of specific enrollments inside a session.
Implementation Requirements
Takes a sessionId prop and fetches all enrollments corresponding to it.
Displays learner names, dates, and statuses.

MentorProfiles.jsx
Purpose
Admin management of mentor applications.
Implementation Requirements
Fetches users via:
userService.getMentors()

Renders a grid of mentor cards showing status badges including:
APPROVED
PENDING
BLOCKED
Contains exact action buttons for:
Approve
Decline
Block

modifying the user status via PUT request.

SupportDashboard.jsx
Purpose
Overview of learner feedback for support agents.
Implementation Requirements
Fetches all feedback comments via:
feedbackService.getAllFeedback()

Renders a grid of feedback cards detailing:
Rating
Comment
Learner Full Name
Mentor Full Name
Implements an EmptyState component showing:
No feedback received yet.

when the data array has length zero.

StatCards.jsx
Purpose
Renders numerical dashboard metrics.
Implementation Requirements
Accepts a stats prop.
Renders a grid of div elements with:
stat-card

class, containing:
a label
a value metric

SubjectChart.jsx
Purpose
Visual chart component for subject enrollments.
Implementation Requirements
Accepts a data prop.
Iterates over an array of objects containing:
name
count
Dynamically calculates the width style of bar-fill divs using:
(count / maxCount) * 100%


Timeline.jsx
Purpose
Renders a list of chronological system events.
Implementation Requirements
Accepts an activities prop.
Iterates over the array to render list item elements with:
className="timeline-item"


CapacityBar.jsx
Purpose
Renders an active visual progression bar mapping to capacity filled.
Implementation Requirements
Accepts current and max props.
Determines color logically:
90 percent or greater maps to bar-red
70 percent or greater maps to bar-amber
Otherwise maps to bar-green
Width is determined by:
(current / max) * 100%


EmptyState.jsx
Purpose
Placeholder visual structure for unpopulated data tables.
Implementation Requirements
Accepts:
message
ctaText
onCtaClick
props.
Renders a magnifying glass emoji icon and the dynamic text inside a div with:
card

class.

Modal.jsx
Purpose
Generic floating DOM overlay for dynamic forms.
Implementation Requirements
Accepts:
isOpen
onClose
title
children
props.
Returns null if isOpen is false.
Root div uses:
modal-overlay

class and binds onClick to onClose.
Content div uses:
modal-content

class and stops click propagation.

LoadingSpinner Component (Utility)
Purpose
Informs the user that asynchronous state is resolving.
Implementation Requirements
Whenever data is loading, must render a div containing the exact text:
Loading...

and the attribute:
data-testid="loader"


FormReset Component (Utility)
Purpose
Native form clear behavior.
Implementation Requirements
Any form reset capability must use a button labeled exactly:
Reset

that clears the target input marked with:
data-testid="reset-input"


Frontend Service Configurations (Axios API)
api.js
Purpose
Configuration provider isolating Axios instance parameters natively.
Implementation Requirements
baseURL is set to:
http://localhost:8080/api

Request Interceptor reads token from localStorage key:
loom_token

and injects Authorization header with Bearer token.
Response Interceptor validates global 401 responses, navigating the user to login upon authentication failure.

authService.js
Purpose
Manages global session authentication lifecycle securely.
Implementation Requirements
login accepts credentials and calls:
POST /auth/login

register accepts dto and calls:
POST /auth/register


sessionService.js
Purpose
Directly mediates Axios promise components mapping against session endpoints.
Implementation Requirements
getAll accepts page and size parameters and calls:
GET /sessions

with query parameters.
create accepts data and calls:
POST /sessions

update accepts id and data and calls:
PUT /sessions/{id}

updateStatus accepts id and status and calls:
PUT /sessions/{id}/status

with status query parameter.
cancel accepts id and calls:
DELETE /sessions/{id}


enrollmentService.js
Purpose
Directly mediates Axios promise components mapping against enrollment endpoints.
Implementation Requirements
getMyEnrollments accepts learnerId and calls:
GET /enrollments/my

enroll accepts learnerId and sessionId and calls:
POST /enrollments/enroll

discontinue accepts learnerId and sessionId and calls:
DELETE /enrollments/cancel



feedbackService.js
Purpose
Directly mediates Axios promise components mapping against feedback endpoints.
Implementation Requirements
submitFeedback accepts data and calls:
POST /feedback

getAllFeedback calls:
GET /feedback


subjectService.js
Purpose
Directly mediates Axios promise components mapping against subject endpoints.
Implementation Requirements
getAll calls:
GET /subjects

create accepts data and calls:
POST /subjects

update accepts id and data and calls:
PUT /subjects/{id}

delete accepts id and calls:
DELETE /subjects/{id}


userService.js
Purpose
Directly mediates Axios promise components mapping against user endpoints.
Implementation Requirements
getMentors calls:
GET /users/mentors

getStats calls:
GET /analytics/stats

getMentorStats accepts id and calls:
GET /analytics/mentor/{id}


Frontend Store Configurations (Redux Toolkit)
store.js
Purpose
Root orchestrator managing global state slices inherently.
Implementation Requirements
Configures store via configureStore with:
auth reducer
sessions reducer
subjects reducer
enrollments reducer

authSlice.js
Purpose
Maintains domain payload entities securing global session variables securely.
Implementation Requirements
Initial state reads from localStorage keys:
loom_user
loom_token

Thunks include:
login
register
Sets token and user state globally upon fulfillment.
Handles Redux logout logic via explicit reducer.

sessionSlice.js
Purpose
Manages tutoring session state for paginated list rendering.
Implementation Requirements
Initial state contains:
items array
loading boolean
error null
totalPages number
currentPage number
Thunks include:
fetchSessions
createSession

subjectSlice.js
Purpose
Manages academic subject state configurations.
Implementation Requirements
Initial state contains:
items array
loading boolean
error null
Thunks include:
fetchSubjects

enrollmentSlice.js
Purpose
Manages transactional states regarding student enrollments.
Implementation Requirements
Initial state contains:
items array
loading boolean
error null
Thunks include:
enrollInSession

Handles:
pending
fulfilled
rejected
status injections to prevent dual enrollments visually before server response.
