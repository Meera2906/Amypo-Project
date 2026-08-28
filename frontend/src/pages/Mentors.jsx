import { useEffect, useState } from 'react'
import { getMentors } from '../services/userService'

function Mentors() {
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await getMentors()
        setMentors(response.data || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchMentors()
  }, [])

  return (
    <div className="page container">
      <div className="page-header">
        <h2>Mentor Directory</h2>
      </div>

      {loading ? <div className="loader" data-testid="loader">Loading...</div> : null}

      <div className="mentor-grid">
        {mentors.map((mentor) => (
          <div key={mentor.id} className="mentor-card">
            <div className="avatar-circle">{mentor.fullName?.charAt(0) || 'M'}</div>
            <h3>{mentor.fullName}</h3>
            <p>{mentor.department || 'Academic Mentor'}</p>
            <span className="status-tag">{mentor.status || 'APPROVED'}</span>
            <p>{mentor.bio || 'Dedicated mentor supporting learners through personalised guidance.'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Mentors
