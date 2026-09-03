import { useEffect, useState, useMemo } from 'react'
import Modal from '../components/layout/Modal'
import { getMentors, getMentorStats, updateMentorStatus } from '../services/userService'

const STATUS_BADGES = {
  PENDING: 'badge-pending',
  APPROVED: 'badge-approved',
  REJECTED: 'badge-cancelled',
  BLOCKED: 'badge-cancelled',
}

function MentorProfiles() {
  const [mentors, setMentors] = useState([])
  const [statsMap, setStatsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [message, setMessage] = useState({ type: '', text: '' })

  // Detailed Modal State
  const [selectedMentor, setSelectedMentor] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const mentorResponse = await getMentors()
      const lists = Array.isArray(mentorResponse)
        ? mentorResponse
        : (mentorResponse?.data && Array.isArray(mentorResponse.data) ? mentorResponse.data : [])

      setMentors(lists)

      // Fetch stats resiliently without failing if an individual stats call fails
      const map = {}
      await Promise.all(
        lists.map(async (mentor) => {
          try {
            const metricResponse = await getMentorStats(mentor.id)
            map[mentor.id] = metricResponse?.data !== undefined ? metricResponse.data : (metricResponse || {})
          } catch (e) {
            map[mentor.id] = { averageRating: 0, totalReviews: 0, totalSessions: 0 }
          }
        })
      )
      setStatsMap(map)
    } catch (error) {
      console.error('Failed to load mentors:', error)
      setMessage({ type: 'error', text: 'Unable to load mentor profiles. Please check backend connection.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleStatusChange = async (mentorId, newStatus) => {
    try {
      setActionLoading(true)
      await updateMentorStatus(mentorId, newStatus)
      setMessage({ type: 'success', text: `Mentor status updated to ${newStatus}.` })
      
      // Update local state immediately
      setMentors((prev) =>
        prev.map((m) => (m.id === mentorId ? { ...m, status: newStatus } : m))
      )
      if (selectedMentor?.id === mentorId) {
        setSelectedMentor((prev) => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      console.error('Failed to update status:', err)
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update mentor status.' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenDetail = (mentor) => {
    setSelectedMentor(mentor)
    setShowModal(true)
  }

  // Counts for tabs
  const counts = useMemo(() => {
    const res = { ALL: mentors.length, PENDING: 0, APPROVED: 0, REJECTED: 0, BLOCKED: 0 }
    mentors.forEach((m) => {
      const s = m.status || 'APPROVED'
      if (res[s] !== undefined) res[s]++
    })
    return res
  }, [mentors])

  const filteredMentors = useMemo(() => {
    if (statusFilter === 'ALL') return mentors
    return mentors.filter((m) => (m.status || 'APPROVED') === statusFilter)
  }, [mentors, statusFilter])

  return (
    <div className="page container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Mentor Profiles & Approvals</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Review, verify, approve and manage faculty mentor profiles and credentials
          </p>
        </div>
      </div>

      {message.text && (
        <div className={message.type === 'error' ? 'error-box' : 'message-box'} style={{ margin: '16px 0' }}>
          {message.text}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'ALL', label: 'All Mentors', count: counts.ALL },
          { key: 'PENDING', label: 'Pending Review', count: counts.PENDING, color: '#fef08a' },
          { key: 'APPROVED', label: 'Approved', count: counts.APPROVED, color: '#86efac' },
          { key: 'REJECTED', label: 'Rejected', count: counts.REJECTED, color: '#fca5a5' },
          { key: 'BLOCKED', label: 'Blocked', count: counts.BLOCKED, color: '#cbd5e1' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`timeline-filter-btn ${statusFilter === tab.key ? 'active' : ''}`}
            onClick={() => setStatusFilter(tab.key)}
            style={{
              background: statusFilter === tab.key ? 'var(--color-royal-blue)' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid ' + (statusFilter === tab.key ? 'var(--color-vivid-blue)' : 'var(--glass-border)'),
              color: statusFilter === tab.key ? '#fff' : 'var(--text-secondary)',
              borderRadius: '24px',
              padding: '6px 16px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{tab.label}</span>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                background: statusFilter === tab.key ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                color: tab.color || '#fff',
                padding: '1px 7px',
                borderRadius: '10px',
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? <div className="loader" data-testid="loader">Loading...</div> : null}

      {!loading && filteredMentors.length === 0 && (
        <div className="empty-state" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No mentors found in this category.
        </div>
      )}

      <div className="mentor-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {filteredMentors.map((mentor) => {
          const stats = statsMap[mentor.id] || {}
          const status = mentor.status || 'APPROVED'
          const badgeClass = STATUS_BADGES[status] || 'badge-approved'

          return (
            <div
              key={mentor.id}
              className="mentor-card"
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
              }}
              onClick={() => handleOpenDetail(mentor)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div className="avatar-circle" style={{ width: '48px', height: '48px', fontSize: '1.2rem', margin: 0 }}>
                  {mentor.fullName?.charAt(0) || 'M'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-soft-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {mentor.fullName}
                  </h3>
                  <p style={{ margin: '2px 0 0', color: 'var(--color-light-blue)', fontSize: '0.85rem' }}>
                    {mentor.department || 'Academic Department'}
                  </p>
                </div>
                <span className={`badge ${badgeClass}`} style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  {status}
                </span>
              </div>

              <p
                style={{
                  margin: 0,
                  color: 'var(--text-secondary)',
                  fontSize: '0.88rem',
                  lineHeight: '1.5',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {mentor.bio || 'Mentor providing structured tutoring and guidance to learners.'}
              </p>

              {/* Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'rgba(255, 255, 255, 0.03)', padding: '8px 12px', borderRadius: '8px', marginTop: 'auto' }}>
                <div className="meta-row" style={{ display: 'flex', justifyContent: 'space-between', margin: 0 }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Rating</span>
                  <strong style={{ color: '#fbbf24' }}>★ {Number(stats.averageRating || 0).toFixed(1)}</strong>
                </div>
                <div className="meta-row" style={{ display: 'flex', justifyContent: 'space-between', margin: 0 }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Sessions</span>
                  <strong>{stats.totalSessions || 0}</strong>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--glass-border)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <span style={{ fontSize: '0.82rem', color: 'var(--color-light-blue)' }}>
                  View Full Profile &rarr;
                </span>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {status === 'PENDING' && (
                    <>
                      <button
                        type="button"
                        className="action-btn"
                        style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', borderColor: 'rgba(16, 185, 129, 0.4)', padding: '4px 10px', fontSize: '0.78rem' }}
                        onClick={() => handleStatusChange(mentor.id, 'APPROVED')}
                        disabled={actionLoading}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="action-btn delete"
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                        onClick={() => handleStatusChange(mentor.id, 'REJECTED')}
                        disabled={actionLoading}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {status === 'APPROVED' && (
                    <>
                      <button
                        type="button"
                        className="action-btn delete"
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                        onClick={() => handleStatusChange(mentor.id, 'BLOCKED')}
                        disabled={actionLoading}
                      >
                        Block
                      </button>
                    </>
                  )}

                  {(status === 'REJECTED' || status === 'BLOCKED') && (
                    <button
                      type="button"
                      className="action-btn"
                      style={{ background: 'rgba(66, 96, 229, 0.2)', color: '#93a5ff', borderColor: 'rgba(66, 96, 229, 0.4)', padding: '4px 10px', fontSize: '0.78rem' }}
                      onClick={() => handleStatusChange(mentor.id, 'APPROVED')}
                      disabled={actionLoading}
                    >
                      Re-Approve
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detailed Mentor Profile Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedMentor?.fullName || 'Mentor Profile'}>
        {selectedMentor && (() => {
          const stats = statsMap[selectedMentor.id] || {}
          const status = selectedMentor.status || 'APPROVED'

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header profile info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                <div className="avatar-circle" style={{ width: '60px', height: '60px', fontSize: '1.5rem', margin: 0 }}>
                  {selectedMentor.fullName?.charAt(0) || 'M'}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-soft-white)' }}>
                    {selectedMentor.fullName}
                  </h3>
                  <p style={{ margin: '2px 0 6px', color: 'var(--color-light-blue)', fontSize: '0.9rem' }}>
                    {selectedMentor.department || 'Academic Department'} &bull; {selectedMentor.email}
                  </p>
                  <span className={`badge ${STATUS_BADGES[status] || 'badge-approved'}`}>
                    Status: {status}
                  </span>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Biography & Qualifications
                </label>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '14px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'var(--color-soft-white)', fontSize: '0.92rem', lineHeight: '1.5' }}>
                  {selectedMentor.bio || 'No biography details provided.'}
                </div>
              </div>

              {/* Metric Breakdown */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Teaching & Engagement Statistics
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Average Rating</span>
                    <strong style={{ display: 'block', fontSize: '1.2rem', color: '#fbbf24', marginTop: '4px' }}>
                      ★ {Number(stats.averageRating || 0).toFixed(1)}
                    </strong>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Total Reviews</span>
                    <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--color-soft-white)', marginTop: '4px' }}>
                      {stats.totalReviews || 0}
                    </strong>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Total Sessions</span>
                    <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--color-soft-white)', marginTop: '4px' }}>
                      {stats.totalSessions || 0}
                    </strong>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Scheduled</span>
                    <strong style={{ display: 'block', fontSize: '1.1rem', color: '#93a5ff', marginTop: '4px' }}>
                      {stats.scheduledSessions || 0}
                    </strong>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Active</span>
                    <strong style={{ display: 'block', fontSize: '1.1rem', color: '#34d399', marginTop: '4px' }}>
                      {stats.activeSessions || 0}
                    </strong>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Completed</span>
                    <strong style={{ display: 'block', fontSize: '1.1rem', color: '#a78bfa', marginTop: '4px' }}>
                      {stats.completedSessions || 0}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {status === 'PENDING' && (
                    <>
                      <button
                        type="button"
                        className="action-btn"
                        style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7', borderColor: 'rgba(16, 185, 129, 0.5)' }}
                        onClick={() => handleStatusChange(selectedMentor.id, 'APPROVED')}
                        disabled={actionLoading}
                      >
                        ✓ Approve Application
                      </button>
                      <button
                        type="button"
                        className="action-btn delete"
                        onClick={() => handleStatusChange(selectedMentor.id, 'REJECTED')}
                        disabled={actionLoading}
                      >
                        ✕ Reject Application
                      </button>
                      <button
                        type="button"
                        className="action-btn delete"
                        onClick={() => handleStatusChange(selectedMentor.id, 'BLOCKED')}
                        disabled={actionLoading}
                      >
                        Block
                      </button>
                    </>
                  )}

                  {status === 'APPROVED' && (
                    <>
                      <button
                        type="button"
                        className="action-btn delete"
                        onClick={() => handleStatusChange(selectedMentor.id, 'BLOCKED')}
                        disabled={actionLoading}
                      >
                        Block Account
                      </button>
                      <button
                        type="button"
                        className="action-btn delete"
                        onClick={() => handleStatusChange(selectedMentor.id, 'REJECTED')}
                        disabled={actionLoading}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {(status === 'REJECTED' || status === 'BLOCKED') && (
                    <button
                      type="button"
                      className="action-btn"
                      style={{ background: 'rgba(66, 96, 229, 0.25)', color: '#93a5ff', borderColor: 'rgba(66, 96, 229, 0.5)' }}
                      onClick={() => handleStatusChange(selectedMentor.id, 'APPROVED')}
                      disabled={actionLoading}
                    >
                      Re-Approve Mentor
                    </button>
                  )}
                </div>

                <button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}

export default MentorProfiles
