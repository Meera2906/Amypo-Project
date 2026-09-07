// Central Reactive Mock Store for LoomLearn
// Ensures seamless data consistency across sessions, enrollments, mentors, subjects, and feedbacks

const STORAGE_KEY = 'loom_mock_data_v3'

const defaultUsers = [
  {
    id: 1,
    fullName: 'Charlie Admin',
    email: 'admin@loomlearn.com',
    role: 'ACADEMIC_ADMIN',
    department: 'Administration',
    bio: 'Academic Administrator overseeing faculty verification and curriculum quality.',
    status: 'APPROVED',
  },
  {
    id: 2,
    fullName: 'Bob Mentor',
    email: 'mentor@loomlearn.com',
    role: 'MENTOR',
    department: 'Computer Science',
    bio: 'Lead Software Architecture & Artificial Intelligence Mentor with 6+ years experience.',
    status: 'APPROVED',
  },
  {
    id: 3,
    fullName: 'John Learner',
    email: 'learner@loomlearn.com',
    role: 'LEARNER',
    department: 'Computer Science',
    bio: 'Dedicated learner passionate about distributed computing and machine learning algorithms.',
    status: 'APPROVED',
  },
  {
    id: 4,
    fullName: 'Diane Support',
    email: 'support@loomlearn.com',
    role: 'SUPPORT_AGENT',
    department: 'Support',
    bio: 'Lead Support Specialist ensuring student satisfaction and mentor accountability.',
    status: 'APPROVED',
  },
  {
    id: 5,
    fullName: 'Dr. Robert Chen',
    email: 'robert.chen@loomlearn.com',
    role: 'MENTOR',
    department: 'Computer Science',
    bio: 'Specializes in Graph Theory, Data Structures, and Distributed Systems. 5+ years academic mentoring.',
    status: 'APPROVED',
  },
  {
    id: 6,
    fullName: 'Prof. Alex Rivera',
    email: 'alex.rivera@loomlearn.com',
    role: 'MENTOR',
    department: 'Mathematics',
    bio: 'Linear Algebra, Multi-Variable Calculus, and Numerical Methods researcher.',
    status: 'APPROVED',
  },
  {
    id: 7,
    fullName: 'Dr. Alan Smith',
    email: 'alan.smith@loomlearn.com',
    role: 'MENTOR',
    department: 'Computer Science',
    bio: 'Compiler construction, operating systems, and kernel engineering. Application pending faculty review.',
    status: 'PENDING',
  },
  {
    id: 8,
    fullName: 'Elena Rostova',
    email: 'elena.rostova@loomlearn.com',
    role: 'MENTOR',
    department: 'Physics',
    bio: 'Quantum Mechanics and Particle Dynamics specialist helping undergraduates conquer physics.',
    status: 'APPROVED',
  },
  {
    id: 9,
    fullName: 'Marcus Vance',
    email: 'marcus.vance@loomlearn.com',
    role: 'MENTOR',
    department: 'Chemistry',
    bio: 'Organic reactions, stereochemistry, and laboratory synthesis specialist.',
    status: 'APPROVED',
  },
  {
    id: 10,
    fullName: 'David Wallace',
    email: 'david.wallace@loomlearn.com',
    role: 'MENTOR',
    department: 'Business & Analytics',
    bio: 'Quantitative decision analysis and operations management. New applicant.',
    status: 'PENDING',
  },
  {
    id: 11,
    fullName: 'Lisa Ray',
    email: 'lisa.ray@loomlearn.com',
    role: 'MENTOR',
    department: 'Biology',
    bio: 'Cell biology and genetics. Account under temporary administrative block.',
    status: 'BLOCKED',
  },
  {
    id: 12,
    fullName: 'James Wilson',
    email: 'james.wilson@loomlearn.com',
    role: 'MENTOR',
    department: 'Data Science',
    bio: 'Machine learning fundamentals and data visualization. Application rejected due to missing credentials.',
    status: 'REJECTED',
  },
]

