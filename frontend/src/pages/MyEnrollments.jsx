import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getMyEnrollments, cancelEnrollment } from '../services/enrollmentService'

function MyEnrollments() {
  const user = useSelector((state) => state.auth.user)
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!user?.id) return

    try {
      const response = await getMyEnrollments(user.id)
      setEnrollments(response.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.id])

  const handleCancel = async (sessionId) => {
    try {
      await cancelEnrollment(user.id, sessionId)
      await loadData()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="page container">
      <div className="page-header">
        <h2>My Enrollments</h2>
      </div>

      {loading ? <div className="loader" data-testid="loader">Loading...</div> : null}

      {!loading && enrollments.length === 0 && (
        <div className="empty-state">No enrollments yet.</div>
      )}

      <div className="session-grid">
        {enrollments.map((enrollment) => (
          <div key={enrollment.id} className="session-card">
            <div className="session-meta">
              <strong>{enrollment.session?.title || 'Session'}</strong>
            </div>
            <p><strong>Mentor:</strong> {enrollment.session?.mentor?.fullName || 'Mentor'}</p>
            <p><strong>Subject:</strong> {enrollment.session?.subject?.name || 'General'}</p>
            <p><strong>Status:</strong> {enrollment.status || 'ACTIVE'}</p>
            <button className="secondary-btn" type="button" onClick={() => handleCancel(enrollment.session?.id)}>
              Cancel Enrollment
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyEnrollments
