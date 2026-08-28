import { useEffect, useState } from 'react'
import { getMentors, getMentorStats } from '../services/userService'

function MentorProfiles() {
  const [mentors, setMentors] = useState([])
  const [statsMap, setStatsMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mentorResponse = await getMentors()
        const lists = mentorResponse.data || []
        setMentors(lists)

        const statsPromises = lists.map(async (mentor) => {
          const metricResponse = await getMentorStats(mentor.id)
          return { id: mentor.id, stats: metricResponse.data || {} }
        })

        const results = await Promise.all(statsPromises)
        const map = {}
        results.forEach((entry) => {
          map[entry.id] = entry.stats
        })
        setStatsMap(map)
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
        <h2>Mentor Profiles</h2>
      </div>

      {loading ? <div className="loader" data-testid="loader">Loading...</div> : null}

      <div className="mentor-grid">
        {mentors.map((mentor) => {
          const stats = statsMap[mentor.id] || {}
          return (
            <div key={mentor.id} className="mentor-card">
              <div className="avatar-circle">{mentor.fullName?.charAt(0) || 'M'}</div>
              <h3>{mentor.fullName}</h3>
              <p>{mentor.department || 'Academic Mentor'}</p>
              <span className={`badge ${mentor.status === 'PENDING' ? 'badge-pending' : 'badge-approved'}`}>
                {mentor.status || 'APPROVED'}
              </span>
              <p>{mentor.bio || 'Mentor providing structured guidance to learners.'}</p>
              <div className="meta-row">
                <span>Rating</span>
                <strong>{Number(stats.averageRating || 0).toFixed(1)}</strong>
              </div>
              <div className="meta-row">
                <span>Sessions</span>
                <strong>{stats.totalSessions || 0}</strong>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MentorProfiles