const defaultSubjects = [
  {
    id: 1,
    name: 'Computer Science',
    level: 'Intermediate',
    description: 'Algorithmic problem solving, foundational data structures, software architecture, and systems engineering.',
  },
  {
    id: 2,
    name: 'Mathematics',
    level: 'Advanced',
    description: 'Linear algebra, differential equations, discrete structures, and multivariate calculus.',
  },
  {
    id: 3,
    name: 'Physics',
    level: 'Beginner',
    description: 'Classical mechanics, electrodynamics, thermodynamics, and foundations of quantum physics.',
  },
  {
    id: 4,
    name: 'Chemistry',
    level: 'Intermediate',
    description: 'Organic reaction mechanisms, molecular orbital theory, and physical chemical thermodynamics.',
  },
  {
    id: 5,
    name: 'Gen AI & Machine Learning',
    level: 'Advanced',
    description: 'Deep neural networks, transformer architectures, reinforcement learning, and generative modeling.',
  },
]

const defaultSessions = [
  {
    id: 1,
    title: 'Gen AI & Deep Neural Architectures',
    description: 'Deep dive into transformer attention mechanisms, encoder-decoder networks, and fine-tuning pipelines.',
    startTime: '2026-09-10T14:00',
    endTime: '2026-09-10T16:00',
    maxCapacity: 15,
    currentEnrollment: 6,
    status: 'SCHEDULED',
    mentor: { id: 2, fullName: 'Bob Mentor', department: 'Computer Science', email: 'mentor@loomlearn.com' },
    subject: { id: 5, name: 'Gen AI & Machine Learning' },
  },
  {
    id: 2,
    title: 'Advanced Data Structures & Algorithms',
    description: 'Interactive session exploring dynamic programming memoization, minimum spanning trees, and graph search.',
    startTime: '2026-09-08T10:00',
    endTime: '2026-09-08T12:00',
    maxCapacity: 12,
    currentEnrollment: 5,
    status: 'ACTIVE',
    mentor: { id: 5, fullName: 'Dr. Robert Chen', department: 'Computer Science', email: 'robert.chen@loomlearn.com' },
    subject: { id: 1, name: 'Computer Science' },
  },
  {
    id: 3,
    title: 'Linear Algebra & Eigenvalue Factorizations',
    description: 'Comprehensive analysis of eigenvectors, singular value decomposition (SVD), and matrix transformations.',
    startTime: '2026-09-05T15:00',
    endTime: '2026-09-05T17:00',
    maxCapacity: 10,
    currentEnrollment: 8,
    status: 'COMPLETED',
    mentor: { id: 6, fullName: 'Prof. Alex Rivera', department: 'Mathematics', email: 'alex.rivera@loomlearn.com' },
    subject: { id: 2, name: 'Mathematics' },
  },
  {
    id: 4,
    title: 'Quantum Mechanics: Wave Equations',
    description: 'Solving the time-independent Schrodinger wave equation for finite and infinite potential wells.',
    startTime: '2026-09-06T11:00',
    endTime: '2026-09-06T13:00',
    maxCapacity: 8,
    currentEnrollment: 6,
    status: 'COMPLETED',
    mentor: { id: 8, fullName: 'Elena Rostova', department: 'Physics', email: 'elena.rostova@loomlearn.com' },
    subject: { id: 3, name: 'Physics' },
  },
  {
    id: 5,
    title: 'Organic Reaction Mechanisms & Synthesis',
    description: 'Detailed pathways for electrophilic aromatic substitution, nucleophilic addition, and reaction stereochemistry.',
    startTime: '2026-09-12T09:30',
    endTime: '2026-09-12T11:30',
    maxCapacity: 10,
    currentEnrollment: 2,
    status: 'SCHEDULED',
    mentor: { id: 9, fullName: 'Marcus Vance', department: 'Chemistry', email: 'marcus.vance@loomlearn.com' },
    subject: { id: 4, name: 'Chemistry' },
  },
]

const defaultEnrollments = [
  {
    id: 1,
    learnerId: 3,
    sessionId: 3,
    sessionTitle: 'Linear Algebra & Eigenvalue Factorizations',
    mentorName: 'Prof. Alex Rivera',
    mentorEmail: 'alex.rivera@loomlearn.com',
    subjectName: 'Mathematics',
    sessionStartTime: '2026-09-05T15:00',
    sessionEndTime: '2026-09-05T17:00',
    enrollmentDate: '2026-09-04T12:00',
    status: 'COMPLETED',
    feedbackSubmitted: false,
  },
  {
    id: 2,
    learnerId: 3,
    sessionId: 4,
    sessionTitle: 'Quantum Mechanics: Wave Equations',
    mentorName: 'Elena Rostova',
    mentorEmail: 'elena.rostova@loomlearn.com',
    subjectName: 'Physics',
    sessionStartTime: '2026-09-06T11:00',
    sessionEndTime: '2026-09-06T13:00',
    enrollmentDate: '2026-09-04T14:30',
    status: 'COMPLETED',
    feedbackSubmitted: true,
  },
  {
    id: 3,
    learnerId: 3,
    sessionId: 1,
    sessionTitle: 'Gen AI & Deep Neural Architectures',
    mentorName: 'Bob Mentor',
    mentorEmail: 'mentor@loomlearn.com',
    subjectName: 'Gen AI & Machine Learning',
    sessionStartTime: '2026-09-10T14:00',
    sessionEndTime: '2026-09-10T16:00',
    enrollmentDate: '2026-09-06T09:00',
    status: 'ENROLLED',
    feedbackSubmitted: false,
  },
  {
    id: 4,
    learnerId: 3,
    sessionId: 2,
    sessionTitle: 'Advanced Data Structures & Algorithms',
    mentorName: 'Dr. Robert Chen',
    mentorEmail: 'robert.chen@loomlearn.com',
    subjectName: 'Computer Science',
    sessionStartTime: '2026-09-08T10:00',
    sessionEndTime: '2026-09-08T12:00',
    enrollmentDate: '2026-09-06T10:15',
    status: 'ENROLLED',
    feedbackSubmitted: false,
  },
]

const defaultFeedbacks = [
  {
    id: 1,
    rating: 5,
    comment: 'Exceptional session! Dr. Chen broke down dynamic programming and tree traversals with remarkable clarity.',
    sessionTitle: 'Advanced Data Structures & Algorithms',
    sessionId: 2,
    learnerName: 'John Learner',
    learnerEmail: 'learner@loomlearn.com',
    mentorName: 'Dr. Robert Chen',
    mentorEmail: 'robert.chen@loomlearn.com',
    mentorId: 5,
    date: '2 days ago',
  },
  {
    id: 2,
    rating: 4,
    comment: 'Very helpful session, but we needed more time to thoroughly analyze the transformer multi-head attention derivation.',
    sessionTitle: 'Gen AI & Deep Neural Architectures',
    sessionId: 1,
    learnerName: 'John Learner',
    learnerEmail: 'learner@loomlearn.com',
    mentorName: 'Bob Mentor',
    mentorEmail: 'mentor@loomlearn.com',
    mentorId: 2,
    date: 'Yesterday',
  },
  {
    id: 3,
    rating: 5,
    comment: 'Prof. Alex Rivera made matrix factorizations and spectral decomposition feel completely intuitive and relevant to ML.',
    sessionTitle: 'Linear Algebra & Eigenvalue Factorizations',
    sessionId: 3,
    learnerName: 'Jane Smith',
    learnerEmail: 'jane.smith@loomlearn.com',
    mentorName: 'Prof. Alex Rivera',
    mentorEmail: 'alex.rivera@loomlearn.com',
    mentorId: 6,
    date: '3 days ago',
  },
  {
    id: 4,
    rating: 5,
    comment: 'Elena is a brilliant physics mentor. The wave equation step-by-step resolution was crystal clear.',
    sessionTitle: 'Quantum Mechanics: Wave Equations',
    sessionId: 4,
    learnerName: 'John Learner',
    learnerEmail: 'learner@loomlearn.com',
    mentorName: 'Elena Rostova',
    mentorEmail: 'elena.rostova@loomlearn.com',
    mentorId: 8,
    date: '1 day ago',
  },
]

const defaultActivities = [
  {
    id: 1,
    type: 'SESSION',
    title: 'Session Started: Advanced Data Structures & Algorithms',
    detail: 'Mentor: Dr. Robert Chen | Subject: Computer Science | Capacity: 5/12',
    time: '10:00 AM',
    badge: 'ACTIVE',
    badgeClass: 'badge-active',
  },
  {
    id: 2,
    type: 'ENROLLMENT',
    title: 'New Learner Enrolled',
    detail: 'John Learner enrolled in Gen AI & Deep Neural Architectures',
    time: '09:00 AM',
    badge: 'ENROLLED',
    badgeClass: 'badge-scheduled',
  },
  {
    id: 3,
    type: 'FEEDBACK',
    title: 'Feedback Submitted',
    detail: 'John Learner rated Elena Rostova 5/5 stars for Quantum Physics',
    time: 'Yesterday',
    badge: '5 STARS',
    badgeClass: 'badge-approved',
  },
  {
    id: 4,
    type: 'MENTOR',
    title: 'Mentor Application Received',
    detail: 'Dr. Alan Smith applied for faculty verification in Computer Science',
    time: '2 days ago',
    badge: 'PENDING',
    badgeClass: 'badge-pending',
  },
  {
    id: 5,
    type: 'SESSION',
    title: 'Session Completed: Linear Algebra',
    detail: 'Prof. Alex Rivera completed session with 8 attended learners',
    time: '3 days ago',
    badge: 'COMPLETED',
    badgeClass: 'badge-approved',
  },
]

