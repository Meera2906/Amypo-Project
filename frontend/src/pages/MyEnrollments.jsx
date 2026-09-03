import { useEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import Modal from '../components/layout/Modal'
import { getMyEnrollments, cancelEnrollment } from '../services/enrollmentService'
import { submitFeedback } from '../services/feedbackService'

function MyEnrollments() {
  const user = useSelector((state) => state.auth.user)
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

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
      return stored?.id || 1
    } catch (e) {
      return 1
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
      setEnrollments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      setMessage({ type: 'error', text: 'Unable to load your enrollments.' })
    } finally {
      setLoading(false)
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
      await loadData()
    } catch (error) {
      console.error(error)
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
    if (!feedbackEnrollment?.sessionId) return

    try {
      setSubmittingFeedback(true)
      await submitFeedback({
        learnerId,
        sessionId: feedbackEnrollment.sessionId,
        rating: feedbackRating,
        comment: feedbackComment.trim(),
      })

      setMessage({ type: 'success', text: 'Thank you! Your feedback has been submitted successfully.' })
      setShowFeedbackModal(false)

      // Update local enrollment state
      setEnrollments((prev) =>
        prev.map((e) => (e.id === feedbackEnrollment.id ? { ...e, feedbackSubmitted: true } : e))
      )
      if (selectedEnrollment?.id === feedbackEnrollment.id) {
        setSelectedEnrollment((prev) => ({ ...prev, feedbackSubmitted: true }))
      }
    } catch (err) {
      console.error(err)
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
      <div className="page-header">
        <h2>My Enrollments</h2>
        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Your enrolled tutoring sessions, attendance milestones, and peer feedback
        </p>
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

      <div className="session-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
        {enrollments.map((enrollment) => {
          const title = enrollment.sessionTitle || enrollment.session?.title || 'Tutoring Session'
          const mentor = enrollment.mentorName || enrollment.session?.mentor?.fullName || 'Assigned Mentor'
          const subject = enrollment.subjectName || enrollment.session?.subject?.name || 'General'
          const status = enrollment.status || 'ENROLLED'
          const isAttendedOrEnrolled = status === 'ENROLLED' || status === 'ATTENDED'
          const feedbackGiven = enrollment.feedbackSubmitted

          return (
            <div
              key={enrollment.id}
              className="session-card"
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                padding: '22px',
                position: 'relative',
                transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onClick={() => handleOpenDetail(enrollment)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <span className={`badge ${status === 'ENROLLED' ? 'badge-active' : status === 'ATTENDED' ? 'badge-approved' : 'badge-cancelled'}`}>
                  {status}
                </span>
                <span
                  style={{
                    fontSize: '0.74rem',
                    color: 'var(--color-light-blue)',
                    background: 'rgba(66, 96, 229, 0.15)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(66, 96, 229, 0.3)',
                  }}
                >
                  {subject}
                </span>
              </div>

              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-soft-white)' }}>
                {title}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.86rem', color: 'var(--color-soft-white)' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Mentor: </span>
                  <strong>{mentor}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Session Time: </span>
                  <span>{formatDateTime(enrollment.sessionStartTime)}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Enrolled Date: </span>
                  <span>{formatDateTime(enrollment.enrollmentDate)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  marginTop: 'auto',
                  borderTop: '1px solid var(--glass-border)',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-light-blue)',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                  }}
                  onClick={() => handleOpenDetail(enrollment)}
                >
                  View Details &rarr;
                </button>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {feedbackGiven ? (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#34d399',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      ✓ Feedback Submitted
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="action-btn"
                      style={{
                        background: 'rgba(245, 158, 11, 0.2)',
                        color: '#fcd34d',
                        borderColor: 'rgba(245, 158, 11, 0.4)',
                        padding: '4px 10px',
                        fontSize: '0.8rem',
                      }}
                      onClick={() => handleOpenFeedback(enrollment)}
                    >
                      ★ Submit Feedback
                    </button>
                  )}

                  {status === 'ENROLLED' && (
                    <button
                      className="action-btn delete"
                      type="button"
                      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                      onClick={() => handleCancel(enrollment.sessionId || enrollment.session?.id, title)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detailed Enrollment View Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={selectedEnrollment?.sessionTitle || 'Enrollment Details'}>
        {selectedEnrollment && (() => {
          const title = selectedEnrollment.sessionTitle || selectedEnrollment.session?.title || 'Tutoring Session'
          const mentor = selectedEnrollment.mentorName || selectedEnrollment.session?.mentor?.fullName || 'Assigned Mentor'
          const subject = selectedEnrollment.subjectName || selectedEnrollment.session?.subject?.name || 'General'
          const status = selectedEnrollment.status || 'ENROLLED'
          const feedbackGiven = selectedEnrollment.feedbackSubmitted

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
                <span className={`badge ${status === 'ENROLLED' ? 'badge-active' : status === 'ATTENDED' ? 'badge-approved' : 'badge-cancelled'}`}>
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
                  {selectedEnrollment.mentorEmail && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-light-blue)' }}>{selectedEnrollment.mentorEmail}</span>
                  )}
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Start Time</span>
                  <strong style={{ display: 'block', color: 'var(--color-soft-white)', marginTop: '2px' }}>
                    {formatDateTime(selectedEnrollment.sessionStartTime)}
                  </strong>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>End Time</span>
                  <strong style={{ display: 'block', color: 'var(--color-soft-white)', marginTop: '2px' }}>
                    {formatDateTime(selectedEnrollment.sessionEndTime)}
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
                  {!feedbackGiven ? (
                    <button
                      type="button"
                      className="primary-btn"
                      style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', border: 'none' }}
                      onClick={() => {
                        setShowDetailModal(false)
                        handleOpenFeedback(selectedEnrollment)
                      }}
                    >
                      ★ Rate & Submit Feedback
                    </button>
                  ) : (
                    <span style={{ color: '#34d399', fontSize: '0.88rem' }}>✓ Feedback already provided</span>
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
      <Modal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} title="Submit Mentor Feedback">
        {feedbackEnrollment && (
          <form className="modal-form" onSubmit={handleSubmitFeedback}>
            <div style={{ padding: '12px 14px', background: 'rgba(66, 96, 229, 0.1)', borderRadius: '8px', border: '1px solid rgba(66, 96, 229, 0.25)', marginBottom: '8px' }}>
              <strong style={{ display: 'block', color: 'var(--color-soft-white)', fontSize: '0.95rem' }}>
                {feedbackEnrollment.sessionTitle || 'Tutoring Session'}
              </strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-light-blue)' }}>
                Mentor: {feedbackEnrollment.mentorName || 'Faculty Mentor'}
              </span>
            </div>

            {/* Star rating selector */}
            <div className="field">
              <label style={{ display: 'block', marginBottom: '6px' }}>Mentor Rating (1 to 5 Stars)</label>
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
                  {feedbackRating === 5 && '5 - Outstanding'}
                  {feedbackRating === 4 && '4 - Very Good'}
                  {feedbackRating === 3 && '3 - Good / Satisfactory'}
                  {feedbackRating === 2 && '2 - Needs Improvement'}
                  {feedbackRating === 1 && '1 - Poor Experience'}
                </span>
              </div>
            </div>

            <div className="field">
              <label htmlFor="feedback-comment">Detailed Comments & Review</label>
              <textarea
                id="feedback-comment"
                rows="4"
                placeholder="Share your experience: teaching clarity, helpfulness, pacing, and suggestions..."
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
                {submittingFeedback ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

export default MyEnrollments
