import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import Modal from '../components/layout/Modal'
import CapacityBar from '../components/layout/CapacityBar'
import { createSession as createSessionThunk } from '../store/sessionSlice'
import * as sessionService from '../services/sessionService'
import * as subjectService from '../services/subjectService'
import * as enrollmentService from '../services/enrollmentService'
import { submitFeedback } from '../services/feedbackService'
import mockStore from '../services/mockDataStore'
import { getSubjectThumbnail } from '../utils/subjectImages'

const statusColors = {
  SCHEDULED: 'badge-scheduled',
  ACTIVE: 'badge-active',
  COMPLETED: 'badge-approved',
  CANCELLED: 'badge-cancelled',
}

function SessionList() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const [searchParams, setSearchParams] = useSearchParams()
  const [sessions, setSessions] = useState([])
  const [fetchedSubjects, setFetchedSubjects] = useState([])
  const [enrolledSessionIds, setEnrolledSessionIds] = useState(new Set())
  const [feedbackSubmittedIds, setFeedbackSubmittedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('DATE_ASC')
  const [selectedSubject, setSelectedSubject] = useState('ALL')

  // Mentor dedicated tab state: 'MY_SESSIONS' vs 'ALL_SESSIONS'
  const isMentor = user?.role === 'MENTOR'
  const isLearner = !user || user.role === 'LEARNER'

  const tabQuery = searchParams.get('tab')
  const [mentorTab, setMentorTab] = useState(
    tabQuery === 'all' ? 'ALL_SESSIONS' : 'MY_SESSIONS'
  )

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'all') {
      setMentorTab('ALL_SESSIONS')
    } else if (tabParam === 'my' || tabParam === 'my-sessions') {
      setMentorTab('MY_SESSIONS')
    }
  }, [searchParams])

  // Feedback Modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackSession, setFeedbackSession] = useState(null)
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    startTime: '2026-09-15T10:00',
    endTime: '2026-09-15T12:00',
    maxCapacity: 10,
    subject: { id: 1 },
  })

  // Detail Modal
  const [selectedSession, setSelectedSession] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Edit Modal
  const [editingSession, setEditingSession] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    maxCapacity: 10,
    subjectId: 1,
  })

  const [actionLoading, setActionLoading] = useState(false)

  const learnerId = useMemo(() => {
    if (user?.id) return user.id
    try {
      const stored = JSON.parse(localStorage.getItem('loom_user'))
      return stored?.id || 3
    } catch (e) {
      return 3
    }
  }, [user])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await sessionService.getAll(0, 200)
      const data = response?.content !== undefined
        ? response.content
        : (response?.data?.content !== undefined
          ? response.data.content
          : (Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : mockStore.getSessions())))
      setSessions(Array.isArray(data) && data.length > 0 ? data : mockStore.getSessions())
    } catch (err) {
      setSessions(mockStore.getSessions())
    } finally {
      setLoading(false)
    }
  }

  const loadAllData = async () => {
    try {
      setLoading(true)
      const [sessionsRes, subjectsRes, enrollmentsRes] = await Promise.all([
        sessionService.getAll(0, 200).catch(() => mockStore.getSessions()),
        subjectService.getAll().catch(() => mockStore.getSubjects()),
        (!user || user.role === 'LEARNER')
          ? enrollmentService.getMyEnrollments(learnerId).catch(() => mockStore.getEnrollmentsForLearner(learnerId))
          : Promise.resolve([]),
      ])

      const sData = sessionsRes?.content !== undefined
        ? sessionsRes.content
        : (sessionsRes?.data?.content !== undefined
          ? sessionsRes.data.content
          : (Array.isArray(sessionsRes?.data) ? sessionsRes.data : (Array.isArray(sessionsRes) ? sessionsRes : mockStore.getSessions())))
      setSessions(Array.isArray(sData) && sData.length > 0 ? sData : mockStore.getSessions())

      const subData = subjectsRes?.content !== undefined
        ? subjectsRes.content
        : (subjectsRes?.data !== undefined ? subjectsRes.data : (Array.isArray(subjectsRes) ? subjectsRes : mockStore.getSubjects()))
      if (Array.isArray(subData) && subData.length > 0) {
        setFetchedSubjects(subData)
        setCreateForm((prev) => ({ ...prev, subject: { id: subData[0].id } }))
      }

      if (!user || user.role === 'LEARNER') {
        const enrollList = Array.isArray(enrollmentsRes) ? enrollmentsRes : (enrollmentsRes?.data || mockStore.getEnrollmentsForLearner(learnerId))
        const activeList = Array.isArray(enrollList) ? enrollList.filter((e) => {
          const s = (e.status || '').toUpperCase()
          const sessStatus = (e.sessionStatus || e.session?.status || '').toUpperCase()
          return s === 'ENROLLED' || s === 'ATTENDED' || s === 'COMPLETED' || sessStatus === 'COMPLETED'
        }) : []
        setEnrolledSessionIds(new Set(activeList.map((e) => Number(e.sessionId || e.session?.id))))
        setFeedbackSubmittedIds(
          new Set(
            (Array.isArray(enrollList) ? enrollList : [])
              .filter((e) => e.feedbackSubmitted)
              .map((e) => Number(e.sessionId || e.session?.id))
          )
        )
      }
    } catch (err) {
      setSessions(mockStore.getSessions())
      setFetchedSubjects(mockStore.getSubjects())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [learnerId, user?.id, user?.role])

  const defaultSubjects = useMemo(() => [
    { id: 1, name: 'Computer Science' },
    { id: 2, name: 'Mathematics' },
    { id: 3, name: 'Physics' },
    { id: 4, name: 'Chemistry' },
    { id: 5, name: 'Gen AI & Machine Learning' },
  ], [])

  const subjectOptions = fetchedSubjects.length > 0 ? fetchedSubjects : defaultSubjects

  // Create Session
  const handleCreate = async (event) => {
    if (event && event.preventDefault) event.preventDefault()
    if (actionLoading) return
    const title = (createForm.title || '').trim()
    if (!title) {
      setMessage({ type: 'error', text: 'Title is required' })
      return
    }

    try {
      setActionLoading(true)
      const mentorId = user?.id || 2
      const mentorFullName = user?.fullName || 'Bob Mentor'
      const mentorEmail = user?.email || 'mentor@loomlearn.com'
      const mentorDepartment = user?.department || 'Computer Science'

      const chosenSubId = Number(createForm.subject?.id || subjectOptions[0]?.id || 1)
      const chosenSub = subjectOptions.find((s) => Number(s.id) === chosenSubId) || { id: chosenSubId, name: 'Computer Science' }

      const sessionData = {
        title,
        description: createForm.description || '',
        startTime: createForm.startTime || '2026-09-15T10:00',
        endTime: createForm.endTime || '2026-09-15T12:00',
        maxCapacity: Number(createForm.maxCapacity) || 10,
        mentor: {
          id: mentorId,
          fullName: mentorFullName,
          email: mentorEmail,
          department: mentorDepartment,
        },
        subject: {
          id: chosenSub.id,
          name: chosenSub.name,
        },
      }

      // Single authoritative create call
      await sessionService.create(sessionData)

      setShowCreateModal(false)
      setMessage({ type: 'success', text: 'Session created successfully.' })
      setCreateForm({
        title: '',
        description: '',
        startTime: '2026-09-15T10:00',
        endTime: '2026-09-15T12:00',
        maxCapacity: 10,
        subject: { id: subjectOptions[0]?.id || 1 },
      })
      await fetchSessions()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Session creation failed' })
    } finally {
      setActionLoading(false)
    }
  }

  // Edit Session
  const handleOpenEdit = (session) => {
    setEditingSession(session)
    setEditForm({
      title: session.title || '',
      description: session.description || '',
      startTime: session.startTime || '',
      endTime: session.endTime || '',
      maxCapacity: session.maxCapacity || 10,
      subjectId: session.subject?.id || subjectOptions[0]?.id || 1,
    })
    setShowDetailModal(false)
    setShowEditModal(true)
  }

  const handleSaveEdit = async (event) => {
    event.preventDefault()
    if (!editingSession?.id) return

    try {
      setActionLoading(true)
      await sessionService.update(editingSession.id, {
        title: editForm.title.trim(),
        description: editForm.description,
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        maxCapacity: Number(editForm.maxCapacity),
        subject: { id: Number(editForm.subjectId) },
      })
      setShowEditModal(false)
      setMessage({ type: 'success', text: `Session "${editForm.title}" updated successfully.` })
      await fetchSessions()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Unable to update session' })
    } finally {
      setActionLoading(false)
    }
  }

  // Update Status (Start / Finish Session)
  const handleStatusChange = async (sessionId, newStatus) => {
    try {
      setActionLoading(true)
      await sessionService.updateStatus(sessionId, newStatus)
      setMessage({ type: 'success', text: `Session status updated to ${newStatus}.` })
      await fetchSessions()
      if (selectedSession?.id === sessionId) {
        setSelectedSession((prev) => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update session status' })
    } finally {
      setActionLoading(false)
    }
  }

  // Delete / Cancel Session
  const handleDelete = async (sessionId, sessionTitle) => {
    if (!sessionId) return
    if (!window.confirm(`Are you sure you want to cancel session "${sessionTitle}"?`)) return

    try {
      setActionLoading(true)
      await sessionService.cancel(sessionId)
      setMessage({ type: 'success', text: 'Session deleted successfully.' })
      setShowDetailModal(false)
      await fetchSessions()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Unable to cancel session' })
    } finally {
      setActionLoading(false)
    }
  }

  // Learner Enroll Action
  const handleEnroll = async (sessionId, sessionTitle) => {
    try {
      setActionLoading(true)
      await enrollmentService.enroll(learnerId, sessionId)
      setMessage({ type: 'success', text: `Successfully enrolled in "${sessionTitle}"!` })
      setEnrolledSessionIds((prev) => new Set([...prev, Number(sessionId)]))
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, currentEnrollment: (s.currentEnrollment || 0) + 1 } : s))
      )
      if (selectedSession?.id === sessionId) {
        setSelectedSession((prev) => ({ ...prev, currentEnrollment: (prev.currentEnrollment || 0) + 1 }))
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('loom_enrollment_change', { detail: { sessionId, learnerId, action: 'ENROLL' } }))
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Enrollment failed' })
    } finally {
      setActionLoading(false)
    }
  }

  // Learner Cancel Enrollment Action
  const handleCancelEnrollment = async (sessionId, sessionTitle) => {
    if (!sessionId) return
    if (!window.confirm(`Are you sure you want to cancel your enrollment in "${sessionTitle || 'this session'}"?`)) {
      return
    }

    try {
      setActionLoading(true)
      await enrollmentService.cancelEnrollment(learnerId, sessionId)
      setMessage({ type: 'success', text: `Enrollment in "${sessionTitle || 'session'}" cancelled successfully.` })
      setEnrolledSessionIds((prev) => {
        const next = new Set(prev)
        next.delete(Number(sessionId))
        return next
      })
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId && s.currentEnrollment > 0 ? { ...s, currentEnrollment: s.currentEnrollment - 1 } : s))
      )
      if (selectedSession?.id === sessionId && selectedSession.currentEnrollment > 0) {
        setSelectedSession((prev) => ({ ...prev, currentEnrollment: prev.currentEnrollment - 1 }))
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('loom_enrollment_change', { detail: { sessionId, learnerId, action: 'CANCEL' } }))
      }
      await fetchSessions()
      await fetchLearnerEnrollments()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to cancel enrollment.' })
    } finally {
      setActionLoading(false)
    }
  }

  // Learner Submit Feedback Handler
  const handleOpenFeedback = (session) => {
    setFeedbackSession(session)
    setFeedbackRating(5)
    setFeedbackComment('')
    setShowFeedbackModal(true)
  }

  const handleSubmitFeedback = async (event) => {
    event.preventDefault()
    if (!feedbackSession?.id) return

    try {
      setSubmittingFeedback(true)
      await submitFeedback({
        learnerId,
        sessionId: feedbackSession.id,
        rating: Number(feedbackRating),
        comment: feedbackComment.trim(),
      })
      setMessage({ type: 'success', text: `Thank you! Your feedback for "${feedbackSession.title}" has been submitted.` })
      setShowFeedbackModal(false)
      setFeedbackSubmittedIds((prev) => new Set([...prev, Number(feedbackSession.id)]))
      await fetchLearnerEnrollments()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit feedback' })
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const handleOpenDetail = (session) => {
    setSelectedSession(session)
    setShowDetailModal(true)
  }

  const isCurrentUserMentor = (session) => {
    if (!user) return false
    const matchId = session.mentor?.id != null && user.id != null && String(session.mentor.id) === String(user.id)
    const matchEmail = Boolean(
      session.mentor?.email &&
      user.email &&
      session.mentor.email.toLowerCase().trim() === user.email.toLowerCase().trim()
    )
    return matchId || matchEmail
  }

  const canManageSession = (session) => {
    if (user?.role === 'ACADEMIC_ADMIN' || user?.role === 'ADMIN') return true
    if (user?.role === 'MENTOR') {
      return isCurrentUserMentor(session)
    }
    return false
  }

  const filteredSessions = useMemo(() => {
    let list = [...sessions]

    // 1. Role-based Mentor Tab Filter:
    // If logged in as MENTOR and on 'MY_SESSIONS' tab, show only sessions taught by this mentor
    if (isMentor && mentorTab === 'MY_SESSIONS') {
      list = list.filter((s) => isCurrentUserMentor(s))
    }

    // 2. Lifecycle status filter
    if (filterStatus !== 'ALL') {
      list = list.filter((s) => s.status === filterStatus)
    }

    // 3. Subject filter
    if (selectedSubject !== 'ALL') {
      list = list.filter(
        (s) =>
          String(s.subject?.id) === String(selectedSubject) ||
          (s.subject?.name && s.subject.name.toLowerCase() === selectedSubject.toLowerCase())
      )
    }

    // 4. Multi-field search (specific session title, mentor name/email, subject name)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim()
      list = list.filter((s) => {
        const titleMatch = (s.title || '').toLowerCase().includes(term)
        const descMatch = (s.description || '').toLowerCase().includes(term)
        const mentorNameMatch = (s.mentor?.fullName || '').toLowerCase().includes(term)
        const mentorEmailMatch = (s.mentor?.email || '').toLowerCase().includes(term)
        const subjectMatch = (s.subject?.name || '').toLowerCase().includes(term)
        return titleMatch || descMatch || mentorNameMatch || mentorEmailMatch || subjectMatch
      })
    }

    // 5. Sorting
    list.sort((a, b) => {
      if (sortBy === 'MENTOR_ASC') {
        const nameA = a.mentor?.fullName || ''
        const nameB = b.mentor?.fullName || ''
        return nameA.localeCompare(nameB)
      }
      if (sortBy === 'MENTOR_DESC') {
        const nameA = a.mentor?.fullName || ''
        const nameB = b.mentor?.fullName || ''
        return nameB.localeCompare(nameA)
      }
      if (sortBy === 'SUBJECT_ASC') {
        const subA = a.subject?.name || ''
        const subB = b.subject?.name || ''
        return subA.localeCompare(subB)
      }
      if (sortBy === 'SUBJECT_DESC') {
        const subA = a.subject?.name || ''
        const subB = b.subject?.name || ''
        return subB.localeCompare(subA)
      }
      if (sortBy === 'CAPACITY_DESC') {
        const remainingA = (a.maxCapacity || 10) - (a.currentEnrollment || 0)
        const remainingB = (b.maxCapacity || 10) - (b.currentEnrollment || 0)
        return remainingB - remainingA
      }
      if (sortBy === 'DATE_DESC') {
        return new Date(b.startTime || 0) - new Date(a.startTime || 0)
      }
      // Default: DATE_ASC
      return new Date(a.startTime || 0) - new Date(b.startTime || 0)
    })

    return list
  }, [sessions, isMentor, mentorTab, user, filterStatus, selectedSubject, searchTerm, sortBy])

  const mySessionsCount = useMemo(() => {
    return sessions.filter((s) => isCurrentUserMentor(s)).length
  }, [sessions, user])

  const allSessionsCount = useMemo(() => {
    return sessions.length
  }, [sessions])

  const formatDateTime = (dtStr) => {
    if (!dtStr) return 'Not scheduled'
    try {
      const d = new Date(dtStr)
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return dtStr
    }
  }

  const pageTitle = isMentor
    ? (mentorTab === 'MY_SESSIONS' ? 'My Mentoring Sessions' : 'All Tutoring Sessions')
    : 'Tutoring Sessions'
  const pageSubtitle = isMentor
    ? (mentorTab === 'MY_SESSIONS'
        ? `Sessions scheduled and taught by ${user?.fullName || 'you'}. Manage your schedules and classroom capacity.`
        : 'Explore all platform peer tutoring lessons across faculty mentors and subject areas.')
    : 'Explore peer tutoring lessons across faculty mentors, search topics, and enroll in interactive sessions.'

  return (
    <div className="page container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>{pageTitle}</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {pageSubtitle}
          </p>
        </div>

        <button id="add-session-btn" data-testid="add-session-btn" type="button" className="primary-btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Add Session
        </button>
      </div>

      {/* Mentor Specific Primary Tabs: My Sessions vs All Sessions */}
      {isMentor && (
        <div
          className="mentor-session-tabs"
          data-testid="mentor-session-tabs"
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '20px',
            paddingBottom: '4px',
          }}
        >
          <button
            type="button"
            className={`mentor-tab-pill ${mentorTab === 'MY_SESSIONS' ? 'active' : ''}`}
            data-testid="mentor-tab-my-sessions"
            onClick={() => {
              setMentorTab('MY_SESSIONS')
              setSearchParams({ tab: 'my' })
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: mentorTab === 'MY_SESSIONS' ? 'var(--color-royal-blue)' : 'rgba(23, 32, 90, 0.4)',
              color: mentorTab === 'MY_SESSIONS' ? '#fff' : 'var(--text-secondary)',
              border: '1px solid ' + (mentorTab === 'MY_SESSIONS' ? 'var(--color-vivid-blue)' : 'var(--glass-border)'),
              boxShadow: mentorTab === 'MY_SESSIONS' ? '0 4px 16px rgba(66, 96, 229, 0.4)' : 'none',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            <span>My Sessions</span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                background: mentorTab === 'MY_SESSIONS' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
              }}
            >
              {mySessionsCount}
            </span>
          </button>

          <button
            type="button"
            className={`mentor-tab-pill ${mentorTab === 'ALL_SESSIONS' ? 'active' : ''}`}
            data-testid="mentor-tab-all-sessions"
            onClick={() => {
              setMentorTab('ALL_SESSIONS')
              setSearchParams({ tab: 'all' })
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: mentorTab === 'ALL_SESSIONS' ? 'var(--color-royal-blue)' : 'rgba(23, 32, 90, 0.4)',
              color: mentorTab === 'ALL_SESSIONS' ? '#fff' : 'var(--text-secondary)',
              border: '1px solid ' + (mentorTab === 'ALL_SESSIONS' ? 'var(--color-vivid-blue)' : 'var(--glass-border)'),
              boxShadow: mentorTab === 'ALL_SESSIONS' ? '0 4px 16px rgba(66, 96, 229, 0.4)' : 'none',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>All Sessions</span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                background: mentorTab === 'ALL_SESSIONS' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
              }}
            >
              {allSessionsCount}
            </span>
          </button>
        </div>
      )}

      {message.text && (
        <div className={message.type === 'error' ? 'error-box' : 'message-box'} style={{ margin: '16px 0' }}>
          {message.text}
        </div>
      )}

      {/* Search and Sort Toolbar */}
      <div
        className="search-filter-toolbar"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          marginBottom: '20px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '240px' }}>
          <input
            id="session-search-input"
            data-testid="session-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by session title, mentor, or subject..."
            style={{
              width: '100%',
              padding: '10px 36px 10px 38px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)',
              pointerEvents: 'none',
            }}
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '2px 6px',
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdowns for Subject & Sorting */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label htmlFor="session-subject-filter" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              Subject:
            </label>
            <select
              id="session-subject-filter"
              data-testid="session-subject-filter"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(16, 20, 36, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Subjects</option>
              {subjectOptions.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  Subject: {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label htmlFor="session-sort-select" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              Sort:
            </label>
            <select
              id="session-sort-select"
              data-testid="session-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(16, 20, 36, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <option value="DATE_ASC">Date: Earliest First</option>
              <option value="DATE_DESC">Date: Latest First</option>
              <option value="MENTOR_ASC">Mentor: A → Z</option>
              <option value="MENTOR_DESC">Mentor: Z → A</option>
              <option value="SUBJECT_ASC">Subject: A → Z</option>
              <option value="SUBJECT_DESC">Subject: Z → A</option>
              <option value="CAPACITY_DESC">Seats: Most Available</option>
            </select>
          </div>

          {(searchTerm || selectedSubject !== 'ALL' || sortBy !== 'DATE_ASC' || filterStatus !== 'ALL') && (
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setSearchTerm('')
                setSelectedSubject('ALL')
                setSortBy('DATE_ASC')
                setFilterStatus('ALL')
              }}
              style={{ padding: '7px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs and Result Count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['ALL', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              type="button"
              className={`timeline-filter-btn ${filterStatus === st ? 'active' : ''}`}
              onClick={() => setFilterStatus(st)}
              style={{
                background: filterStatus === st ? 'var(--color-royal-blue)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid ' + (filterStatus === st ? 'var(--color-vivid-blue)' : 'var(--glass-border)'),
                color: filterStatus === st ? '#fff' : 'var(--text-secondary)',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {st === 'ALL' ? 'All Sessions' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Showing <strong style={{ color: '#fff' }}>{filteredSessions.length}</strong> session{filteredSessions.length === 1 ? '' : 's'}
          {isMentor && mentorTab === 'MY_SESSIONS' && ' (Assigned to you)'}
        </div>
      </div>

      {loading ? <div className="loader" data-testid="loader">Loading...</div> : null}

      {!loading && filteredSessions.length === 0 && (
        <div className="empty-state" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px dashed var(--glass-border)', margin: '20px 0' }}>
          {isMentor && sessions.length === 0 ? (
            <>
              <h3 style={{ color: '#fff', margin: '0 0 8px' }}>No Sessions Scheduled Yet</h3>
              <p style={{ margin: '0 0 16px', fontSize: '0.9rem' }}>
                You haven't scheduled any tutoring sessions yet. Click below to create your first session.
              </p>
              <button type="button" className="primary-btn" onClick={() => setShowCreateModal(true)}>
                + Schedule Your First Session
              </button>
            </>
          ) : searchTerm || selectedSubject !== 'ALL' || filterStatus !== 'ALL' ? (
            <>
              <h3 style={{ color: '#fff', margin: '0 0 8px' }}>No Matching Sessions Found</h3>
              <p style={{ margin: '0 0 16px', fontSize: '0.9rem' }}>
                No sessions match your search keyword or selected filters.
              </p>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedSubject('ALL')
                  setFilterStatus('ALL')
                }}
              >
                Clear Filters
              </button>
            </>
          ) : (
            'No sessions available in this category.'
          )}
        </div>
      )}

      <div className="session-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '22px' }}>
        {filteredSessions.map((session) => {
          const isManaged = canManageSession(session)
          const isScheduled = session.status === 'SCHEDULED'
          const isActive = session.status === 'ACTIVE'
          const isCompleted = session.status === 'COMPLETED'
          const isEnrolled = enrolledSessionIds.has(Number(session.id))
          const isFull = (session.currentEnrollment || 0) >= (session.maxCapacity || 10)
          const thumb = getSubjectThumbnail(session.subject?.name, session.title)

          return (
            <div
              key={session.id}
              className="session-card"
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '16px',
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onClick={() => handleOpenDetail(session)}
            >
              {/* Subject Thumbnail Image Banner */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '140px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: '#101424',
                }}
              >
                <img
                  src={thumb.url}
                  alt={thumb.alt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12, 15, 29, 0.85) 0%, transparent 60%)' }} />
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className={`badge ${statusColors[session.status] || 'badge-scheduled'}`} style={{ fontSize: '0.7rem', padding: '2px 8px', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                    {session.status}
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--color-light-blue)',
                      background: 'rgba(12, 15, 29, 0.8)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(66, 96, 229, 0.4)',
                      backdropFilter: 'blur(4px)',
                      fontWeight: 600,
                    }}
                  >
                    {session.subject?.name || 'General'}
                  </span>
                </div>
              </div>

              <h3 style={{ margin: 0, fontSize: '1.18rem', color: 'var(--color-soft-white)' }}>
                {session.title}
              </h3>

              <p
                style={{
                  margin: 0,
                  color: 'var(--text-secondary)',
                  fontSize: '0.88rem',
                  lineHeight: '1.5',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {session.description || 'No detailed syllabus specified.'}
              </p>

              {/* Mentor and Timings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--color-soft-white)', marginTop: '4px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Mentor: </span>
                  <strong>{session.mentor?.fullName || 'Assigned Faculty'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Start: </span>
                  <span>{formatDateTime(session.startTime)}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>End: </span>
                  <span>{formatDateTime(session.endTime)}</span>
                </div>
              </div>

              {/* Capacity indicator with visual progress bar */}
              <div style={{ marginTop: 'auto', paddingTop: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span>Enrollment</span>
                  <strong>[{session.currentEnrollment || 0} / {session.maxCapacity || 10} seats]</strong>
                </div>
                <CapacityBar current={session.currentEnrollment || 0} max={session.maxCapacity || 10} />
              </div>

              {/* Lifecycle Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  marginTop: '8px',
                  borderTop: '1px solid var(--glass-border)',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-light-blue)',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                  }}
                  onClick={() => handleOpenDetail(session)}
                >
                  View Details &rarr;
                </button>

                {/* Mentor / Admin Lifecycle Actions */}
                {isManaged && (
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {isScheduled && (
                      <button
                        type="button"
                        className="action-btn"
                        style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7', borderColor: 'rgba(16, 185, 129, 0.5)', padding: '4px 10px', fontSize: '0.78rem' }}
                        onClick={() => handleStatusChange(session.id, 'ACTIVE')}
                        disabled={actionLoading}
                        title="Start this session now"
                      >
                        Start Session
                      </button>
                    )}

                    {isActive && (
                      <button
                        type="button"
                        className="action-btn"
                        style={{ background: 'rgba(168, 85, 247, 0.25)', color: '#d8b4fe', borderColor: 'rgba(168, 85, 247, 0.5)', padding: '4px 10px', fontSize: '0.78rem' }}
                        onClick={() => handleStatusChange(session.id, 'COMPLETED')}
                        disabled={actionLoading}
                        title="Finish and complete this session"
                      >
                        Finish Session
                      </button>
                    )}

                    <button
                      type="button"
                      className="action-btn"
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      onClick={() => handleOpenEdit(session)}
                      disabled={actionLoading}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="action-btn delete"
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      onClick={() => handleDelete(session.id, session.title)}
                      disabled={actionLoading}
                    >
                      Delete
                    </button>
                  </div>
                )}

                {/* Learner Enrollment Action */}
                {isLearner && !isManaged && (
                  <div>
                    {isCompleted ? (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Completed</span>
                        {isEnrolled && (
                          feedbackSubmittedIds.has(Number(session.id)) ? (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: '#34d399',
                                background: 'rgba(16, 185, 129, 0.15)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                padding: '3px 8px',
                                borderRadius: '6px',
                              }}
                            >
                              Feedback Submitted
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="primary-btn"
                              style={{
                                background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                                border: 'none',
                                padding: '4px 10px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)',
                              }}
                              onClick={() => handleOpenFeedback(session)}
                            >
                              Give Feedback
                            </button>
                          )
                        )}
                      </div>
                    ) : isEnrolled ? (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: '#34d399',
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                          }}
                        >
                          Enrolled
                        </span>
                        <button
                          type="button"
                          className="action-btn delete"
                          style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                          onClick={() => handleCancelEnrollment(session.id, session.title)}
                          disabled={actionLoading}
                          title="Cancel your enrollment in this session"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : isFull ? (
                      <span
                        style={{
                          fontSize: '0.78rem',
                          color: '#fca5a5',
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                        }}
                      >
                        Full
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="primary-btn"
                        style={{ padding: '5px 14px', fontSize: '0.8rem' }}
                        onClick={() => handleEnroll(session.id, session.title)}
                        disabled={actionLoading}
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Detailed Session Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={selectedSession?.title || 'Session Details'}>
        {selectedSession && (() => {
          const isManaged = canManageSession(selectedSession)
          const isScheduled = selectedSession.status === 'SCHEDULED'
          const isActive = selectedSession.status === 'ACTIVE'
          const isCompleted = selectedSession.status === 'COMPLETED'
          const isEnrolled = enrolledSessionIds.has(Number(selectedSession.id))
          const isFull = (selectedSession.currentEnrollment || 0) >= (selectedSession.maxCapacity || 10)
          const modalThumb = getSubjectThumbnail(selectedSession.subject?.name, selectedSession.title)

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Hero Image Banner in Detail Modal */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '180px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#101424',
                }}
              >
                <img
                  src={modalThumb.url}
                  alt={modalThumb.alt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12, 15, 29, 0.95) 0%, rgba(12, 15, 29, 0.3) 60%)' }} />
                <div style={{ position: 'absolute', bottom: '14px', left: '16px', right: '16px' }}>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: 'var(--color-lilac)',
                      background: 'rgba(66, 96, 229, 0.35)',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      border: '1px solid rgba(120, 132, 215, 0.4)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {selectedSession.subject?.name || 'General'}
                  </span>
                  <h3 style={{ margin: '8px 0 0', fontSize: '1.3rem', color: '#fff' }}>
                    {selectedSession.title}
                  </h3>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '14px' }}>
                <div>
                  <span className={`badge ${statusColors[selectedSession.status] || 'badge-scheduled'}`} style={{ fontSize: '0.85rem' }}>
                    Status: {selectedSession.status}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Subject</span>
                  <strong style={{ display: 'block', color: 'var(--color-light-blue)' }}>{selectedSession.subject?.name || 'General'}</strong>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Session Description & Learning Goals
                </label>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '14px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'var(--color-soft-white)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                  {selectedSession.description || 'No detailed syllabus provided.'}
                </div>
              </div>

              {/* Grid of details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Assigned Mentor</span>
                  <strong style={{ display: 'block', color: 'var(--color-soft-white)', marginTop: '4px' }}>
                    {selectedSession.mentor?.fullName || 'Academic Mentor'}
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-light-blue)' }}>
                    {selectedSession.mentor?.department || 'Department'}
                  </span>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Capacity & Seat Allocation</span>
                  <strong style={{ display: 'block', color: 'var(--color-soft-white)', marginTop: '4px' }}>
                    [{selectedSession.currentEnrollment || 0} / {selectedSession.maxCapacity || 10} seats]
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#34d399' }}>
                    {Math.max(0, (selectedSession.maxCapacity || 10) - (selectedSession.currentEnrollment || 0))} seats remaining
                  </span>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Scheduled Start</span>
                  <strong style={{ display: 'block', color: 'var(--color-soft-white)', marginTop: '4px' }}>
                    {formatDateTime(selectedSession.startTime)}
                  </strong>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Scheduled End</span>
                  <strong style={{ display: 'block', color: 'var(--color-soft-white)', marginTop: '4px' }}>
                    {formatDateTime(selectedSession.endTime)}
                  </strong>
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--glass-border)', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  {isManaged ? (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {isScheduled && (
                        <button
                          type="button"
                          className="action-btn"
                          style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7', borderColor: 'rgba(16, 185, 129, 0.5)' }}
                          onClick={() => handleStatusChange(selectedSession.id, 'ACTIVE')}
                          disabled={actionLoading}
                        >
                          Start Session
                        </button>
                      )}

                      {isActive && (
                        <button
                          type="button"
                          className="action-btn"
                          style={{ background: 'rgba(168, 85, 247, 0.25)', color: '#d8b4fe', borderColor: 'rgba(168, 85, 247, 0.5)' }}
                          onClick={() => handleStatusChange(selectedSession.id, 'COMPLETED')}
                          disabled={actionLoading}
                        >
                          Finish Session
                        </button>
                      )}

                      <button
                        type="button"
                        className="action-btn"
                        onClick={() => handleOpenEdit(selectedSession)}
                        disabled={actionLoading}
                      >
                        Edit Details
                      </button>

                      <button
                        type="button"
                        className="action-btn delete"
                        onClick={() => handleDelete(selectedSession.id, selectedSession.title)}
                        disabled={actionLoading}
                      >
                        Delete Session
                      </button>
                    </div>
                  ) : isLearner ? (
                    <div>
                      {isCompleted ? (
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>This session has completed</span>
                          {isEnrolled && (
                            feedbackSubmittedIds.has(Number(selectedSession.id)) ? (
                              <span style={{ color: '#34d399', fontSize: '0.88rem', fontWeight: 600 }}>
                                ✓ Feedback submitted
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="primary-btn"
                                style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', border: 'none', padding: '6px 14px', fontSize: '0.85rem' }}
                                onClick={() => {
                                  setShowDetailModal(false)
                                  handleOpenFeedback(selectedSession)
                                }}
                              >
                                Give Feedback
                              </button>
                            )
                          )}
                        </div>
                      ) : isEnrolled ? (
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span style={{ color: '#34d399', fontWeight: 600, fontSize: '0.9rem' }}>
                            ✓ You are enrolled in this session
                          </span>
                          <button
                            type="button"
                            className="action-btn delete"
                            style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleCancelEnrollment(selectedSession.id, selectedSession.title)}
                            disabled={actionLoading}
                          >
                            Cancel Enrollment
                          </button>
                        </div>
                      ) : isFull ? (
                        <span style={{ color: '#fca5a5', fontSize: '0.9rem' }}>This session is full</span>
                      ) : (
                        <button
                          type="button"
                          className="primary-btn"
                          onClick={() => handleEnroll(selectedSession.id, selectedSession.title)}
                          disabled={actionLoading}
                        >
                          Enroll in Session Now
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>

                <button type="button" className="secondary-btn" onClick={() => setShowDetailModal(false)}>
                  Close
                </button>
              </div>
            </div>
          )
        })()}
      </Modal>

      {/* Edit Session Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title={`Edit Session: ${editingSession?.title || ''}`}>
        <form className="modal-form" onSubmit={handleSaveEdit}>
          <div className="field">
            <label htmlFor="edit-title">Session Title</label>
            <input
              id="edit-title"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="edit-subject">Academic Subject</label>
            <select
              id="edit-subject"
              value={editForm.subjectId}
              onChange={(e) => setEditForm({ ...editForm, subjectId: Number(e.target.value) })}
            >
              {subjectOptions.map((subj) => (
                <option key={subj.id} value={subj.id}>{subj.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="edit-desc">Description</label>
            <textarea
              id="edit-desc"
              rows="3"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="field">
              <label htmlFor="edit-start">Start Time</label>
              <input
                id="edit-start"
                type="datetime-local"
                value={editForm.startTime}
                onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="edit-end">End Time</label>
              <input
                id="edit-end"
                type="datetime-local"
                value={editForm.endTime}
                onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="edit-capacity">Max Capacity</label>
            <input
              id="edit-capacity"
              type="number"
              min="1"
              value={editForm.maxCapacity}
              onChange={(e) => setEditForm({ ...editForm, maxCapacity: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
            <button type="button" className="secondary-btn" onClick={() => setShowEditModal(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Session Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Schedule New Tutoring Session">
        <form className="modal-form" onSubmit={handleCreate}>
          {message.text && (
            <div className={message.type === 'error' ? 'error-box' : 'message-box'} style={{ marginBottom: '14px' }}>
              {message.text}
            </div>
          )}

          <div className="field">
            <label htmlFor="session-title">Session Title</label>
            <input
              id="session-title"
              data-testid="session-title"
              name="title"
              type="text"
              placeholder="e.g. Calculus 101"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="description">Syllabus / Learning Objectives</label>
            <textarea
              id="description"
              data-testid="description"
              name="description"
              rows="3"
              placeholder="Topics covered, target concepts, prerequisites..."
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="subjectId">Subject Discipline</label>
            <select
              id="subjectId"
              data-testid="subjectId"
              value={createForm.subject?.id || subjectOptions[0]?.id || 1}
              onChange={(e) => setCreateForm({ ...createForm, subject: { id: Number(e.target.value) } })}
            >
              {subjectOptions.map((subj) => (
                <option key={subj.id} value={subj.id}>{subj.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="field">
              <label htmlFor="startTime">Start Date & Time</label>
              <input
                id="startTime"
                data-testid="startTime"
                name="startTime"
                type="datetime-local"
                value={createForm.startTime}
                onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="endTime">End Date & Time</label>
              <input
                id="endTime"
                data-testid="endTime"
                name="endTime"
                type="datetime-local"
                value={createForm.endTime}
                onChange={(e) => setCreateForm({ ...createForm, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="maxCapacity">Maximum Seat Capacity</label>
            <input
              id="maxCapacity"
              data-testid="maxCapacity"
              name="maxCapacity"
              type="number"
              min="1"
              max="100"
              value={createForm.maxCapacity}
              onChange={(e) => setCreateForm({ ...createForm, maxCapacity: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" className="secondary-btn" onClick={() => setShowCreateModal(false)}>
              Cancel
            </button>
            <button
              id="submit-create-session-btn"
              data-testid="submit-create-session-btn"
              type="submit"
              className="primary-btn btn-primary"
              disabled={actionLoading}
            >
              {actionLoading ? 'Scheduling...' : 'Create Session'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Submit Feedback Modal */}
      <Modal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} title="Submit Session Feedback">
        {feedbackSession && (
          <form className="modal-form" onSubmit={handleSubmitFeedback}>
            <div style={{ padding: '12px 14px', background: 'rgba(66, 96, 229, 0.1)', borderRadius: '8px', border: '1px solid rgba(66, 96, 229, 0.25)', marginBottom: '8px' }}>
              <strong style={{ display: 'block', color: 'var(--color-soft-white)', fontSize: '0.95rem' }}>
                {feedbackSession.title || 'Tutoring Session'}
              </strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Mentor: {feedbackSession.mentor?.fullName || 'Assigned Mentor'}
              </span>
            </div>

            <div className="field">
              <label htmlFor="session-feedback-rating">Your Rating (1 to 5 Stars)</label>
              <select
                id="session-feedback-rating"
                value={feedbackRating}
                onChange={(e) => setFeedbackRating(Number(e.target.value))}
                style={{ padding: '10px', borderRadius: '8px', background: 'rgba(16, 20, 36, 0.95)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff' }}
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent session)</option>
                <option value={4}>⭐⭐⭐⭐ (4 - Very good and insightful)</option>
                <option value={3}>⭐⭐⭐ (3 - Satisfactory lesson)</option>
                <option value={2}>⭐⭐ (2 - Needs improvement)</option>
                <option value={1}>⭐ (1 - Did not meet expectations)</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="session-feedback-comment">Comments & Insights</label>
              <textarea
                id="session-feedback-comment"
                rows="4"
                placeholder="Share what you learned, mentor clarity, pacing, or recommendations..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
              <button type="button" className="secondary-btn" onClick={() => setShowFeedbackModal(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className="primary-btn"
                style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', border: 'none' }}
                disabled={submittingFeedback}
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

export default SessionList
