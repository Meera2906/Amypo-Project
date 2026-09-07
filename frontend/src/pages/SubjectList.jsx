import { useEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Modal from '../components/layout/Modal'
import { getAll, create, update, deleteSubject } from '../services/subjectService'
import { getAll as getAllSessions } from '../services/sessionService'
import mockStore from '../services/mockDataStore'

function SubjectList() {
  const user = useSelector((state) => state.auth.user)
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [viewMode, setViewMode] = useState('CARDS') // 'CARDS' | 'TABLE'

  // Add subject form
  const [form, setForm] = useState({ name: '', description: '', level: 'Beginner' })
  const [showAddModal, setShowAddModal] = useState(false)

  // Detail / Syllabus Modal State
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Edit Modal State
  const [editingSubject, setEditingSubject] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', description: '', level: 'Beginner' })
  const [showEditModal, setShowEditModal] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [subjectsRes, sessionsRes] = await Promise.all([
        getAll().catch(() => mockStore.getSubjects()),
        getAllSessions().catch(() => mockStore.getSessions()),
      ])

      const subjectList = subjectsRes?.content !== undefined
        ? subjectsRes.content
        : (subjectsRes?.data !== undefined ? subjectsRes.data : (Array.isArray(subjectsRes) ? subjectsRes : mockStore.getSubjects()))
      setSubjects(Array.isArray(subjectList) && subjectList.length > 0 ? subjectList : mockStore.getSubjects())

      const sessionList = sessionsRes?.content !== undefined
        ? sessionsRes.content
        : (sessionsRes?.data?.content !== undefined
          ? sessionsRes.data.content
          : (Array.isArray(sessionsRes?.data) ? sessionsRes.data : (Array.isArray(sessionsRes) ? sessionsRes : mockStore.getSessions())))
      setSessions(Array.isArray(sessionList) ? sessionList : mockStore.getSessions())
    } catch (error) {
      setSubjects(mockStore.getSubjects())
      setSessions(mockStore.getSessions())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Map active sessions count per subject
  const activeSessionsCount = useMemo(() => {
    const map = {}
    sessions.forEach((s) => {
      const subId = s.subject?.id
      const subName = s.subject?.name
      if (s.status === 'ACTIVE' || s.status === 'SCHEDULED') {
        if (subId) map[subId] = (map[subId] || 0) + 1
        if (subName) map[subName] = (map[subName] || 0) + 1
      }
    })
    return map
  }, [sessions])

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!form.name.trim()) return

    try {
      await create({ ...form, name: form.name.trim() })
      setForm({ name: '', description: '', level: 'Beginner' })
      setShowAddModal(false)
      setMessage({ type: 'success', text: `Subject "${form.name}" created successfully.` })
      await loadData()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Unable to create subject.' })
    }
  }

  const handleOpenEdit = (subject) => {
    setEditingSubject(subject)
    setEditForm({
      name: subject.name || '',
      description: subject.description || '',
      level: subject.level || 'Beginner',
    })
    setShowDetailModal(false)
    setShowEditModal(true)
  }

  const handleSaveEdit = async (event) => {
    event.preventDefault()
    if (!editingSubject?.id) return

    try {
      await update(editingSubject.id, {
        name: editForm.name.trim(),
        description: editForm.description,
        level: editForm.level,
      })
      setShowEditModal(false)
      setMessage({ type: 'success', text: `Subject "${editForm.name}" updated successfully.` })
      await loadData()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Unable to update subject.' })
    }
  }

  const handleDelete = async (id, name) => {
    if (!id) return
    if (!window.confirm(`Are you sure you want to delete "${name || 'this subject'}"? This action cannot be undone.`)) {
      return
    }

    try {
      setMessage({ type: '', text: '' })
      await deleteSubject(id)
      setMessage({ type: 'success', text: `Subject "${name}" deleted successfully.` })
      await loadData()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Unable to remove subject.' })
    }
  }

  const handleOpenDetail = (subject) => {
    setSelectedSubject(subject)
    setShowDetailModal(true)
  }

  const handleEnrollInSubject = (subject) => {
    navigate('/sessions')
  }

  const isAdmin = user?.role === 'ACADEMIC_ADMIN' || user?.role === 'ADMIN'

  return (
    <div className="page container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Study Subjects</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Academic curriculum and subject disciplines available for peer tutoring
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '2px', border: '1px solid var(--glass-border)' }}>
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              style={{
                background: viewMode === 'CARDS' ? 'var(--color-royal-blue)' : 'transparent',
                border: 'none',
                color: '#fff',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              style={{
                background: viewMode === 'TABLE' ? 'var(--color-royal-blue)' : 'transparent',
                border: 'none',
                color: '#fff',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Table
            </button>
          </div>

          {isAdmin && (
            <button
              type="button"
              className="primary-btn"
              onClick={() => setShowAddModal(true)}
            >
              + Add Subject
            </button>
          )}
        </div>
      </div>

      {message.text && (
        <div className={message.type === 'error' ? 'error-box' : 'message-box'} style={{ margin: '16px 0' }}>
          {message.text}
        </div>
      )}

      {loading ? <div className="loader" data-testid="loader">Loading...</div> : null}

      <div className="subject-layout" style={{ marginTop: '20px' }}>
        {/* Academic Admin Inline Add Form */}
        {isAdmin && !showAddModal && (
          <div className="card" style={{ padding: '24px', marginBottom: '24px', background: 'rgba(18, 22, 45, 0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-vivid-blue)', boxShadow: '0 0 8px var(--color-vivid-blue)' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-soft-white)' }}>Quick Add Subject</h3>
              </div>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div className="field">
                  <label htmlFor="quick-subject-name">Subject Name</label>
                  <input
                    id="quick-subject-name"
                    placeholder="e.g. Artificial Intelligence"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="quick-subject-level">Proficiency Level</label>
                  <select id="quick-subject-level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="quick-subject-desc">Detailed Description & Syllabus</label>
                <textarea
                  id="quick-subject-desc"
                  rows="2"
                  placeholder="Overview of curriculum, learning objectives, and prerequisites..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <button type="submit" className="primary-btn" style={{ alignSelf: 'flex-start' }}>
                + Add Subject
              </button>
            </form>
          </div>
        )}

        {/* View Mode: Cards */}
        {viewMode === 'CARDS' && (
          <div className="subject-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
            {subjects.map((subject) => {
              const activeCount = activeSessionsCount[subject.id] || activeSessionsCount[subject.name] || 0

              return (
                <div
                  key={subject.id || subject.name}
                  className="card subject-card"
                  style={{
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative',
                    transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', color: 'var(--color-soft-white)' }}>
                        {subject.name}
                      </h3>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: 'rgba(66, 96, 229, 0.18)',
                          color: 'var(--color-light-blue)',
                          border: '1px solid rgba(66, 96, 229, 0.3)',
                        }}
                      >
                        {subject.level || 'All Levels'}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.75rem',
                          padding: '3px 8px',
                          borderRadius: '10px',
                          background: activeCount > 0 ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          color: activeCount > 0 ? '#6ee7b7' : 'var(--text-secondary)',
                          border: `1px solid ${activeCount > 0 ? 'rgba(52, 211, 153, 0.3)' : 'var(--glass-border)'}`,
                          fontWeight: 600,
                        }}
                      >
                        {activeCount} Active Session{activeCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      color: 'var(--text-secondary)',
                      fontSize: '0.88rem',
                      lineHeight: '1.5',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {subject.description && subject.description.trim() !== (subject.name || '').trim()
                      ? subject.description
                      : (subject.description ? `Curriculum overview: ${subject.description}.` : 'Guided academic study subject designed for collaborative peer mentoring.')}
                  </p>

                  {/* Actions Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 'auto',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--glass-border)',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-light-blue)',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline',
                      }}
                      onClick={() => handleOpenDetail(subject)}
                    >
                      View Syllabus &rarr;
                    </button>

                    {isAdmin ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="action-btn"
                          style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                          onClick={() => handleOpenEdit(subject)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="action-btn delete"
                          style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                          onClick={() => handleDelete(subject.id, subject.name)}
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="action-btn"
                          style={{
                            background: 'rgba(66, 96, 229, 0.2)',
                            color: '#93a5ff',
                            borderColor: 'rgba(66, 96, 229, 0.4)',
                            padding: '4px 12px',
                            fontSize: '0.82rem',
                          }}
                          onClick={() => handleEnrollInSubject(subject)}
                        >
                          Enroll in Subject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* View Mode: Table */}
        {viewMode === 'TABLE' && (
          <div className="card" style={{ padding: '20px', overflowX: 'auto' }}>
            <table className="list-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Proficiency Level</th>
                  <th>Active Sessions</th>
                  <th>Description / Syllabus</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => {
                  const activeCount = activeSessionsCount[subject.id] || activeSessionsCount[subject.name] || 0

                  return (
                    <tr key={subject.id || subject.name}>
                      <td>
                        <strong style={{ color: 'var(--color-soft-white)' }}>{subject.name}</strong>
                      </td>
                      <td>
                        <span className="pill">{subject.level || 'Beginner'}</span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: activeCount > 0 ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            color: activeCount > 0 ? '#6ee7b7' : 'var(--text-secondary)',
                          }}
                        >
                          {activeCount} active
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {subject.description && subject.description.trim() !== (subject.name || '').trim()
                          ? subject.description
                          : (subject.description ? `Curriculum overview: ${subject.description}.` : 'Academic course syllabus.')}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="secondary-btn"
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            onClick={() => handleOpenDetail(subject)}
                          >
                            View Syllabus
                          </button>

                          {isAdmin ? (
                            <>
                              <button
                                type="button"
                                className="action-btn"
                                style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                                onClick={() => handleOpenEdit(subject)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="action-btn delete"
                                style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                                onClick={() => handleDelete(subject.id, subject.name)}
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="action-btn"
                              style={{ padding: '3px 8px', fontSize: '0.75rem', background: 'rgba(66, 96, 229, 0.2)', color: '#93a5ff' }}
                              onClick={() => handleEnrollInSubject(subject)}
                            >
                              Enroll in Subject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Subject Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Study Subject">
        <form className="modal-form" onSubmit={handleCreate}>
          <div className="field">
            <label htmlFor="modal-sub-name">Subject Name</label>
            <input
              id="modal-sub-name"
              placeholder="e.g. Artificial Intelligence & Deep Learning"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="modal-sub-level">Proficiency Level</label>
            <select
              id="modal-sub-level"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="modal-sub-desc">Detailed Description & Syllabus</label>
            <textarea
              id="modal-sub-desc"
              rows="4"
              placeholder="Outline the curriculum topics, target concepts, prerequisites, and learning roadmap..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
            <button type="button" className="secondary-btn" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              + Add Subject
            </button>
          </div>
        </form>
      </Modal>

      {/* Detailed Syllabus View Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={selectedSubject?.name || 'Subject Syllabus'}>
        {selectedSubject && (() => {
          const activeCount = activeSessionsCount[selectedSubject.id] || activeSessionsCount[selectedSubject.name] || 0

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Proficiency Level</span>
                  <div style={{ marginTop: '4px' }}>
                    <span className="badge badge-approved">{selectedSubject.level || 'Beginner'}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Active Tutoring Sessions</span>
                  <strong style={{ display: 'block', color: '#6ee7b7', marginTop: '2px' }}>
                    {activeCount} Session{activeCount !== 1 ? 's' : ''}
                  </strong>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Curriculum & Academic Scope
                </label>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--color-soft-white)',
                    fontSize: '0.94rem',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {selectedSubject.description || 'No detailed syllabus provided yet.'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                <div>
                  {!isAdmin && (
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        setShowDetailModal(false)
                        handleEnrollInSubject(selectedSubject)
                      }}
                    >
                      Enroll in Subject &rarr;
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {isAdmin && (
                    <button
                      type="button"
                      className="action-btn"
                      onClick={() => handleOpenEdit(selectedSubject)}
                    >
                      Edit Subject
                    </button>
                  )}
                  <button type="button" className="secondary-btn" onClick={() => setShowDetailModal(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )
        })()}
      </Modal>

      {/* Edit Subject Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title={`Edit Subject: ${editingSubject?.name || ''}`}>
        <form className="modal-form" onSubmit={handleSaveEdit}>
          <div className="field">
            <label htmlFor="edit-subject-name">Subject Name</label>
            <input
              id="edit-subject-name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="edit-subject-level">Level</label>
            <select
              id="edit-subject-level"
              value={editForm.level}
              onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="edit-subject-desc">Detailed Description</label>
            <textarea
              id="edit-subject-desc"
              rows="4"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
            <button type="button" className="secondary-btn" onClick={() => setShowEditModal(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default SubjectList
