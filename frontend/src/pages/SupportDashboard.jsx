import { useEffect, useState, useMemo } from 'react'
import Modal from '../components/layout/Modal'
import { getAllFeedback } from '../services/feedbackService'
import { getMentors } from '../services/userService'

const initialTickets = [
  { id: 1, title: 'Password reset request', status: 'Resolved', owner: 'Support team', category: 'Access', date: 'Yesterday' },
  { id: 2, title: 'Session booking capacity query', status: 'In progress', owner: 'Support agent', category: 'Enrollment', date: 'Today' },
  { id: 3, title: 'Mentor profile verification assistance', status: 'Open', owner: 'Academic admin', category: 'Mentor', date: 'Just now' },
]

function SupportDashboard() {
  const [feedbacks, setFeedbacks] = useState([])
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('FEEDBACK') // 'FEEDBACK' | 'MENTOR_RATINGS' | 'TICKETS'
  const [filterRating, setFilterRating] = useState('ALL')
  const [selectedMentorFilter, setSelectedMentorFilter] = useState('ALL')

  // Feedback Detail Modal
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Support Ticket Form
  const [tickets, setTickets] = useState(initialTickets)
  const [ticketForm, setTicketForm] = useState({ title: '', status: 'Open', category: 'General' })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [feedbackRes, mentorRes] = await Promise.all([
          getAllFeedback().catch(() => []),
          getMentors().catch(() => []),
        ])

        const feedbackList = Array.isArray(feedbackRes)
          ? feedbackRes
          : (feedbackRes?.data && Array.isArray(feedbackRes.data) ? feedbackRes.data : [])
        setFeedbacks(feedbackList)

        const mentorList = Array.isArray(mentorRes)
          ? mentorRes
          : (mentorRes?.data && Array.isArray(mentorRes.data) ? mentorRes.data : [])
        setMentors(mentorList)
      } catch (err) {
        console.error('Failed to load support dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate Mentor Ratings from Feedbacks
  const mentorRatingSummary = useMemo(() => {
    const map = {}

    // Initialize with all known mentors
    mentors.forEach((m) => {
      map[m.id] = {
        id: m.id,
        name: m.fullName,
        email: m.email,
        department: m.department || 'Academic Department',
        totalRatings: 0,
        ratingsSum: 0,
        averageRating: 0,
        stars5: 0,
        stars4: 0,
        stars3: 0,
        stars2: 0,
        stars1: 0,
      }
    })

    // Aggregate feedbacks
    feedbacks.forEach((f) => {
      const mId = f.mentorId || (mentors.find((m) => m.fullName === f.mentorName)?.id)
      const mName = f.mentorName || 'Unknown Mentor'

      if (mId && map[mId]) {
        map[mId].totalRatings++
        map[mId].ratingsSum += Number(f.rating || 0)
        if (f.rating === 5) map[mId].stars5++
        else if (f.rating === 4) map[mId].stars4++
        else if (f.rating === 3) map[mId].stars3++
        else if (f.rating === 2) map[mId].stars2++
        else if (f.rating === 1) map[mId].stars1++
      } else {
        // Mentor not in pre-seeded list
        const fallbackKey = mId || mName
        if (!map[fallbackKey]) {
          map[fallbackKey] = {
            id: mId || fallbackKey,
            name: mName,
            email: f.mentorEmail || 'N/A',
            department: 'Academic Mentor',
            totalRatings: 0,
            ratingsSum: 0,
            averageRating: 0,
            stars5: 0,
            stars4: 0,
            stars3: 0,
            stars2: 0,
            stars1: 0,
          }
        }
        map[fallbackKey].totalRatings++
        map[fallbackKey].ratingsSum += Number(f.rating || 0)
        if (f.rating === 5) map[fallbackKey].stars5++
        else if (f.rating === 4) map[fallbackKey].stars4++
        else if (f.rating === 3) map[fallbackKey].stars3++
        else if (f.rating === 2) map[fallbackKey].stars2++
        else if (f.rating === 1) map[fallbackKey].stars1++
      }
    })

    // Calculate averages
    return Object.values(map).map((entry) => {
      const avg = entry.totalRatings > 0 ? entry.ratingsSum / entry.totalRatings : 0
      return {
        ...entry,
        averageRating: avg,
        satisfactionPct: Math.round((avg / 5) * 100),
      }
    }).sort((a, b) => b.averageRating - a.averageRating)
  }, [mentors, feedbacks])

  // Overall platform rating stats
  const overallStats = useMemo(() => {
    const totalReviews = feedbacks.length
    if (totalReviews === 0) return { avg: 0, count: 0, highRated: 0 }
    const sum = feedbacks.reduce((acc, f) => acc + Number(f.rating || 0), 0)
    const avg = sum / totalReviews
    const highRated = mentorRatingSummary.filter((m) => m.averageRating >= 4.5 && m.totalRatings > 0).length
    return {
      avg: avg.toFixed(1),
      count: totalReviews,
      highRated,
      totalMentors: mentorRatingSummary.length,
    }
  }, [feedbacks, mentorRatingSummary])

  // Filtered feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((f) => {
      if (filterRating !== 'ALL' && Number(f.rating) !== Number(filterRating)) return false
      if (selectedMentorFilter !== 'ALL' && String(f.mentorId) !== String(selectedMentorFilter) && f.mentorName !== selectedMentorFilter) return false
      return true
    })
  }, [feedbacks, filterRating, selectedMentorFilter])

  const handleOpenDetail = (feedback) => {
    setSelectedFeedback(feedback)
    setShowDetailModal(true)
  }

  const handleCreateTicket = (e) => {
    e.preventDefault()
    if (!ticketForm.title.trim()) return

    setTickets((prev) => [
      {
        id: Date.now(),
        title: ticketForm.title,
        status: ticketForm.status,
        category: ticketForm.category,
        owner: 'Support agent',
        date: 'Just now',
      },
      ...prev,
    ])
    setTicketForm({ title: '', status: 'Open', category: 'General' })
  }

  return (
    <div className="page container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Support Agent Dashboard</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Learner feedback moderation, calculated mentor ratings, and inquiry tracking
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '18px 20px', background: 'rgba(18, 22, 45, 0.6)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Learner Reviews</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: 'var(--color-soft-white)', marginTop: '4px' }}>
            {overallStats.count}
          </strong>
          <span style={{ fontSize: '0.78rem', color: '#6ee7b7' }}>Submitted feedback</span>
        </div>

        <div className="card" style={{ padding: '18px 20px', background: 'rgba(18, 22, 45, 0.6)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Overall Platform Rating</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: '#fbbf24', marginTop: '4px' }}>
            ★ {overallStats.avg} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/ 5.0</span>
          </strong>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Across all subjects</span>
        </div>

        <div className="card" style={{ padding: '18px 20px', background: 'rgba(18, 22, 45, 0.6)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Top-Rated Mentors</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: '#a78bfa', marginTop: '4px' }}>
            {overallStats.highRated}
          </strong>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Rated 4.5+ stars</span>
        </div>

        <div className="card" style={{ padding: '18px 20px', background: 'rgba(18, 22, 45, 0.6)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Total Mentors Monitored</span>
          <strong style={{ display: 'block', fontSize: '1.8rem', color: 'var(--color-light-blue)', marginTop: '4px' }}>
            {overallStats.totalMentors}
          </strong>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Academic faculty</span>
        </div>
      </div>

      {/* Main View Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`timeline-filter-btn ${activeTab === 'FEEDBACK' ? 'active' : ''}`}
          onClick={() => setActiveTab('FEEDBACK')}
          style={{
            background: activeTab === 'FEEDBACK' ? 'var(--color-royal-blue)' : 'rgba(255, 255, 255, 0.05)',
            border: '1px solid ' + (activeTab === 'FEEDBACK' ? 'var(--color-vivid-blue)' : 'var(--glass-border)'),
            color: activeTab === 'FEEDBACK' ? '#fff' : 'var(--text-secondary)',
            borderRadius: '20px',
            padding: '8px 18px',
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          💬 Learner Feedbacks ({feedbacks.length})
        </button>

        <button
          type="button"
          className={`timeline-filter-btn ${activeTab === 'MENTOR_RATINGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('MENTOR_RATINGS')}
          style={{
            background: activeTab === 'MENTOR_RATINGS' ? 'var(--color-royal-blue)' : 'rgba(255, 255, 255, 0.05)',
            border: '1px solid ' + (activeTab === 'MENTOR_RATINGS' ? 'var(--color-vivid-blue)' : 'var(--glass-border)'),
            color: activeTab === 'MENTOR_RATINGS' ? '#fff' : 'var(--text-secondary)',
            borderRadius: '20px',
            padding: '8px 18px',
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          ★ Calculated Mentor Ratings ({mentorRatingSummary.length})
        </button>

        <button
          type="button"
          className={`timeline-filter-btn ${activeTab === 'TICKETS' ? 'active' : ''}`}
          onClick={() => setActiveTab('TICKETS')}
          style={{
            background: activeTab === 'TICKETS' ? 'var(--color-royal-blue)' : 'rgba(255, 255, 255, 0.05)',
            border: '1px solid ' + (activeTab === 'TICKETS' ? 'var(--color-vivid-blue)' : 'var(--glass-border)'),
            color: activeTab === 'TICKETS' ? '#fff' : 'var(--text-secondary)',
            borderRadius: '20px',
            padding: '8px 18px',
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          📋 Support Tickets ({tickets.length})
        </button>
      </div>

      {loading ? <div className="loader" data-testid="loader">Loading...</div> : null}

      {/* TAB 1: LEARNER FEEDBACKS */}
      {activeTab === 'FEEDBACK' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', background: 'rgba(18, 22, 45, 0.5)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="filter-rating" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rating:</label>
              <select
                id="filter-rating"
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Ratings</option>
                <option value="5">5 Stars ★★★★★</option>
                <option value="4">4 Stars ★★★★</option>
                <option value="3">3 Stars ★★★</option>
                <option value="2">2 Stars ★★</option>
                <option value="1">1 Star ★</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="filter-mentor" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mentor:</label>
              <select
                id="filter-mentor"
                value={selectedMentorFilter}
                onChange={(e) => setSelectedMentorFilter(e.target.value)}
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Mentors</option>
                {mentorRatingSummary.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Showing {filteredFeedbacks.length} of {feedbacks.length} reviews &bull; Click card for full review
            </span>
          </div>

          {filteredFeedbacks.length === 0 ? (
            <div className="empty-state" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No feedback entries match the selected filters.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '20px' }}>
              {filteredFeedbacks.map((item) => (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    padding: '20px',
                    position: 'relative',
                    transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onClick={() => handleOpenDetail(item)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--color-soft-white)', fontSize: '1.05rem' }}>
                        {item.learnerName || 'Learner'}
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Session: {item.sessionTitle || 'Tutoring Session'}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: '#fbbf24', fontSize: '1.1rem', letterSpacing: '2px' }}>
                        {'★'.repeat(item.rating || 5)}
                        {'☆'.repeat(Math.max(0, 5 - (item.rating || 5)))}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {item.rating} / 5.0
                      </span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Reviewed Mentor:</span>
                    <strong style={{ display: 'block', color: 'var(--color-light-blue)', fontSize: '0.92rem', marginTop: '2px' }}>
                      {item.mentorName || 'Faculty Mentor'}
                    </strong>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      color: 'var(--color-soft-white)',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      fontStyle: 'italic',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    "{item.comment || 'No comment provided.'}"
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-light-blue)' }}>
                      View Full Details &rarr;
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID #{item.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CALCULATED MENTOR RATINGS */}
      {activeTab === 'MENTOR_RATINGS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-soft-white)' }}>
              Mentor Performance & Rating Scorecard
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Dynamically calculated from learner reviews
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '22px' }}>
            {mentorRatingSummary.map((m) => (
              <div
                key={m.id}
                className="card"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  position: 'relative',
                  background: 'rgba(18, 22, 45, 0.65)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="avatar-circle" style={{ width: '50px', height: '50px', fontSize: '1.3rem', margin: 0 }}>
                    {m.name?.charAt(0) || 'M'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-soft-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.name}
                    </h3>
                    <p style={{ margin: '2px 0 0', color: 'var(--color-light-blue)', fontSize: '0.85rem' }}>
                      {m.department}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '1.4rem', color: '#fbbf24', display: 'block' }}>
                      ★ {m.averageRating.toFixed(1)}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {m.totalRatings} review{m.totalRatings !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Rating Bar */}
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Overall Satisfaction</span>
                    <strong style={{ color: m.satisfactionPct >= 80 ? '#34d399' : '#fbbf24' }}>
                      {m.satisfactionPct}%
                    </strong>
                  </div>
                  <div style={{ height: '8px', width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${m.satisfactionPct}%`,
                        background: m.satisfactionPct >= 80 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #d97706, #fbbf24)',
                        borderRadius: '4px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Star Distribution */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', textAlign: 'center', fontSize: '0.78rem' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px', borderRadius: '6px' }}>
                    <span style={{ color: '#fbbf24' }}>5★</span>
                    <strong style={{ display: 'block', color: 'var(--color-soft-white)' }}>{m.stars5}</strong>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px', borderRadius: '6px' }}>
                    <span style={{ color: '#93a5ff' }}>4★</span>
                    <strong style={{ display: 'block', color: 'var(--color-soft-white)' }}>{m.stars4}</strong>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>3★</span>
                    <strong style={{ display: 'block', color: 'var(--color-soft-white)' }}>{m.stars3}</strong>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>2★</span>
                    <strong style={{ display: 'block', color: 'var(--color-soft-white)' }}>{m.stars2}</strong>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px', borderRadius: '6px' }}>
                    <span style={{ color: '#f87171' }}>1★</span>
                    <strong style={{ display: 'block', color: 'var(--color-soft-white)' }}>{m.stars1}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="secondary-btn"
                  style={{ marginTop: 'auto', fontSize: '0.85rem', padding: '8px' }}
                  onClick={() => {
                    setSelectedMentorFilter(m.id)
                    setActiveTab('FEEDBACK')
                  }}
                >
                  View All Reviews for {m.name} &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SUPPORT TICKETS */}
      {activeTab === 'TICKETS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <form className="card" onSubmit={handleCreateTicket} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-soft-white)' }}>Log Support Case / Ticket</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="field">
                <label htmlFor="ticket-title">Issue Description</label>
                <input
                  id="ticket-title"
                  placeholder="e.g. Inability to join active session room"
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="ticket-category">Category</label>
                <select
                  id="ticket-category"
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                >
                  <option value="General">General Inquiry</option>
                  <option value="Enrollment">Session & Enrollment</option>
                  <option value="Mentor">Mentor Verification</option>
                  <option value="Access">Account & Authentication</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="ticket-status">Status</label>
                <select
                  id="ticket-status"
                  value={ticketForm.status}
                  onChange={(e) => setTicketForm({ ...ticketForm, status: e.target.value })}
                >
                  <option value="Open">Open</option>
                  <option value="In progress">In progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            <button type="submit" className="primary-btn" style={{ alignSelf: 'flex-start' }}>
              Submit Ticket
            </button>
          </form>

          <div className="card">
            <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem', color: 'var(--color-soft-white)' }}>
              Support Case Records
            </h3>
            <table className="list-table">
              <thead>
                <tr>
                  <th>Ticket Case</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Logged</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <strong>{ticket.title}</strong>
                    </td>
                    <td>
                      <span className="pill">{ticket.category}</span>
                    </td>
                    <td>
                      <span className={`badge ${ticket.status === 'Resolved' ? 'badge-approved' : ticket.status === 'In progress' ? 'badge-active' : 'badge-pending'}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td>{ticket.owner}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{ticket.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Feedback Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Learner Feedback Details">
        {selectedFeedback && (() => {
          const mentorData = mentorRatingSummary.find(
            (m) => String(m.id) === String(selectedFeedback.mentorId) || m.name === selectedFeedback.mentorName
          )

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rating Score</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ color: '#fbbf24', fontSize: '1.4rem' }}>
                      {'★'.repeat(selectedFeedback.rating || 5)}
                      {'☆'.repeat(Math.max(0, 5 - (selectedFeedback.rating || 5)))}
                    </span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--color-soft-white)' }}>
                      {selectedFeedback.rating} / 5.0
                    </strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Feedback ID</span>
                  <strong style={{ display: 'block', color: 'var(--color-soft-white)' }}>#{selectedFeedback.id}</strong>
                </div>
              </div>

              {/* Full Comment */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Learner's Feedback Comment
                </label>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--color-soft-white)',
                    fontSize: '0.98rem',
                    lineHeight: '1.6',
                    fontStyle: 'italic',
                  }}
                >
                  "{selectedFeedback.comment || 'No comments written.'}"
                </div>
              </div>

              {/* Participant details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Reviewed Mentor</span>
                  <strong style={{ display: 'block', color: 'var(--color-soft-white)', fontSize: '1rem', marginTop: '2px' }}>
                    {selectedFeedback.mentorName || 'Faculty Mentor'}
                  </strong>
                  {selectedFeedback.mentorEmail && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-light-blue)' }}>{selectedFeedback.mentorEmail}</span>
                  )}
                  {mentorData && (
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#fbbf24', marginTop: '4px' }}>
                      Overall Average: ★ {mentorData.averageRating.toFixed(1)} ({mentorData.totalRatings} reviews)
                    </span>
                  )}
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Submitting Learner</span>
                  <strong style={{ display: 'block', color: 'var(--color-soft-white)', fontSize: '1rem', marginTop: '2px' }}>
                    {selectedFeedback.learnerName || 'Student Learner'}
                  </strong>
                  {selectedFeedback.learnerEmail && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-light-blue)' }}>{selectedFeedback.learnerEmail}</span>
                  )}
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Associated Tutoring Session</span>
                <strong style={{ display: 'block', color: 'var(--color-soft-white)', fontSize: '0.95rem', marginTop: '2px' }}>
                  {selectedFeedback.sessionTitle || 'Tutoring Session'}
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Session ID: #{selectedFeedback.sessionId}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', paddingTop: '14px', borderTop: '1px solid var(--glass-border)' }}>
                <button type="button" className="secondary-btn" onClick={() => setShowDetailModal(false)}>
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

export default SupportDashboard
