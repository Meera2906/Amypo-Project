import { useEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import Modal from '../components/layout/Modal'
import EnrollmentCard from '../components/layout/EnrollmentCard'
import { getMyEnrollments, cancelEnrollment } from '../services/enrollmentService'
import { submitFeedback } from '../services/feedbackService'
import mockStore from '../services/mockDataStore'
import { getSubjectThumbnail } from '../utils/subjectImages'

function MyEnrollments() {
  const user = useSelector((state) => state.auth.user)
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [viewMode, setViewMode] = useState('TABLE') // 'TABLE' | 'CARDS'

  // Detail Modal
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Feedback Modal
  const [feedbackEnrollment, setFeedbackEnrollment] = useState(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  const learnerId = useMemo(() => {
    if (user?.id) return user.id
    try {
      const stored = JSON.parse(localStorage.getItem('loom_user'))
      return stored?.id || 3
    } catch (e) {
      return 3
    }
  }, [user])

  const loadData = async () => {
    if (!learnerId) return

    try {
      setLoading(true)
      const response = await getMyEnrollments(learnerId)
      const data = response?.content !== undefined
        ? response.content
        : (response?.data !== undefined ? response.data : response)
      const list = Array.isArray(data) ? data : mockStore.getEnrollmentsForLearner(learnerId)
      setEnrollments(list)
    } catch (error) {
      setEnrollments(mockStore.getEnrollmentsForLearner(learnerId))
    } finally {
      setLoading(false)
    }
  }

  const resolveStatus = (enrollment) => {
    const s = (enrollment?.status || '').toUpperCase()
    const sessStatus = (enrollment?.sessionStatus || enrollment?.session?.status || '').toUpperCase()
    if (s === 'CANCELLED' || s === 'DISCONTINUED' || sessStatus === 'CANCELLED') return 'CANCELLED'
    if (s === 'COMPLETED' || s === 'ATTENDED' || sessStatus === 'COMPLETED') return 'COMPLETED'
    return 'ENROLLED'
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'ATTENDED':
        return 'badge-approved'
      case 'CANCELLED':
        return 'badge-cancelled'
      case 'ENROLLED':
      default:
        return 'badge-active'
    }
  }

  useEffect(() => {
    loadData()
  }, [learnerId])

  const handleCancel = async (sessionId, title) => {
    if (!sessionId) return
    if (!window.confirm(`Are you sure you want to cancel your enrollment in "${title || 'this session'}"?`)) return

    try {
      await cancelEnrollment(learnerId, sessionId)
      setMessage({ type: 'success', text: 'Enrollment cancelled successfully.' })
      setShowDetailModal(false)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('loom_enrollment_change', { detail: { sessionId, learnerId, action: 'CANCEL' } }))
      }
      await loadData()
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to cancel enrollment.' })
    }
  }

  const handleOpenFeedback = (enrollment) => {
    setFeedbackEnrollment(enrollment)
    setFeedbackRating(5)
    setFeedbackComment('')
    setShowFeedbackModal(true)
  }

  const handleSubmitFeedback = async (event) => {
    event.preventDefault()
    if (!feedbackEnrollment?.sessionId && !feedbackEnrollment?.id) return

    const targetSessionId = feedbackEnrollment.sessionId || feedbackEnrollment.session?.id || feedbackEnrollment.id

    try {
      setSubmittingFeedback(true)
      await submitFeedback({
        learnerId,
        sessionId: targetSessionId,
        rating: Number(feedbackRating),
        comment: feedbackComment.trim(),
      })

      setMessage({ type: 'success', text: 'Thank you! Your feedback has been submitted and recorded.' })
      setShowFeedbackModal(false)

      // Update local enrollment state to reflect submitted status
      setEnrollments((prev) =>
        prev.map((e) =>
          (e.id === feedbackEnrollment.id || e.sessionId === targetSessionId)
            ? { ...e, feedbackSubmitted: true }
            : e
        )
      )
      if (selectedEnrollment?.id === feedbackEnrollment.id) {
        setSelectedEnrollment((prev) => ({ ...prev, feedbackSubmitted: true }))
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit feedback.' })
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const handleOpenDetail = (enrollment) => {
    setSelectedEnrollment(enrollment)
    setShowDetailModal(true)
  }

  const formatDateTime = (dtStr) => {
    if (!dtStr) return 'TBD'
    try {
      const d = new Date(dtStr)
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return dtStr
    }
  }

  return (
    <div className="page container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>My Enrollments</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Your enrolled tutoring sessions, attendance milestones, and peer feedback
          </p>
        </div>

        {/* View mode toggle */}
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '2px', border: '1px solid var(--glass-border)' }}>
          <button
            type="button"
            onClick={() => setViewMode('TABLE')}
            style={{
              background: viewMode === 'TABLE' ? 'var(--color-royal-blue)' : 'transparent',
              border: 'none',
              color: '#fff',
              padding: '5px 14px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            Table View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('CARDS')}
            style={{
              background: viewMode === 'CARDS' ? 'var(--color-royal-blue)' : 'transparent',
              border: 'none',
              color: '#fff',
              padding: '5px 14px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            Cards View
          </button>
        </div>
      </div>

      {message.text && (
        <div className={message.type === 'error' ? 'error-box' : 'message-box'} style={{ margin: '16px 0' }}>
          {message.text}
        </div>
      )}

      {loading ? <div className="loader" data-testid="loader">Loading...</div> : null}

      {!loading && enrollments.length === 0 && (
        <div className="empty-state" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-soft-white)' }}>No enrollments yet.</p>
          <p style={{ fontSize: '0.9rem' }}>Browse available sessions in the Sessions directory to book your peer tutoring lessons.</p>
        </div>
      )}

      {/* TABLE VIEW (Standard Requirement) */}
      {!loading && enrollments.length > 0 && viewMode === 'TABLE' && (
        <div className="card" style={{ padding: '20px', overflowX: 'auto', marginTop: '16px' }}>
          <table className="list-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Session Title</th>
                <th>Mentor</th>
                <th>Schedule (Start & End)</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enrollment) => {
                const title = enrollment.sessionTitle || enrollment.session?.title || 'Tutoring Session'
                const mentor = enrollment.mentorName || enrollment.session?.mentor?.fullName || 'Faculty Mentor'
                const status = resolveStatus(enrollment)
                const isCancelled = status === 'CANCELLED'
                const isCompleted = status === 'COMPLETED'
                const isEnrolled = status === 'ENROLLED'
                const feedbackSubmitted = !!enrollment.feedbackSubmitted

                return (
                  <tr key={enrollment.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong
                          style={{ color: 'var(--color-soft-white)', cursor: 'pointer' }}
                          onClick={() => handleOpenDetail(enrollment)}
                        >
                          {title}
                        </strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-light-blue)', marginTop: '2px' }}>
                          {enrollment.subjectName || enrollment.session?.subject?.name || 'General'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--color-soft-white)', fontWeight: 500 }}>{mentor}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ color: 'var(--color-soft-white)', fontSize: '0.84rem' }}>
                          <strong style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Start: </strong>
                          {formatDateTime(enrollment.sessionStartTime || enrollment.session?.startTime)}
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          <strong style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>End: </strong>
                          {formatDateTime(enrollment.sessionEndTime || enrollment.session?.endTime)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${getStatusBadge(status)}`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                        {isCancelled ? (
                          <span
                            style={{
                              fontSize: '0.78rem',
                              color: '#fca5a5',
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontWeight: 500,
                            }}
                          >
                            Cancelled
                          </span>
                        ) : isEnrolled ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span
                              style={{
                                fontSize: '0.78rem',
                                color: 'var(--color-light-blue)',
                                background: 'rgba(66, 96, 229, 0.12)',
                                border: '1px solid rgba(66, 96, 229, 0.25)',
                                padding: '4px 10px',
                                borderRadius: '6px',
                              }}
                            >
                              Enrolled
                            </span>
                            <button
                              type="button"
                              className="action-btn delete"
                              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                              onClick={() => handleCancel(enrollment.sessionId || enrollment.id, title)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : isCompleted ? (
                          feedbackSubmitted ? (
                            <span
                              style={{
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                color: '#34d399',
                                background: 'rgba(16, 185, 129, 0.15)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                padding: '4px 12px',
                                borderRadius: '6px',
                                cursor: 'default',
                              }}
                            >
                              Feedback Submitted
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="primary-btn"
                              style={{
                                background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                                border: 'none',
                                padding: '5px 14px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)',
                              }}
                              onClick={() => handleOpenFeedback(enrollment)}
                            >
                              Give Feedback
                            </button>
                          )
                        ) : null}

                        <button
                          type="button"
                          className="secondary-btn"
                          style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                          onClick={() => handleOpenDetail(enrollment)}
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CARDS VIEW */}
      {!loading && enrollments.length > 0 && viewMode === 'CARDS' && (
        <div className="enrollment-cards-grid" style={{ marginTop: '16px' }}>
          {enrollments.map((enrollment) => {
            const title = enrollment.sessionTitle || enrollment.session?.title || 'Tutoring Session'
            return (
              <EnrollmentCard
                key={enrollment.id}
                enrollment={enrollment}
                session={enrollment.session}
                onClick={() => handleOpenDetail(enrollment)}
                onCancel={(sessionId) => handleCancel(sessionId, title)}
                onFeedback={(enr) => handleOpenFeedback(enr)}
                showActions={true}
              />
            )
          })}
        </div>
      )}

      {/* Detailed Enrollment View Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={selectedEnrollment?.sessionTitle || 'Enrollment Details'}>
        {selectedEnrollment && (() => {
          const title = selectedEnrollment.sessionTitle || selectedEnrollment.session?.title || 'Tutoring Session'
          const mentor = selectedEnrollment.mentorName || selectedEnrollment.session?.mentor?.fullName || 'Assigned Mentor'
          const subject = selectedEnrollment.subjectName || selectedEnrollment.session?.subject?.name || 'General'
          const status = resolveStatus(selectedEnrollment)
          const isCancelled = status === 'CANCELLED'
          const isCompleted = status === 'COMPLETED'
          const isEnrolled = status === 'ENROLLED'
          const feedbackSubmitted = !!selectedEnrollment.feedbackSubmitted
          const modalThumb = getSubjectThumbnail(subject, title)

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Hero Image Banner in Detail Modal */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '180px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#101424',
                }}
              >
                <img
                  src={modalThumb.url}
                  alt={modalThumb.alt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12, 15, 29, 0.95) 0%, rgba(12, 15, 29, 0.3) 60%)' }} />
                <div style={{ position: 'absolute', bottom: '14px', left: '16px', right: '16px' }}>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: 'var(--color-lilac)',
                      background: 'rgba(66, 96, 229, 0.35)',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      border: '1px solid rgba(120, 132, 215, 0.4)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {subject}
                  </span>
                  <h3 style={{ margin: '8px 0 0', fontSize: '1.3rem', color: '#fff' }}>
                    {title}
                  </h3>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
                <span className={`badge ${getStatusBadge(status)}`}>
                  Enrollment Status: {status}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-light-blue)' }}>{subject}</span>
              </div>

              {selectedEnrollment.sessionDescription && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Session Syllabus
                  </label>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'var(--color-soft-white)', fontSize: '0.92rem' }}>
                    {selectedEnrollment.sessionDescription}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Mentor</span>
                  <strong style={{ display: 'block', color: 'var(--color-soft-white)', marginTop: '2px' }}>{mentor}</strong>
                  {(selectedEnrollment.mentorEmail || selectedEnrollment.session?.mentor?.email) && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-light-blue)' }}>
                      {selectedEnrollment.mentorEmail || selectedEnrollment.session?.mentor?.email}
                    </span>
                  )}
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Scheduled Start</span>
                  <strong style={{ display: 'block', color: 'var(--color-soft-white)', marginTop: '2px' }}>
                    {formatDateTime(selectedEnrollment.sessionStartTime || selectedEnrollment.session?.startTime)}
                  </strong>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Scheduled End</span>
                  <strong style={{ display: 'block', color: 'var(--color-soft-white)', marginTop: '2px' }}>
                    {formatDateTime(selectedEnrollment.sessionEndTime || selectedEnrollment.session?.endTime)}
                  </strong>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Enrollment Date</span>
                  <strong style={{ display: 'block', color: 'var(--color-soft-white)', marginTop: '2px' }}>
                    {formatDateTime(selectedEnrollment.enrollmentDate)}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
                <div>
                  {isCancelled && (
                    <span style={{ color: '#fca5a5', fontSize: '0.88rem' }}>This enrollment has been cancelled</span>
                  )}
                  {isEnrolled && (
                    <button
                      type="button"
                      className="action-btn delete"
                      style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                      onClick={() => handleCancel(selectedEnrollment.sessionId || selectedEnrollment.id, title)}
                    >
                      Cancel Enrollment
                    </button>
                  )}
                  {isCompleted && !feedbackSubmitted && (
                    <button
                      type="button"
                      className="primary-btn"
                      style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', border: 'none' }}
                      onClick={() => {
                        setShowDetailModal(false)
                        handleOpenFeedback(selectedEnrollment)
                      }}
                    >
                      Give Feedback
                    </button>
                  )}
                  {isCompleted && feedbackSubmitted && (
                    <span style={{ color: '#34d399', fontSize: '0.88rem' }}>Feedback already provided</span>
                  )}
                </div>

                <button type="button" className="secondary-btn" onClick={() => setShowDetailModal(false)}>
                  Close
                </button>
              </div>
            </div>
          )
        })()}
      </Modal>

      {/* Submit Feedback Modal */}
      <Modal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} title="Submit Session Feedback">
        {feedbackEnrollment && (
          <form className="modal-form" onSubmit={handleSubmitFeedback}>
            <div style={{ padding: '12px 14px', background: 'rgba(66, 96, 229, 0.1)', borderRadius: '8px', border: '1px solid rgba(66, 96, 229, 0.25)', marginBottom: '8px' }}>
              <strong style={{ display: 'block', color: 'var(--color-soft-white)', fontSize: '0.95rem' }}>
                {feedbackEnrollment.sessionTitle || feedbackEnrollment.session?.title || 'Tutoring Session'}
              </strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-light-blue)' }}>
                Mentor: {feedbackEnrollment.mentorName || feedbackEnrollment.session?.mentor?.fullName || 'Faculty Mentor'}
              </span>
            </div>

            {/* Rating Selector */}
            <div className="field">
              <label style={{ display: 'block', marginBottom: '6px' }}>Rating (1–5 Stars)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.8rem',
                      cursor: 'pointer',
                      color: star <= feedbackRating ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)',
                      padding: '2px',
                      transition: 'transform 0.15s ease',
                    }}
                    onClick={() => setFeedbackRating(star)}
                    title={`${star} Star${star > 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
                <span style={{ marginLeft: '12px', fontSize: '0.9rem', color: '#fef08a', fontWeight: 600 }}>
                  Rating: {feedbackRating}/5
                </span>
              </div>
            </div>

            <div className="field">
              <label htmlFor="feedback-comment">Comments & Review</label>
              <textarea
                id="feedback-comment"
                rows="4"
                placeholder="Share your experience: teaching clarity, pace, depth of explanations, and suggestions..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
              <button type="button" className="secondary-btn" onClick={() => setShowFeedbackModal(false)}>
                Cancel
              </button>
              <button type="submit" className="primary-btn" disabled={submittingFeedback}>
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

export default MyEnrollments
