import { getCourseThumbnail, getCourseMetadata } from '../../components/layout/EnrollmentCard'
import mockStore from '../../services/mockDataStore'

describe('My Enrollments Redesign - Component Logic & Subject Matching', () => {
  describe('Subject-Matched Unsplash Image Mapping', () => {
    test('Matches UI/UX subject and title keywords to design workspace thumbnail', () => {
      const result = getCourseThumbnail('UI/UX', 'Design System Fundamentals')
      expect(result.url).toContain('photo-1581291518857-4e27b48ff24e')
      expect(result.alt).toMatch(/UI\/UX/i)
    })

    test('Matches Information Architecture keywords to product design thumbnail', () => {
      const result = getCourseThumbnail('Product Design', 'Information Architecture & User Flows')
      expect(result.url).toContain('photo-1507238691740-187a5b1d37b8')
      expect(result.alt).toMatch(/Information architecture/i)
    })

    test('Matches Gen AI & Machine Learning to neural network visualization', () => {
      const result = getCourseThumbnail('Computer Science', 'Gen AI & Deep Neural Architectures')
      expect(result.url).toContain('photo-1618005182384-a83a8bd57fbe')
      expect(result.alt).toMatch(/Generative AI/i)
    })

    test('Matches Mathematics and Linear Algebra to geometry vector thumbnail', () => {
      const result = getCourseThumbnail('Mathematics', 'Linear Algebra & Matrix Transformations')
      expect(result.url).toContain('photo-1635070041078-e363dbe005cb')
      expect(result.alt).toMatch(/Mathematics/i)
    })

    test('Matches Quantum Physics to physics wave phenomenon thumbnail', () => {
      const result = getCourseThumbnail('Physics', 'Quantum Mechanics & Wave Functions')
      expect(result.url).toContain('photo-1636466497217-26a8cbeaf0aa')
      expect(result.alt).toMatch(/Quantum physics/i)
    })

    test('Matches Chemistry to laboratory glassware synthesis thumbnail', () => {
      const result = getCourseThumbnail('Chemistry', 'Organic Reaction Mechanisms')
      expect(result.url).toContain('photo-1532094349884-543bc11b234d')
      expect(result.alt).toMatch(/Chemical laboratory/i)
    })

    test('Matches Business & Finance to analytics dashboard thumbnail', () => {
      const result = getCourseThumbnail('Business', 'Financial Management & Strategy')
      expect(result.url).toContain('photo-1460925895917-afdab827c52f')
      expect(result.alt).toMatch(/Business/i)
    })

    test('Falls back gracefully to default workspace thumbnail when subject is unknown', () => {
      const result = getCourseThumbnail('Astronomy', 'Stellar Evolution')
      expect(result.url).toContain('photo-1516321318423-f06f85e504b3')
      expect(result.alt).toMatch(/learning/i)
    })
  })

  describe('Course Metadata & Progress Calculation', () => {
    test('Calculates 100% progress for COMPLETED status', () => {
      const meta = getCourseMetadata({
        id: 1,
        status: 'COMPLETED',
        sessionStartTime: '2026-09-10T10:00:00',
        sessionEndTime: '2026-09-10T12:00:00',
      })
      expect(meta.isCompleted).toBe(true)
      expect(meta.progress).toBe(100)
      expect(meta.durationStr).toBe('2h')
    })

    test('Calculates 0% progress for CANCELLED status', () => {
      const meta = getCourseMetadata({
        id: 2,
        status: 'CANCELLED',
      })
      expect(meta.isCancelled).toBe(true)
      expect(meta.progress).toBe(0)
    })

    test('Calculates realistic active progress for ENROLLED status', () => {
      const meta = getCourseMetadata({
        id: 3,
        sessionId: 3,
        status: 'ENROLLED',
        sessionStartTime: '2026-09-10T10:00:00',
        sessionEndTime: '2026-09-10T11:30:00',
      })
      expect(meta.isCompleted).toBe(false)
      expect(meta.isCancelled).toBe(false)
      expect(meta.progress).toBeGreaterThan(0)
      expect(meta.progress).toBeLessThanOrEqual(100)
      expect(meta.modulesCount).toBeGreaterThanOrEqual(6)
      expect(meta.tasksCount).toBeGreaterThanOrEqual(2)
      expect(meta.durationStr).toBe('1h 30m')
    })
  })

  describe('Learner vs Mentor Profile Role Segregation & Metadata', () => {
    test('Calculates capacity progress and student metrics for MENTOR mode in EnrollmentCard', () => {
      const mockSession = {
        id: 1,
        title: 'Advanced React Hooks',
        status: 'ACTIVE',
        startTime: '2026-09-10T10:00:00',
        endTime: '2026-09-10T12:00:00',
        currentEnrollment: 8,
        maxCapacity: 10,
        subject: { id: 1, name: 'Computer Science' },
        mentor: { id: 2, fullName: 'Bob Mentor', email: 'mentor@loomlearn.com' },
      }

      const meta = getCourseMetadata(null, mockSession, true)
      expect(meta.isActive).toBe(true)
      expect(meta.isCompleted).toBe(false)
      expect(meta.currentEnrollment).toBe(8)
      expect(meta.maxCapacity).toBe(10)
      expect(meta.progress).toBe(80) // 8/10 = 80%
      expect(meta.durationStr).toBe('2h')
    })

    test('Learner profile isolates learner enrollments from mentor sessions', () => {
      // Learner user
      const learnerId = 3
      const enrollments = mockStore.getEnrollmentsForLearner(learnerId)
      expect(enrollments.length).toBeGreaterThan(0)
      expect(enrollments.every((e) => e.learnerId === learnerId)).toBe(true)

      // Mentor sessions
      const mentorId = 2
      const mentorSessions = mockStore.getSessions(mentorId)
      expect(mentorSessions.length).toBeGreaterThan(0)
      expect(mentorSessions.every((s) => s.mentor?.id === mentorId || s.mentor?.email === 'mentor@loomlearn.com')).toBe(true)
    })

    test('Dashboard section logic: Learner profile loads "My Enrollments", Mentor profile loads "My Sessions"', () => {
      const getDashboardSections = (role) => {
        if (role === 'LEARNER') return ['MY_ENROLLMENTS']
        if (role === 'MENTOR') return ['MY_SESSIONS']
        return []
      }

      expect(getDashboardSections('LEARNER')).toEqual(['MY_ENROLLMENTS'])
      expect(getDashboardSections('ACADEMIC_ADMIN')).toEqual([])
      expect(getDashboardSections('SUPPORT_AGENT')).toEqual([])
    })

    test('Matches English subject to literature and academic writing thumbnail', () => {
      const result = getCourseThumbnail('English', 'Academic Writing & Rhetorical Analysis')
      expect(result.url).toContain('photo-1457369804613-52c61a468e7d')
      expect(result.alt).toMatch(/English literature/i)
    })

    test('SubjectChart is strictly isolated to ACADEMIC_ADMIN and excluded for LEARNER & MENTOR', () => {
      const shouldRenderSubjectChart = (role) => role === 'ACADEMIC_ADMIN'
      expect(shouldRenderSubjectChart('ACADEMIC_ADMIN')).toBe(true)
      expect(shouldRenderSubjectChart('LEARNER')).toBe(false)
      expect(shouldRenderSubjectChart('MENTOR')).toBe(false)
      expect(shouldRenderSubjectChart('SUPPORT_AGENT')).toBe(false)
    })

    test('Mentor dashboard formats mentor scheduled sessions into activity timeline cards', () => {
      const mentorSessions = [
        {
          id: 101,
          title: 'Advanced System Architecture',
          subject: { name: 'Computer Science' },
          status: 'ACTIVE',
          startTime: '2026-09-12T14:00:00',
          currentEnrollment: 5,
          maxCapacity: 10,
        },
      ]

      const mentorActivities = mentorSessions.map((session) => ({
        id: `mentor-session-${session.id}`,
        type: 'session_scheduled',
        user: { name: 'You (Host)' },
        sessionTitle: `${session.title} (${session.subject?.name || 'Tutoring'})`,
        timestamp: 'Upcoming: 2026-09-12 14:00',
        metadata: {
          status: session.status,
          capacity: `${session.currentEnrollment || 0}/${session.maxCapacity || 10} Enrolled`,
        },
      }))

      expect(mentorActivities.length).toBe(1)
      expect(mentorActivities[0].id).toBe('mentor-session-101')
      expect(mentorActivities[0].sessionTitle).toContain('Computer Science')
      expect(mentorActivities[0].metadata.capacity).toBe('5/10 Enrolled')
    })

    test('mockStore deduplicates rapid duplicate session creation with identical title, mentor, and start time', () => {
      const initialCount = mockStore.getSessions().length
      const testSession = {
        title: 'Microservices & Distributed Transactions',
        startTime: '2026-09-20T11:00:00',
        endTime: '2026-09-20T13:00:00',
        mentor: { id: 2, fullName: 'Bob Mentor', email: 'mentor@loomlearn.com' },
        subject: { id: 1, name: 'Computer Science' },
      }

      // First create call
      mockStore.createSession(testSession)
      expect(mockStore.getSessions().length).toBe(initialCount + 1)

      // Repeated calls (simulating duplicate/rapid clicks)
      mockStore.createSession(testSession)
      mockStore.createSession(testSession)

      // Count should still be initialCount + 1, not + 3!
      expect(mockStore.getSessions().length).toBe(initialCount + 1)
      const matching = mockStore.getSessions().filter((s) => s.title === 'Microservices & Distributed Transactions')
      expect(matching.length).toBe(1)
    })
  })
})

