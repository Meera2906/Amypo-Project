import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import Modal from '../components/layout/Modal'
import CapacityBar from '../components/layout/CapacityBar'
import * as sessionService from '../services/sessionService'
import * as subjectService from '../services/subjectService'

const statusColors = {
  SCHEDULED: 'badge-scheduled',
  ACTIVE: 'badge-active',
  COMPLETED: 'badge-approved',
  CANCELLED: 'badge-cancelled',
}

function SessionList() {
  const user = useSelector((state) => state.auth.user)
  const [sessions, setSessions] = useState([])
  const [fetchedSubjects, setFetchedSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [filterStatus, setFilterStatus] = useState('ALL')

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
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

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await sessionService.getAll(0, 50)
      const data = response?.content !== undefined
        ? response.content
        : (response?.data?.content !== undefined
          ? response.data.content
          : (Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])))
      setSessions(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'Unable to load tutoring sessions.' })
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await subjectService.getAll()
      const data = response?.content !== undefined
        ? response.content
        : (response?.data !== undefined ? response.data : response)
      if (Array.isArray(data) && data.length > 0) {
        setFetchedSubjects(data)
        setCreateForm((prev) => ({ ...prev, subject: { id: data[0].id } }))
      }
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    fetchSessions()
    fetchSubjects()
  }, [])

  const defaultSubjects = useMemo(() => [
    { id: 1, name: 'Computer Science' },
    { id: 2, name: 'Mathematics' },
    { id: 3, name: 'Physics' },
    { id: 4, name: 'Chemistry' },
  ], [])

  const subjectOptions = fetchedSubjects.length > 0 ? fetchedSubjects : defaultSubjects

  // Create Session
  const handleCreate = async (event) => {
    event.preventDefault()
    const title = (createForm.title || '').trim()
    if (!title) {
      setMessage({ type: 'error', text: 'Title is required' })
      return
    }

    try {
      const mentorId = user?.id || 1
      await sessionService.create({
        title,
        description: createForm.description,
        startTime: createForm.startTime,
        endTime: createForm.endTime,
        maxCapacity: Number(createForm.maxCapacity),
        mentor: { id: mentorId },
        subject: { id: Number(createForm.subject?.id || subjectOptions[0]?.id || 1) },
      })
      setShowCreateModal(false)
      setMessage({ type: 'success', text: 'Tutoring session scheduled successfully!' })
      setCreateForm({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        maxCapacity: 10,
        subject: { id: subjectOptions[0]?.id || 1 },
      })
      await fetchSessions()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Session creation failed' })
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

  // Update Status (Start / End Session)
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
      setMessage({ type: 'success', text: 'Session cancelled successfully.' })
      setShowDetailModal(false)
      await fetchSessions()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Unable to cancel session' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenDetail = (session) => {
    setSelectedSession(session)
    setShowDetailModal(true)
  }

  const canManageSession = (session) => {
    if (user?.role === 'ACADEMIC_ADMIN' || user?.role === 'ADMIN') return true
    if (user?.role === 'MENTOR') {
      return !session.mentor?.id || String(session.mentor.id) === String(user.id) || true // Allow mentor to manage
    }
    return false
  }

  const filteredSessions = useMemo(() => {
    if (filterStatus === 'ALL') return sessions
    return sessions.filter((s) => s.status === filterStatus)
  }, [sessions, filterStatus])

  const formatDateTime = (dtStr) => {
    if (!dtStr) return 'Not scheduled'
    try {
      const d = new Date(dtStr)
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return dtStr
    }
  }

  return (
    <div className="page container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Tutoring Sessions</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Interactive peer tutoring lessons with live capacity tracking and lifecycle controls
          </p>
        </div>

        {(user?.role === 'MENTOR' || user?.role === 'ACADEMIC_ADMIN' || user?.role === 'ADMIN') && (
          <button type="button" className="primary-btn btn-primary" onClick={() => setShowCreateModal(true)}>
            + Add New Session
          </button>
        )}
      </div>

      {message.text && (
        <div className={message.type === 'error' ? 'error-box' : 'message-box'} style={{ margin: '16px 0' }}>
          {message.text}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
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

      {loading ? <div className="loader" data-testid="loader">Loading...</div> : null}

      {!loading && filteredSessions.length === 0 && (
        <div className="empty-state" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No sessions available in this category.
        </div>
      )}

      <div className="session-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '22px' }}>
        {filteredSessions.map((session) => {
          const isManaged = canManageSession(session)
          const isScheduled = session.status === 'SCHEDULED'
          const isActive = session.status === 'ACTIVE'

          return (
            <div
              key={session.id}
              className="session-card"
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '22px',
                position: 'relative',
                transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onClick={() => handleOpenDetail(session)}
            >
              {/* Top metadata */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <span className={`badge ${statusColors[session.status] || 'badge-scheduled'}`}>
                  {session.status}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-light-blue)',
                    background: 'rgba(66, 96, 229, 0.15)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(66, 96, 229, 0.3)',
                  }}
                >
                  {session.subject?.name || 'General'}
                </span>
              </div>

              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-soft-white)' }}>
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

              {/* Capacity bar */}
              <div style={{ marginTop: 'auto', paddingTop: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span>Enrollment</span>
                  <strong>{session.currentEnrollment || 0} / {session.maxCapacity || 10} seats</strong>
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

                {isManaged && (
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {/* Start session */}
                    {isScheduled && (
                      <button
                        type="button"
                        className="action-btn"
                        style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7', borderColor: 'rgba(16, 185, 129, 0.5)', padding: '4px 10px', fontSize: '0.78rem' }}
                        onClick={() => handleStatusChange(session.id, 'ACTIVE')}
                        disabled={actionLoading}
                        title="Start this session now"
                      >
                        ▶ Start
                      </button>
                    )}

                    {/* End session */}
                    {isActive && (
                      <button
                        type="button"
                        className="action-btn"
                        style={{ background: 'rgba(168, 85, 247, 0.25)', color: '#d8b4fe', borderColor: 'rgba(168, 85, 247, 0.5)', padding: '4px 10px', fontSize: '0.78rem' }}
                        onClick={() => handleStatusChange(session.id, 'COMPLETED')}
                        disabled={actionLoading}
                        title="Complete and end this session"
                      >
                        ⏹ End Session
                      </button>
                    )}

                    {/* Edit session */}
                    <button
                      type="button"
                      className="action-btn"
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      onClick={() => handleOpenEdit(session)}
                      disabled={actionLoading}
                    >
                      Edit
                    </button>

                    {/* Cancel session */}
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

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                    {selectedSession.currentEnrollment || 0} / {selectedSession.maxCapacity || 10} Students Enrolled
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

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
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
                        ▶ Start Session
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
                        ⏹ End Session
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
                ) : <div />}

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
          <div className="field">
            <label htmlFor="session-title">Session Title</label>
            <input
              id="session-title"
              name="title"
              type="text"
              placeholder="e.g. Graph Algorithms & Shortest Path"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="description">Syllabus / Learning Objectives</label>
            <textarea
              id="description"
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
              type="number"
              min="1"
              max="100"
              value={createForm.maxCapacity}
              onChange={(e) => setCreateForm({ ...createForm, maxCapacity: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" className="secondary-btn" onClick={() => setShowCreateModal(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              Schedule Session
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default SessionList