class MockDataStore {
  constructor() {
    this.state = this.loadState()
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.users && parsed.sessions && parsed.subjects && parsed.enrollments && parsed.feedbacks) {
          return parsed
        }
      }
    } catch (e) {
      console.warn('Failed to parse mock store from storage, initializing fresh defaults', e)
    }

    const initial = {
      users: defaultUsers,
      subjects: defaultSubjects,
      sessions: defaultSessions,
      enrollments: defaultEnrollments,
      feedbacks: defaultFeedbacks,
      activities: defaultActivities,
    }
    this.saveState(initial)
    return initial
  }

  saveState(stateToSave = this.state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
    } catch (e) {
      console.warn('Unable to persist mock state to localStorage', e)
    }
  }

  syncFromStorage() {
    try {
      if (typeof localStorage === 'undefined') return
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed === 'object') {
          this.state = {
            users: Array.isArray(parsed.users) ? parsed.users : this.state.users,
            subjects: Array.isArray(parsed.subjects) ? parsed.subjects : this.state.subjects,
            sessions: Array.isArray(parsed.sessions) ? parsed.sessions : this.state.sessions,
            enrollments: Array.isArray(parsed.enrollments) ? parsed.enrollments : this.state.enrollments,
            feedbacks: Array.isArray(parsed.feedbacks) ? parsed.feedbacks : this.state.feedbacks,
            activities: Array.isArray(parsed.activities) ? parsed.activities : this.state.activities,
          }
        }
      }
    } catch (e) {
      console.warn('Unable to sync mock state from storage', e)
    }
  }

  // USERS / AUTH
  findUserByEmail(email) {
    if (!email) return null
    const normalized = email.trim().toLowerCase()
    return this.state.users.find(
      (u) =>
        u.email.toLowerCase() === normalized ||
        (normalized.includes('admin') && u.role === 'ACADEMIC_ADMIN') ||
        (normalized.includes('mentor') && u.id === 2) ||
        (normalized.includes('learner') && u.id === 3) ||
        (normalized.includes('support') && u.role === 'SUPPORT_AGENT')
    )
  }

  getUser(id) {
    return this.state.users.find((u) => String(u.id) === String(id))
  }

  getMentors() {
    return this.state.users.filter((u) => u.role === 'MENTOR')
  }

  updateMentorStatus(id, status, email) {
    this.syncFromStorage()
    this.state.users = this.state.users.map((u) => {
      const matchId = id && String(u.id) === String(id)
      const matchEmail = email && u.email && u.email.toLowerCase() === String(email).toLowerCase()
      return (matchId || matchEmail) ? { ...u, status } : u
    })
    this.state.activities.unshift({
      id: Date.now(),
      type: 'MENTOR',
      title: `Mentor Status Updated to ${status}`,
      detail: `Mentor #${id || email} status changed to ${status} by Academic Admin`,
      time: 'Just now',
      badge: status,
      badgeClass: status === 'APPROVED' ? 'badge-approved' : status === 'PENDING' ? 'badge-pending' : 'badge-cancelled',
    })
    this.saveState()
    return this.getUser(id) || (email ? this.findUserByEmail(email) : null)
  }

  // ANALYTICS / STATS
  getStats() {
    const totalLearners = this.state.users.filter((u) => u.role === 'LEARNER').length + 7 // base plus demo
    const approvedMentors = this.state.users.filter((u) => u.role === 'MENTOR' && u.status === 'APPROVED').length
    const pendingMentors = this.state.users.filter((u) => u.role === 'MENTOR' && u.status === 'PENDING').length
    const totalMentors = this.state.users.filter((u) => u.role === 'MENTOR').length

    const activeSessions = this.state.sessions.filter((s) => s.status === 'ACTIVE').length
    const scheduledSessions = this.state.sessions.filter((s) => s.status === 'SCHEDULED').length
    const completedSessions = this.state.sessions.filter((s) => s.status === 'COMPLETED').length

    // Subject stats
    const subjectStats = this.state.subjects.map((sub) => {
      const relatedSessions = this.state.sessions.filter((s) => s.subject?.id === sub.id || s.subject?.name === sub.name)
      const count = relatedSessions.reduce((acc, curr) => acc + (curr.currentEnrollment || 0), 0) + 4
      return {
        name: sub.name,
        count: count,
      }
    })

    return {
      totalLearners,
      approvedMentors,
      totalMentors,
      pendingMentors,
      activeSessions,
      scheduledSessions,
      completedSessions,
      subjectStats,
      activities: this.state.activities,
    }
  }

  getMentorStats(mentorId) {
    const mentorFeedbacks = this.state.feedbacks.filter(
      (f) => String(f.mentorId) === String(mentorId) || f.mentorName === this.getUser(mentorId)?.fullName
    )
    const mentorSessions = this.state.sessions.filter((s) => String(s.mentor?.id) === String(mentorId))

    const totalReviews = mentorFeedbacks.length
    const ratingSum = mentorFeedbacks.reduce((acc, f) => acc + Number(f.rating || 0), 0)
    const averageRating = totalReviews > 0 ? ratingSum / totalReviews : 4.8

    return {
      averageRating,
      totalReviews: totalReviews || 3,
      totalSessions: mentorSessions.length || 2,
      scheduledSessions: mentorSessions.filter((s) => s.status === 'SCHEDULED').length,
      activeSessions: mentorSessions.filter((s) => s.status === 'ACTIVE').length,
      completedSessions: mentorSessions.filter((s) => s.status === 'COMPLETED').length,
    }
  }

  // SUBJECTS
  getSubjects() {
    return this.state.subjects
  }

  createSubject(data) {
    const newSubject = {
      id: Date.now(),
      name: data.name,
      level: data.level || 'Beginner',
      description: data.description || '',
    }
    this.state.subjects.push(newSubject)
    this.saveState()
    return newSubject
  }

  updateSubject(id, data) {
    this.state.subjects = this.state.subjects.map((s) =>
      String(s.id) === String(id) ? { ...s, ...data } : s
    )
    this.saveState()
    return this.state.subjects.find((s) => String(s.id) === String(id))
  }

  deleteSubject(id) {
    this.state.subjects = this.state.subjects.filter((s) => String(s.id) !== String(id))
    this.saveState()
    return true
  }

  // SESSIONS
  getSessions(mentorId = null) {
    this.syncFromStorage()
    if (mentorId != null && mentorId !== '' && mentorId !== 'ALL') {
      const targetUser = this.getUser(mentorId)
      return this.state.sessions.filter((s) => {
        const matchId = String(s.mentor?.id) === String(mentorId)
        const matchEmail = targetUser?.email && s.mentor?.email && s.mentor.email.toLowerCase() === targetUser.email.toLowerCase()
        return matchId || matchEmail
      })
    }
    return this.state.sessions
  }

  createSession(data) {
    this.syncFromStorage()
    const subject = this.state.subjects.find((s) => String(s.id) === String(data.subject?.id || data.subjectId)) || {
      id: data.subject?.id || data.subjectId || 1,
      name: data.subject?.name || 'Computer Science',
    }
    const foundMentor = data.mentor?.id ? this.getUser(data.mentor.id) : null
    const mentor = {
      id: data.mentor?.id || foundMentor?.id || 2,
      fullName: data.mentor?.fullName || foundMentor?.fullName || 'Bob Mentor',
      department: data.mentor?.department || foundMentor?.department || 'Computer Science',
      email: data.mentor?.email || foundMentor?.email || 'mentor@loomlearn.com',
    }

    const maxId = this.state.sessions.reduce((max, s) => Math.max(max, Number(s.id) || 0), 0)
    const newSession = {
      id: data.id || Math.max(Date.now(), maxId + 1),
      title: data.title,
      description: data.description || '',
      startTime: data.startTime,
      endTime: data.endTime,
      maxCapacity: Number(data.maxCapacity) || 10,
      currentEnrollment: data.currentEnrollment || 0,
      status: data.status || 'SCHEDULED',
      mentor: {
        id: mentor.id,
        fullName: mentor.fullName,
        department: mentor.department,
        email: mentor.email,
      },
      subject: {
        id: subject.id,
        name: subject.name,
      },
    }

    const existingIdx = this.state.sessions.findIndex((s) => String(s.id) === String(newSession.id))
    if (existingIdx >= 0) {
      this.state.sessions[existingIdx] = { ...this.state.sessions[existingIdx], ...newSession }
    } else {
      this.state.sessions.unshift(newSession)
    }

    this.state.activities.unshift({
      id: Date.now(),
      type: 'SESSION',
      title: `New Session Scheduled: ${newSession.title}`,
      detail: `Mentor: ${mentor.fullName} | Subject: ${subject.name}`,
      time: 'Just now',
      badge: 'SCHEDULED',
      badgeClass: 'badge-scheduled',
    })
    this.saveState()
    return newSession
  }

  updateSession(id, data) {
    this.state.sessions = this.state.sessions.map((s) => {
      if (String(s.id) === String(id)) {
        const subject = data.subject?.id
          ? this.state.subjects.find((sub) => String(sub.id) === String(data.subject.id)) || s.subject
          : s.subject
        return {
          ...s,
          title: data.title !== undefined ? data.title : s.title,
          description: data.description !== undefined ? data.description : s.description,
          startTime: data.startTime !== undefined ? data.startTime : s.startTime,
          endTime: data.endTime !== undefined ? data.endTime : s.endTime,
          maxCapacity: data.maxCapacity !== undefined ? Number(data.maxCapacity) : s.maxCapacity,
          subject,
        }
      }
      return s
    })
    this.saveState()
    return this.state.sessions.find((s) => String(s.id) === String(id))
  }

  updateSessionStatus(sessionId, newStatus) {
    this.state.sessions = this.state.sessions.map((s) =>
      String(s.id) === String(sessionId) ? { ...s, status: newStatus } : s
    )

    // CONSISTENCY REQUIREMENT:
    // When mentor marks session as COMPLETED, also update all corresponding student enrollments to COMPLETED
    if (newStatus === 'COMPLETED') {
      this.state.enrollments = this.state.enrollments.map((e) =>
        String(e.sessionId) === String(sessionId) ? { ...e, status: 'COMPLETED' } : e
      )
    }

    this.state.activities.unshift({
      id: Date.now(),
      type: 'SESSION',
      title: `Session ${sessionId} marked ${newStatus}`,
      detail: `Status updated to ${newStatus}`,
      time: 'Just now',
      badge: newStatus,
      badgeClass: newStatus === 'ACTIVE' ? 'badge-active' : newStatus === 'COMPLETED' ? 'badge-approved' : 'badge-scheduled',
    })

    this.saveState()
    return this.state.sessions.find((s) => String(s.id) === String(sessionId))
  }

  deleteSession(sessionId) {
    this.state.sessions = this.state.sessions.filter((s) => String(s.id) !== String(sessionId))
    this.saveState()
    return true
  }

  // ENROLLMENTS
  getEnrollmentsForLearner(learnerId) {
    this.syncFromStorage()
    return this.state.enrollments.filter((e) => String(e.learnerId) === String(learnerId))
  }

  enrollLearner(learnerId, sessionId) {
    const session = this.state.sessions.find((s) => String(s.id) === String(sessionId))
    if (!session) {
      throw new Error('Session not found')
    }

    // Check if already enrolled
    const existing = this.state.enrollments.find(
      (e) => String(e.learnerId) === String(learnerId) && String(e.sessionId) === String(sessionId)
    )
    if (existing && (existing.status === 'ENROLLED' || existing.status === 'ATTENDED')) {
      throw new Error('Already enrolled in this session')
    }

    // Check capacity
    const current = Number(session.currentEnrollment || 0)
    const max = Number(session.maxCapacity || 10)
    if (current >= max) {
      throw new Error('Session is at maximum capacity')
    }

    // CONSISTENCY REQUIREMENT:
    // Decrement available seats (increment current enrollment count)
    session.currentEnrollment = current + 1

    if (existing) {
      existing.status = session.status === 'COMPLETED' ? 'COMPLETED' : 'ENROLLED'
      existing.enrollmentDate = new Date().toISOString()
      this.saveState()
      return existing
    }

    const learner = this.getUser(learnerId) || { fullName: 'John Learner' }

    const newEnrollment = {
      id: Date.now(),
      learnerId: Number(learnerId),
      sessionId: session.id,
      sessionTitle: session.title,
      mentorName: session.mentor?.fullName || 'Assigned Mentor',
      mentorEmail: session.mentor?.email || 'mentor@loomlearn.com',
      subjectName: session.subject?.name || 'General',
      sessionStartTime: session.startTime,
      sessionEndTime: session.endTime,
      sessionDescription: session.description,
      enrollmentDate: new Date().toISOString(),
      status: session.status === 'COMPLETED' ? 'COMPLETED' : 'ENROLLED',
      feedbackSubmitted: false,
    }

    this.state.enrollments.unshift(newEnrollment)

    this.state.activities.unshift({
      id: Date.now(),
      type: 'ENROLLMENT',
      title: 'Session Enrollment',
      detail: `${learner.fullName} enrolled in ${session.title}`,
      time: 'Just now',
      badge: 'ENROLLED',
      badgeClass: 'badge-scheduled',
    })

    this.saveState()
    return newEnrollment
  }

  cancelEnrollment(learnerId, sessionId) {
    const session = this.state.sessions.find((s) => String(s.id) === String(sessionId))
    if (session && session.currentEnrollment > 0) {
      session.currentEnrollment -= 1
    }

    this.state.enrollments = this.state.enrollments.map((e) => {
      if (String(e.learnerId) === String(learnerId) && String(e.sessionId) === String(sessionId)) {
        return { ...e, status: 'CANCELLED' }
      }
      return e
    })
    this.saveState()
    return true
  }

  // FEEDBACK
  getFeedbacks() {
    return this.state.feedbacks
  }

  submitFeedback(payload) {
    const { learnerId, sessionId, rating, comment } = payload
    const session = this.state.sessions.find((s) => String(s.id) === String(sessionId))
    const learner = this.getUser(learnerId) || { fullName: 'John Learner', email: 'learner@loomlearn.com' }

    const newFeedback = {
      id: Date.now(),
      rating: Number(rating),
      comment: comment || '',
      sessionTitle: session?.title || 'Tutoring Session',
      sessionId: session?.id || sessionId,
      learnerName: learner.fullName,
      learnerEmail: learner.email,
      mentorName: session?.mentor?.fullName || 'Assigned Mentor',
      mentorEmail: session?.mentor?.email || 'mentor@loomlearn.com',
      mentorId: session?.mentor?.id || 2,
      date: 'Just now',
    }

    this.state.feedbacks.unshift(newFeedback)

    // CONSISTENCY REQUIREMENT:
    // Submitting feedback marks the enrollment as reviewed and immediately feeds the Support Agent view
    this.state.enrollments = this.state.enrollments.map((e) => {
      if (String(e.learnerId) === String(learnerId) && String(e.sessionId) === String(sessionId)) {
        return { ...e, feedbackSubmitted: true }
      }
      return e
    })

    this.state.activities.unshift({
      id: Date.now(),
      type: 'FEEDBACK',
      title: 'Mentor Feedback Submitted',
      detail: `${learner.fullName} rated ${newFeedback.mentorName} ${rating}/5 stars: "${comment.slice(0, 45)}..."`,
      time: 'Just now',
      badge: `${rating} STARS`,
      badgeClass: 'badge-approved',
    })

    this.saveState()
    return newFeedback
  }
}

export const mockStore = new MockDataStore()
export default mockStore
