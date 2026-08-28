import { useEffect, useState } from 'react'
import { getSubjects } from '../services/subjectService'

function Subjects() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getSubjects()
        setSubjects(response.data || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="page container">
      <div className="page-header">
        <h2>Study Subjects</h2>
      </div>

      {loading ? <div className="loader" data-testid="loader">Loading...</div> : null}

      <div className="subject-grid">
        {subjects.map((subject) => (
          <div key={subject.id || subject.name} className="subject-card">
            <h3>{subject.name}</h3>
            <p>{subject.description || 'Core subject area for mentoring and learning.'}</p>
            <span className="pill">{subject.level || 'Beginner'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Subjects
