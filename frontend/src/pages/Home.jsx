import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import StatCards from '../components/layout/StatCards'
import SubjectChart from '../components/layout/SubjectChart'
import Timeline from '../components/layout/Timeline'
import { getStats } from '../services/userService'
import { getAll as getAllSessions } from '../services/sessionService'

function Home() {
  const user = useSelector((state) => state.auth.user)
  const [stats, setStats] = useState(null)
  const [recentSessions, setRecentSessions] = useState([])
  const [loading, setLoading] = useState(true)

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('loom_user'))
    } catch (e) {
      return null
    }
  }, [])

  const displayName = user?.fullName || user?.name || storedUser?.fullName || storedUser?.name || 'John Doe'
  const isMentorPending = user?.status === 'PENDING' || storedUser?.status === 'PENDING'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await getStats()
        const statsData = statsRes?.data !== undefined ? statsRes.data : statsRes
        setStats(statsData)

        try {
          const sessionsRes = await getAllSessions(0, 5)
          const sessionList = sessionsRes?.content || (sessionsRes?.data?.content) || (Array.isArray(sessionsRes) ? sessionsRes : [])
          setRecentSessions(sessionList)
        } catch (sessErr) {
          // ignore session fetch if unavailable
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const statCards = useMemo(() => {
    if (!stats) return []
    return [
      { label: 'Learners', value: stats.totalLearners || 0 },
      { label: 'Mentors', value: stats.totalMentors || 0 },
      { label: 'Scheduled', value: stats.scheduledSessions || 0 },
      { label: 'Active', value: stats.activeSessions || 0 },
    ]
  }, [stats])

  const activities = useMemo(() => {
    const items = []

    // Live sessions as timeline events
    if (recentSessions && recentSessions.length > 0) {
      recentSessions.forEach((sess) => {
        items.push({
          type: 'SESSION',
          category: sess.status || 'SESSION',
          title: sess.title,
          detail: `Mentor: ${sess.mentor?.fullName || 'Assigned Mentor'} | Subject: ${sess.subject?.name || 'Academic'} | Capacity: ${sess.currentEnrollment || 0}/${sess.maxCapacity || 10}`,
          time: sess.startTime ? new Date(sess.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
          badge: sess.status,
          badgeClass: sess.status === 'ACTIVE' ? 'badge-active' : sess.status === 'COMPLETED' ? 'badge-approved' : 'badge-scheduled',
        })
      })
    }

    // Platform milestones from stats
    if (stats) {
      items.push({
        type: 'MILESTONE',
        category: 'PLATFORM',
        title: 'Platform Academic Capacity',
        detail: `${stats.scheduledSessions || 0} sessions currently scheduled across active subjects`,
        time: 'Active',
      })
      items.push({
        type: 'MENTOR',
        category: 'FACULTY',
        title: 'Mentor Network Active',
        detail: `${stats.totalMentors || 0} active mentors providing tutoring guidance`,
        time: 'Verified',
      })
      if (stats.pendingMentors > 0) {
        items.push({
          type: 'MENTOR',
          category: 'PENDING',
          title: 'Applications Pending Review',
          detail: `${stats.pendingMentors} mentor applications awaiting administrator verification`,
          time: 'Action Req',
          badge: 'Pending Review',
          badgeClass: 'badge-pending',
        })
      }
      items.push({
        type: 'MILESTONE',
        category: 'LEARNERS',
        title: 'Learner Community Engagement',
        detail: `${stats.totalLearners || 0} learners actively enrolled across academic tracks`,
        time: 'Platform',
      })
    }

    return items
  }, [stats, recentSessions])

  return (
    <div className="page">
      <header className="page-header">
        <h1>{`Welcome back ${displayName}`}</h1>
      </header>

      {isMentorPending && (
        <div className="card" style={{ marginBottom: '24px', border: '1px solid rgba(250, 204, 21, 0.4)', background: 'rgba(250, 204, 21, 0.08)', padding: '16px 20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.4rem' }}>⏳</span>
            <div>
              <strong style={{ color: '#fef08a', fontSize: '1rem' }}>Mentor Account Pending Review</strong>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Your mentor application has been received and is currently under review by an Academic Administrator. You can explore the platform while awaiting approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loader" data-testid="loader">Loading...</div>
      ) : (
        <>
          <StatCards stats={statCards} />
          <div className="session-grid">
            <div className="card">
              <h3>Subject Enrollment</h3>
              <SubjectChart data={stats?.subjectStats || []} />
            </div>
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Activity Timeline</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Live Platform Events</span>
              </div>
              <Timeline activities={activities} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Home
