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
    try {
      await deleteSubject(id)
      await loadSubjects()
    } catch (error) {
      console.error(error)
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

      {isAdmin && (
        <form className="card" onSubmit={handleSubmit}>
          <h3>Add subject</h3>
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
          <button type="submit" className="primary-btn">Save Subject</button>
        </form>
      )}

      <div className="subject-grid">
        {subjects.map((subject) => (
          <div key={subject.id || subject.name} className="card subject-card">
            <div className="meta-row">
              <h3>{subject.name}</h3>
              {isAdmin && (
                <button type="button" className="action-btn delete" onClick={() => handleDelete(subject.id)}>
                  Remove
                </button>
              )}
            </div>
            <p>{subject.description || 'A guided subject area designed for structured learning supports.'}</p>
            <span className="pill">{subject.level || 'Beginner'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SubjectList
