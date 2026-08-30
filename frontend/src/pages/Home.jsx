import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import StatCards from '../components/layout/StatCards'
import SubjectChart from '../components/layout/SubjectChart'
import Timeline from '../components/layout/Timeline'
import { getStats } from '../services/userService'

function Home() {
  const user = useSelector((state) => state.auth.user)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getStats()
        setStats(response.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
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
    if (!stats) return []
    return [
      { title: 'Sessions scheduled', detail: `${stats.scheduledSessions || 0} upcoming lessons` },
      { title: 'Mentors approved', detail: `${stats.totalMentors || 0} active mentors` },
      { title: 'Support demand', detail: `${stats.pendingMentors || 0} mentor applications pending` },
    ]
  }, [stats])

  return (
    <div className="page">
      <header className="page-header">
        <h1>{`Welcome back ${user?.fullName || ''}`}</h1>
      </header>

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
            <div className="card">
              <h3>Activity</h3>
              <Timeline activities={activities} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Home
