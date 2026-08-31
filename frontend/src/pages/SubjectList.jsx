import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getAll, create, deleteSubject } from '../services/subjectService'

function SubjectList() {
  const user = useSelector((state) => state.auth.user)
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', description: '', level: 'Beginner' })
  const [message, setMessage] = useState('')

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

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await create({ ...form, name: form.name.trim() })
      setForm({ name: '', description: '', level: 'Beginner' })
      setMessage('Subject created successfully.')
      await loadSubjects()
    } catch (error) {
      setMessage('Unable to create subject.')
    }
  }

  const handleDelete = async (id) => {
    if (!id) return
    try {
      setMessage('')
      await deleteSubject(id)
      setMessage('Subject removed successfully.')
      await loadSubjects()
    } catch (error) {
      console.error(error)
      setMessage(error.response?.data?.message || 'Unable to remove subject.')
    }
  }

  const isAdmin = user?.role === 'ACADEMIC_ADMIN'

  return (
    <div className="page container">
      <div className="page-header">
        <h2>Study Subjects</h2>
      </div>

      {message && <div className="message-box">{message}</div>}
      {loading ? <div className="loader" data-testid="loader">Loading...</div> : null}

      <div className="subject-admin-layout" style={{ display: 'flex', flexDirection: 'column', gap: '36px', marginTop: '16px' }}>
        {isAdmin && (
          <form className="card admin-subject-form" onSubmit={handleSubmit} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.4rem', color: 'var(--color-soft-white)' }}>Add New Subject</h3>
            <div className="field">
              <label htmlFor="subject-name">Name</label>
              <input id="subject-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="subject-description">Description</label>
              <textarea id="subject-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="subject-level">Level</label>
              <select id="subject-level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <button type="submit" className="primary-btn" style={{ alignSelf: 'flex-start', marginTop: '8px' }}>Save Subject</button>
          </form>
        )}

        <div className="subject-grid-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.3rem', color: 'var(--color-soft-white)' }}>All Subjects</h3>
          <div className="subject-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {subjects.map((subject) => (
              <div key={subject.id || subject.name} className="card subject-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-soft-white)' }}>{subject.name}</h3>
                  {isAdmin && (
                    <button type="button" className="action-btn delete" onClick={() => handleDelete(subject.id)}>
                      Remove
                    </button>
                  )}
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.5' }}>
                  {subject.description || 'A guided subject area designed for structured learning supports.'}
                </p>
                <span className="pill" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>{subject.level || 'Beginner'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubjectList
