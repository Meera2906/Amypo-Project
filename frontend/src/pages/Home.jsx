import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import StatCards from '../components/layout/StatCards'
import SubjectChart from '../components/layout/SubjectChart'
import Timeline from '../components/layout/Timeline'
import { getStats } from '../services/userService'
import { getAll as getAllSessions } from '../services/sessionService'
import mockStore from '../services/mockDataStore'

function Home() {
  const user = useSelector((state) => state.auth.user)
  const navigate = useNavigate()
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

  const currentUser = user || storedUser
  const displayName = currentUser?.fullName || currentUser?.name || 'John Doe'
  const role = currentUser?.role || 'LEARNER'
  const isMentorPending = currentUser?.status === 'PENDING'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await getStats()
        const statsData = statsRes?.data !== undefined ? statsRes.data : statsRes
        setStats(statsData)

        try {
          const sessionsRes = await getAllSessions(0, 10)
          const sessionList = sessionsRes?.content || (sessionsRes?.data?.content) || (Array.isArray(sessionsRes) ? sessionsRes : [])
          setRecentSessions(sessionList)
        } catch (sessErr) {
          setRecentSessions(mockStore.getSessions())
        }
      } catch (error) {
        setStats(mockStore.getStats())
        setRecentSessions(mockStore.getSessions())
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Role-specific KPI metrics
  const statCards = useMemo(() => {
    if (!stats) return []

    if (role === 'ACADEMIC_ADMIN') {
      return [
        { label: 'Total Learners', value: stats.totalLearners ?? 10 },
        { label: 'Approved Mentors', value: stats.approvedMentors ?? stats.totalMentors ?? 8 },
        { label: 'Active Sessions', value: stats.activeSessions ?? 1 },
        { label: 'Completed Sessions', value: stats.completedSessions ?? 7 },
      ]
    }

    if (role === 'MENTOR') {
      return [
        { label: 'Total Learners', value: stats.totalLearners ?? 10 },
        { label: 'Active Sessions', value: stats.activeSessions ?? 1 },
        { label: 'Completed Sessions', value: stats.completedSessions ?? 7 },
      ]
    }

    if (role === 'SUPPORT_AGENT') {
      return [
        { label: 'Learner Reviews', value: mockStore.getFeedbacks().length },
        { label: 'Average Rating', value: '4.8 ★' },
        { label: 'Active Sessions', value: stats.activeSessions ?? 1 },
        { label: 'Completed Sessions', value: stats.completedSessions ?? 7 },
      ]
    }

    // Default Learner KPI metrics
    const userEnrollments = mockStore.getEnrollmentsForLearner(currentUser?.id || 3)
    const completedCount = userEnrollments.filter((e) => e.status === 'COMPLETED').length
    const activeCount = userEnrollments.filter((e) => e.status === 'ENROLLED').length

    return [
      { label: 'Enrolled Sessions', value: activeCount },
      { label: 'Completed Sessions', value: completedCount },
      { label: 'Available Subjects', value: stats.subjectStats?.length || 5 },
      { label: 'Approved Mentors', value: stats.approvedMentors ?? stats.totalMentors ?? 8 },
    ]
  }, [stats, role, currentUser])

  // Recent Platform Activity Timeline
  const activities = useMemo(() => {
    const items = []

    // Live session activity events
    if (recentSessions && recentSessions.length > 0) {
      recentSessions.slice(0, 4).forEach((sess) => {
        items.push({
          type: 'SESSION',
          category: sess.status || 'SESSION',
          title: sess.title,
          detail: `Mentor: ${sess.mentor?.fullName || 'Faculty Mentor'} | Subject: ${sess.subject?.name || 'Academic'} | Capacity: ${sess.currentEnrollment || 0}/${sess.maxCapacity || 10}`,
          time: sess.startTime ? new Date(sess.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live',
          badge: sess.status,
          badgeClass: sess.status === 'ACTIVE' ? 'badge-active' : sess.status === 'COMPLETED' ? 'badge-approved' : 'badge-scheduled',
        })
      })
    }

    // Platform milestones
    if (stats?.activities && stats.activities.length > 0) {
      stats.activities.forEach((act) => {
        if (!items.some((i) => i.title === act.title)) {
          items.push(act)
        }
      })
    } else {
      items.push({
        type: 'PLATFORM',
        category: 'ACADEMIC',
        title: 'Platform Academic Capacity',
        detail: `${stats?.scheduledSessions || 21} tutoring sessions scheduled across active subject disciplines`,
        time: 'Live System',
      })
      items.push({
        type: 'FACULTY',
        category: 'MENTOR',
        title: 'Mentor Network Active',
        detail: `${stats?.approvedMentors || stats?.totalMentors || 8} verified academic mentors providing peer guidance`,
        time: 'Verified',
      })
    }

    return items
  }, [stats, recentSessions])

  return (
    <div className="page container">
      {/* Welcome Banner with Action CTA */}
      <div
        className="card welcome-banner"
        style={{
          marginBottom: '24px',
          padding: '28px',
          background: 'linear-gradient(135deg, rgba(23, 32, 90, 0.7), rgba(12, 15, 29, 0.85))',
          border: '1px solid rgba(66, 96, 229, 0.35)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ flex: '1', minWidth: '280px', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ color: 'var(--color-light-blue)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ✦ LoomLearn Peer Learning Hub
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.9rem', color: 'var(--color-soft-white)' }}>
            Welcome back, {displayName}!
          </h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', lineHeight: '1.5' }}>
            {role === 'ACADEMIC_ADMIN' && 'Oversee campus curriculum, audit mentor qualifications, and analyze student enrollment trends.'}
            {role === 'MENTOR' && 'Schedule and lead peer tutoring cohorts, manage interactive lesson capacities, and track student learning outcomes.'}
            {role === 'LEARNER' && 'Explore scheduled peer tutoring sessions, reserve your seat, and review your enrolled courses.'}
            {role === 'SUPPORT_AGENT' && 'Review learner feedback, inspect mentor performance ratings, and manage student assistance tickets.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', zIndex: 1 }}>
          {(role === 'ACADEMIC_ADMIN' || role === 'MENTOR') && (
            <button
              type="button"
              className="primary-btn"
              onClick={() => navigate('/sessions')}
              style={{ padding: '10px 22px', fontSize: '0.95rem', boxShadow: '0 4px 18px rgba(66, 96, 229, 0.45)' }}
            >
              Manage Sessions &rarr;
            </button>
          )}

          {role === 'LEARNER' && (
            <>
              <button
                type="button"
                className="primary-btn"
                onClick={() => navigate('/sessions')}
                style={{ padding: '10px 20px', fontSize: '0.92rem' }}
              >
                Browse Sessions &rarr;
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate('/enrollments')}
                style={{ padding: '10px 20px', fontSize: '0.92rem' }}
              >
                My Enrollments
              </button>
            </>
          )}

          {role === 'SUPPORT_AGENT' && (
            <button
              type="button"
              className="primary-btn"
              onClick={() => navigate('/support')}
              style={{ padding: '10px 22px', fontSize: '0.95rem' }}
            >
              Open Support Dashboard &rarr;
            </button>
          )}
        </div>
      </div>

      {isMentorPending && (
        <div
          className="card"
          style={{
            marginBottom: '24px',
            border: '1px solid rgba(250, 204, 21, 0.4)',
            background: 'rgba(250, 204, 21, 0.08)',
            padding: '16px 20px',
            borderRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <div>
              <strong style={{ color: '#fef08a', fontSize: '1rem' }}>Mentor Account Pending Review</strong>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Your mentor profile is currently under review by an Academic Administrator. You can explore the platform while awaiting approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loader" data-testid="loader">Loading...</div>
      ) : (
        <>
          {/* Key Metric KPI Cards */}
          <StatCards stats={statCards} />

          {/* Bottom Section: Left = Student Enrollments per Subject, Right = Recent Platform Activity */}
          <div
            className="dashboard-bottom-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '24px',
              marginTop: '24px',
            }}
          >
            {/* Left: Student Enrollments per Subject */}
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-soft-white)' }}>
                    Student Enrollments per Subject
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Active learner engagement by subject curriculum
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--color-light-blue)',
                    background: 'rgba(66, 96, 229, 0.15)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}
                >
                  Live Metrics
                </span>
              </div>
              <SubjectChart data={stats?.subjectStats || mockStore.getStats().subjectStats} />
            </div>

            {/* Right: Recent Platform Activity Timeline */}
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-soft-white)' }}>
                    Recent Platform Activity
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Joined events, session lifecycle updates, and feedback milestones
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.78rem',
                    color: '#6ee7b7',
                    background: 'rgba(16, 185, 129, 0.15)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}
                >
                  Realtime
                </span>
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
