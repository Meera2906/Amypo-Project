import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import Modal from '../components/layout/Modal'
import CapacityBar from '../components/layout/CapacityBar'
import * as sessionService from '../services/sessionService'
import * as subjectService from '../services/subjectService'

const statusColors = {
  SCHEDULED: 'badge-scheduled',
  ACTIVE: 'badge-active',
  COMPLETED: 'badge-completed',
  CANCELLED: 'badge-cancelled',
}

function SessionList() {
  const user = useSelector((state) => state.auth.user)
  const [sessions, setSessions] = useState([])
  const [fetchedSubjects, setFetchedSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    maxCapacity: 10,
    subject: { id: 1 },
    mentor: { id: user?.id || 1 },
  })

  const fetchSessions = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await sessionService.getAll(0, 20)
      const data = response?.content !== undefined ? response.content : (response?.data?.content !== undefined ? response.data.content : (response?.data !== undefined ? response.data : response))
      setSessions(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Unable to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await subjectService.getAll()
      const data = response?.content !== undefined ? response.content : (response?.data !== undefined ? response.data : response)
      if (Array.isArray(data) && data.length > 0) {
        setFetchedSubjects(data)
      }
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    fetchSessions()
    fetchSubjects()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    const title = (form.title || '').trim()
    if (!title) {
      setError('Title is required')
      return
    }

    try {
      const mentorId = user?.id || 1
      await sessionService.create({
        title,
        description: form.description,
        startTime: form.startTime,
        endTime: form.endTime,
        maxCapacity: Number(form.maxCapacity),
        mentor: { id: mentorId },
        subject: { id: Number(form.subject?.id || 1) },
      })
      setShowModal(false)
      setForm({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        maxCapacity: 10,
        subject: { id: 1 },
        mentor: { id: user?.id || 1 },
      })
      await fetchSessions()
    } catch (err) {
      setError(err.response?.data?.message || 'Session creation failed')
    }
  }

  const renderActions = (session) => {
    if (user?.role === 'ACADEMIC_ADMIN' || user?.role === 'MENTOR') {
      return (
        <div className="list-actions">
          <button type="button" className="action-btn" onClick={() => {}}>Edit</button>
          <button type="button" className="action-btn delete" onClick={async () => {
            try {
              await sessionService.cancel(session.id)
              await fetchSessions()
            } catch (err) {
              setError('Unable to delete session')
            }
          }}>
            Delete
          </button>
        </div>
      )
    }

    return null
  }

  const defaultSubjects = useMemo(() => [
    { id: 1, name: 'Mathematics' },
    { id: 2, name: 'Physics' },
    { id: 3, name: 'Computer Science' },
    { id: 4, name: 'Chemistry' },
  ], [])

  const subjectOptions = fetchedSubjects.length > 0 ? fetchedSubjects : defaultSubjects

  return (
    <div className="page container">
      <div className="page-header">
        <h2>Tutoring Sessions</h2>
        <button type="button" className="primary-btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Session
        </button>
      </div>

      {loading ? <div className="loader" data-testid="loader">Loading...</div> : null}
      {error && <div className="error-box">{error}</div>}

      {!loading && sessions.length === 0 && <div className="empty-state">No sessions available</div>}

      <div className="session-grid">
        {sessions.map((session) => (
          <div key={session.id} className="session-card">
            <div className="session-meta">
              <span className={`badge ${statusColors[session.status] || 'badge-scheduled'}`}>
                {session.status}
              </span>
              <strong>{session.title}</strong>
            </div>

            <p>{session.description || 'No description provided.'}</p>
            <p><strong>Mentor:</strong> {session.mentor?.fullName || 'Unknown mentor'}</p>
            <p><strong>Subject:</strong> {session.subject?.name || 'General'}</p>
            <p><strong>Time:</strong> {session.startTime} - {session.endTime}</p>
            <CapacityBar current={session.currentEnrollment || 0} max={session.maxCapacity || 1} />
            {renderActions(session)}
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Session">
        <form className="modal-form" onSubmit={handleCreate}>
          <div className="field">
            <label htmlFor="session-title">Title</label>
            <input
              id="session-title"
              name="title"
              type="text"
              placeholder="e.g. Calculus 101"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange} />
          </div>

          <div className="field">
            <label htmlFor="subjectId">Subject</label>
            <select id="subjectId" name="subject" onChange={(event) => setForm({ ...form, subject: { id: Number(event.target.value) } })} value={form.subject?.id || 1}>
              {subjectOptions.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="startTime">Start time</label>
            <input id="startTime" name="startTime" type="datetime-local" value={form.startTime} onChange={handleChange} required />
          </div>

          <div className="field">
            <label htmlFor="endTime">End time</label>
            <input id="endTime" name="endTime" type="datetime-local" value={form.endTime} onChange={handleChange} required />
          </div>

          <div className="field">
            <label htmlFor="maxCapacity">Max Capacity</label>
            <input id="maxCapacity" name="maxCapacity" type="number" min="1" value={form.maxCapacity} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn-primary">Create Session</button>
        </form>
      </Modal>
    </div>
  )
}

export default SessionList
