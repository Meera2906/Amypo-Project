import mockStore from '../../services/mockDataStore'

describe('Session Isolation and Learner Search/Sort Logic', () => {
  beforeEach(() => {
    // Reset or clear mock store state if necessary
    localStorage.clear()
  })

  test('Mentor session isolation: getSessions(mentorId) returns only sessions for that mentor', () => {
    // Create sessions under two different mentors
    const session1 = mockStore.createSession({
      title: 'Advanced React Hooks',
      description: 'Deep dive into useMemo and custom hooks',
      mentor: { id: 2, fullName: 'Bob Mentor', email: 'mentor@loomlearn.com' },
      subject: { id: 1, name: 'Computer Science' },
      startTime: '2026-09-10T10:00:00',
      endTime: '2026-09-10T11:00:00',
      maxCapacity: 15,
    })

    const session2 = mockStore.createSession({
      title: 'Linear Algebra Review',
      description: 'Eigenvalues and matrix transformations',
      mentor: { id: 99, fullName: 'Alice Math', email: 'alice@loomlearn.com' },
      subject: { id: 2, name: 'Mathematics' },
      startTime: '2026-09-11T14:00:00',
      endTime: '2026-09-11T15:00:00',
      maxCapacity: 20,
    })

    // Mentor Bob (id 2) should only see session1
    const bobSessions = mockStore.getSessions(2)
    expect(bobSessions.some((s) => s.id === session1.id)).toBe(true)
    expect(bobSessions.some((s) => s.id === session2.id)).toBe(false)

    // Mentor Alice (id 99) should only see session2
    const aliceSessions = mockStore.getSessions(99)
    expect(aliceSessions.some((s) => s.id === session2.id)).toBe(true)
    expect(aliceSessions.some((s) => s.id === session1.id)).toBe(false)

    // Learner (null mentorId) should see BOTH sessions
    const learnerSessions = mockStore.getSessions(null)
    expect(learnerSessions.some((s) => s.id === session1.id)).toBe(true)
    expect(learnerSessions.some((s) => s.id === session2.id)).toBe(true)
  })

  test('Learner search: can find session by title, mentor name, or subject', () => {
    const allSessions = mockStore.getSessions()

    // 1. Search by title
    const searchByTitle = (term) =>
      allSessions.filter(
        (s) =>
          (s.title || '').toLowerCase().includes(term.toLowerCase()) ||
          (s.mentor?.fullName || '').toLowerCase().includes(term.toLowerCase()) ||
          (s.subject?.name || '').toLowerCase().includes(term.toLowerCase())
      )

    const reactResults = searchByTitle('React')
    expect(reactResults.length).toBeGreaterThan(0)
    expect(reactResults.every((s) => s.title.includes('React'))).toBe(true)

    // 2. Search by mentor name
    const mentorResults = searchByTitle('Bob')
    expect(mentorResults.length).toBeGreaterThan(0)
    expect(mentorResults.every((s) => s.mentor?.fullName.includes('Bob'))).toBe(true)

    // 3. Search by subject
    const mathResults = searchByTitle('Mathematics')
    expect(mathResults.length).toBeGreaterThan(0)
    expect(mathResults.every((s) => s.subject?.name === 'Mathematics')).toBe(true)
  })

  test('Sorting: sorts correctly by mentor name and subject name', () => {
    const sessions = mockStore.getSessions()

    // Sort by Mentor Name ASC
    const sortedByMentorAsc = [...sessions].sort((a, b) =>
      (a.mentor?.fullName || '').localeCompare(b.mentor?.fullName || '')
    )
    for (let i = 0; i < sortedByMentorAsc.length - 1; i++) {
      expect(
        (sortedByMentorAsc[i].mentor?.fullName || '').localeCompare(
          sortedByMentorAsc[i + 1].mentor?.fullName || ''
        )
      ).toBeLessThanOrEqual(0)
    }

    // Sort by Subject Name ASC
    const sortedBySubjectAsc = [...sessions].sort((a, b) =>
      (a.subject?.name || '').localeCompare(b.subject?.name || '')
    )
    for (let i = 0; i < sortedBySubjectAsc.length - 1; i++) {
      expect(
        (sortedBySubjectAsc[i].subject?.name || '').localeCompare(
          sortedBySubjectAsc[i + 1].subject?.name || ''
        )
      ).toBeLessThanOrEqual(0)
    }

    // Sort by Available Capacity DESC
    const sortedByCapacityDesc = [...sessions].sort((a, b) => {
      const availA = (a.maxCapacity || 10) - (a.currentEnrollment || 0)
      const availB = (b.maxCapacity || 10) - (b.currentEnrollment || 0)
      return availB - availA
    })
    for (let i = 0; i < sortedByCapacityDesc.length - 1; i++) {
      const availA = (sortedByCapacityDesc[i].maxCapacity || 10) - (sortedByCapacityDesc[i].currentEnrollment || 0)
      const availB = (sortedByCapacityDesc[i + 1].maxCapacity || 10) - (sortedByCapacityDesc[i + 1].currentEnrollment || 0)
      expect(availA).toBeGreaterThanOrEqual(availB)
    }
  })

  test('Local storage persistence: newly created mentor session loads into learner profile after sync', () => {
    // 1. Mentor creates session
    const createdSession = mockStore.createSession({
      title: 'Distributed System Consensus Algorithms',
      description: 'Paxos and Raft step-by-step',
      mentor: { id: 2, fullName: 'Bob Mentor', email: 'mentor@loomlearn.com' },
      subject: { id: 1, name: 'Computer Science' },
      startTime: '2026-09-15T16:00:00',
      endTime: '2026-09-15T17:30:00',
      maxCapacity: 25,
    })

    // 2. Query as learner (no mentorId filter)
    const learnerSessions = mockStore.getSessions()
    const found = learnerSessions.find((s) => s.id === createdSession.id)
    expect(found).toBeDefined()
    expect(found.title).toBe('Distributed System Consensus Algorithms')
    expect(found.mentor.fullName).toBe('Bob Mentor')
  })

  test('Cancellation lifecycle: cancelling enrollment updates status to CANCELLED and decrements capacity', () => {
    // 1. Create a session
    const session = mockStore.createSession({
      title: 'Operating Systems & Concurrency',
      description: 'Threads, mutexes, and deadlocks',
      mentor: { id: 2, fullName: 'Bob Mentor', email: 'mentor@loomlearn.com' },
      subject: { id: 1, name: 'Computer Science' },
      startTime: '2026-09-20T10:00:00',
      endTime: '2026-09-20T11:00:00',
      maxCapacity: 10,
    })

    const initialCapacity = session.currentEnrollment || 0

    // 2. Enroll learner
    const enrollment = mockStore.enrollLearner(101, session.id)
    expect(enrollment.status).toBe('ENROLLED')
    expect(session.currentEnrollment).toBe(initialCapacity + 1)

    // 3. Cancel enrollment
    mockStore.cancelEnrollment(101, session.id)
    expect(session.currentEnrollment).toBe(initialCapacity)

    // Check learner's enrollments
    const enrollments = mockStore.getEnrollmentsForLearner(101)
    const cancelledRecord = enrollments.find((e) => e.sessionId === session.id)
    expect(cancelledRecord).toBeDefined()
    expect(cancelledRecord.status).toBe('CANCELLED')

    // Active enrollments filter should NOT include cancelledRecord
    const activeEnrollments = enrollments.filter(
      (e) => (e.status || '').toUpperCase() === 'ENROLLED' || (e.status || '').toUpperCase() === 'ATTENDED'
    )
    expect(activeEnrollments.some((e) => e.sessionId === session.id)).toBe(false)

    // 4. Re-enrolling after cancellation should succeed
    const reEnrollment = mockStore.enrollLearner(101, session.id)
    expect(reEnrollment.status).toBe('ENROLLED')
    const updatedSession = mockStore.getSessions().find((s) => s.id === session.id)
    expect(updatedSession.currentEnrollment).toBe(initialCapacity + 1)
  })

  test('Finish session updates enrollment status to COMPLETED and allows learner to submit feedback', () => {
    // 1. Create session
    const session = mockStore.createSession({
      title: 'Deep Learning & PyTorch',
      description: 'Neural networks and backpropagation',
      mentor: { id: 2, fullName: 'Bob Mentor', email: 'mentor@loomlearn.com' },
      subject: { id: 1, name: 'Computer Science' },
      startTime: '2026-09-18T10:00:00',
      endTime: '2026-09-18T12:00:00',
      maxCapacity: 10,
    })

    // 2. Learner enrolls
    const enrollment = mockStore.enrollLearner(202, session.id)
    expect(enrollment.status).toBe('ENROLLED')
    expect(enrollment.feedbackSubmitted).toBe(false)

    // 3. Mentor finishes session
    mockStore.updateSessionStatus(session.id, 'COMPLETED')

    // 4. Check enrollment status in learner profile
    const learnerEnrollments = mockStore.getEnrollmentsForLearner(202)
    const finishedEnrollment = learnerEnrollments.find((e) => e.sessionId === session.id)
    expect(finishedEnrollment).toBeDefined()
    expect(finishedEnrollment.status).toBe('COMPLETED')
    expect(finishedEnrollment.feedbackSubmitted).toBe(false)

    // 5. Learner submits feedback
    const feedback = mockStore.submitFeedback({
      learnerId: 202,
      sessionId: session.id,
      rating: 5,
      comment: 'Super clear explanations of backpropagation!',
    })
    expect(feedback.rating).toBe(5)
    expect(feedback.comment).toBe('Super clear explanations of backpropagation!')

    // 6. Verify enrollment feedbackSubmitted is now true
    const updatedEnrollments = mockStore.getEnrollmentsForLearner(202)
    const reviewedEnrollment = updatedEnrollments.find((e) => e.sessionId === session.id)
    expect(reviewedEnrollment.feedbackSubmitted).toBe(true)
  })
})

