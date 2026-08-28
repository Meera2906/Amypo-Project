import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getAll as getSessions } from '../services/sessionService'

function EnrollmentTracking() {
  const user = useSelector((state) => state.auth.user)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getSessions(0, 20)
        setSessions(response.data.content || [])
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
        <h2>Enrollment Tracking</h2>
      </div>

      {loading ? <div className="loader" data-testid="loader">Loading...</div> : null}

      {!loading && sessions.length === 0 && <div className="empty-state">No active enrollment data.</div>}

      <div className="card">
        <table className="list-table">
          <thead>
            <tr>
              <th>Session</th>
              <th>Mentor</th>
              <th>Capacity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id}>
                <td>{session.title}</td>
                <td>{session.mentor?.fullName || 'Unassigned'}</td>
                <td>{session.currentEnrollment || 0}/{session.maxCapacity || 0}</td>
                <td>
                  <span className={`badge ${session.status === 'ACTIVE' ? 'badge-active' : 'badge-scheduled'}`}>
                    {session.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default EnrollmentTracking
