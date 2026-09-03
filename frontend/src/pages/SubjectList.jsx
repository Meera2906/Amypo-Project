import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Modal from '../components/layout/Modal'
import { getAll, create, update, deleteSubject } from '../services/subjectService'

function SubjectList() {
  const user = useSelector((state) => state.auth.user)
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Add subject form
  const [form, setForm] = useState({ name: '', description: '', level: 'Beginner' })

  // Detail Modal State
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Edit Modal State
  const [editingSubject, setEditingSubject] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', description: '', level: 'Beginner' })
  const [showEditModal, setShowEditModal] = useState(false)

  const loadSubjects = async () => {
    try {
      const response = await getAll()
      const data = response?.content !== undefined ? response.content : (response?.data !== undefined ? response.data : response)
      setSubjects(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubjects()
  }, [])

  const handleCreate = async (event) => {
    event.preventDefault()
    try {
      await create({ ...form, name: form.name.trim() })
      setForm({ name: '', description: '', level: 'Beginner' })
      setMessage({ type: 'success', text: 'Subject created successfully.' })
      await loadSubjects()
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
      await loadSubjects()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Unable to update subject.' })
    }
  }

  const handleDelete = async (id, name) => {
    if (!id) return
    if (!window.confirm(`Are you sure you want to remove "${name || 'this subject'}"? This will cancel all associated tutoring sessions.`)) {
      return
    }

    try {
      setMessage({ type: '', text: '' })
      await deleteSubject(id)
      setMessage({ type: 'success', text: 'Subject removed successfully.' })
      await loadSubjects()
    } catch (error) {
      console.error(error)
      setMessage({ type: 'error', text: error.response?.data?.message || 'Unable to remove subject.' })
    }
  }

  const handleOpenDetail = (subject) => {
    setSelectedSubject(subject)
    setShowDetailModal(true)
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
      </div>

      {message.text && (
        <div className={message.type === 'error' ? 'error-box' : 'message-box'} style={{ margin: '16px 0' }}>
          {message.text}
        </div>
      )}

      {loading ? <div className="loader" data-testid="loader">Loading...</div> : null}

      <div className="subject-admin-layout" style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '16px' }}>
        {isAdmin && (
          <form className="card admin-subject-form" onSubmit={handleCreate} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(18, 22, 45, 0.55)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-vivid-blue)', boxShadow: '0 0 8px var(--color-vivid-blue)' }} />
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-soft-white)' }}>Add New Subject</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="field">
                <label htmlFor="subject-name">Subject Name</label>
                <input
                  id="subject-name"
                  placeholder="e.g. Artificial Intelligence"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="subject-level">Proficiency Level</label>
                <select id="subject-level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="subject-description">Detailed Description & Syllabus</label>
              <textarea
                id="subject-description"
                rows="3"
                placeholder="Comprehensive overview of core topics, prerequisites, and learning objectives..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <button type="submit" className="primary-btn" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
              + Save Subject
            </button>
          </form>
        )}

        {/* Subjects List */}
        <div className="subject-grid-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-soft-white)' }}>
              All Subjects ({subjects.length})
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Click any card to inspect full description</span>
          </div>

          <div className="subject-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {subjects.map((subject) => (
              <div
                key={subject.id || subject.name}
                className="card subject-card"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                }}
                onClick={() => handleOpenDetail(subject)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
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

                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px' }}>
                    ID: #{subject.id}
                  </span>
                </div>

                <p
                  style={{
                    margin: 0,
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {subject.description || 'A guided academic study subject designed for collaborative peer mentoring.'}
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
                  }}
                  onClick={(e) => e.stopPropagation()}
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
                    View Details &rarr;
                  </button>

                  {isAdmin && (
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
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Subject View Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={selectedSubject?.name || 'Subject Details'}>
        {selectedSubject && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Proficiency Level</span>
                <div style={{ marginTop: '4px' }}>
                  <span className="badge badge-approved">{selectedSubject.level || 'Beginner'}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Subject ID</span>
                <strong style={{ display: 'block', color: 'var(--color-soft-white)' }}>#{selectedSubject.id}</strong>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Description & Academic Scope
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              {isAdmin && (
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => {
                    setShowDetailModal(false)
                    handleOpenEdit(selectedSubject)
                  }}
                >
                  Edit Subject
                </button>
              )}
              <button type="button" className="secondary-btn" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        )}
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
