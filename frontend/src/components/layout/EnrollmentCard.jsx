import { useState } from 'react'
import { getSubjectThumbnail, DEFAULT_SUBJECT_IMAGE, SUBJECT_IMAGE_MAP } from '../../utils/subjectImages'

export { SUBJECT_IMAGE_MAP }
export const DEFAULT_IMAGE = DEFAULT_SUBJECT_IMAGE

export const getCourseThumbnail = (subjectName = '', title = '') => {
  return getSubjectThumbnail(subjectName, title)
}

// Helper to calculate or derive realistic course metadata from enrollment/session
export const getCourseMetadata = (enrollment, session, isMentor = false) => {
  const rawStatus = (isMentor ? (session?.status || enrollment?.status) : (enrollment?.status || session?.status)) || 'ENROLLED'
  const status = rawStatus.toUpperCase()
  const isCompleted = status === 'COMPLETED' || status === 'ATTENDED'
  const isCancelled = status === 'CANCELLED' || status === 'DISCONTINUED'
  const isActive = status === 'ACTIVE'
  const isScheduled = status === 'SCHEDULED'

  // Calculate duration
  let durationStr = '2h 00m'
  const startTime = session?.startTime || enrollment?.sessionStartTime
  const endTime = session?.endTime || enrollment?.sessionEndTime
  if (startTime && endTime) {
    try {
      const diffMs = new Date(endTime) - new Date(startTime)
      const diffMinutes = Math.round(diffMs / (1000 * 60))
      if (diffMinutes > 0) {
        const hours = Math.floor(diffMinutes / 60)
        const mins = diffMinutes % 60
        durationStr = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim() : `${mins}m`
      }
    } catch (e) {
      durationStr = '2h 00m'
    }
  }

  // Derive stable modules and tasks count based on title/id
  const seed = (session?.id || enrollment?.sessionId || enrollment?.id || 1)
  const modulesCount = seed === 1 ? 10 : seed === 2 ? 12 : seed === 3 ? 8 : seed === 4 ? 6 : (seed % 5) + 8
  const tasksCount = Math.max(2, Math.round(modulesCount * 0.35))

  const currentEnrollment = session?.currentEnrollment !== undefined ? session.currentEnrollment : (enrollment?.currentEnrollment || 0)
  const maxCapacity = session?.maxCapacity || enrollment?.maxCapacity || 10

  // Determine progress percentage
  let progress = 0
  if (isMentor) {
    // For mentors, progress represents session seat capacity filled
    progress = Math.min(100, Math.round((currentEnrollment / maxCapacity) * 100))
  } else if (isCompleted) {
    progress = 100
  } else if (isCancelled) {
    progress = 0
  } else {
    // Consistent realistic progress for active enrolled courses
    progress = enrollment?.progress !== undefined
      ? enrollment.progress
      : seed === 1 ? 65 : seed === 2 ? 40 : seed === 5 ? 25 : 50
  }

  return {
    modulesCount,
    tasksCount,
    durationStr,
    progress,
    status,
    isActive,
    isScheduled,
    isCompleted,
    isCancelled,
    currentEnrollment,
    maxCapacity,
  }
}

function EnrollmentCard({ enrollment, session, onClick, onCancel, onFeedback, showActions = false, isMentor = false }) {
  const title = session?.title || enrollment?.sessionTitle || enrollment?.title || 'Tutoring Session'
  const subject = session?.subject?.name || enrollment?.subjectName || 'General'
  const mentor = session?.mentor?.fullName || enrollment?.mentorName || 'Faculty Mentor'

  const {
    modulesCount,
    tasksCount,
    durationStr,
    progress,
    status,
    isActive,
    isCompleted,
    isCancelled,
    currentEnrollment,
    maxCapacity,
  } = getCourseMetadata(enrollment, session, isMentor)

  const thumbnailData = getCourseThumbnail(subject, title)
  const [imgSrc, setImgSrc] = useState(thumbnailData.url)
  const [imgError, setImgError] = useState(false)

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true)
      setImgSrc(DEFAULT_IMAGE.url)
    }
  }

  return (
    <div
      className="enrollment-horizontal-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick && onClick()
        }
      }}
    >
      {/* Left side: Course Thumbnail (~38% width) */}
      <div className="card-thumb-wrapper">
        <img
          src={imgSrc}
          alt={thumbnailData.alt}
          className="card-thumb-image"
          onError={handleImageError}
          loading="lazy"
        />
        <div className="card-thumb-gradient" />
        
        {/* Status and Subject Pills on Thumbnail */}
        <div className="card-thumb-badge-row">
          <span
            className={`badge ${
              isMentor
                ? (status === 'ACTIVE' ? 'badge-active' : status === 'COMPLETED' ? 'badge-approved' : status === 'CANCELLED' ? 'badge-cancelled' : 'badge-scheduled')
                : (isCompleted ? 'badge-approved' : isCancelled ? 'badge-cancelled' : 'badge-active')
            }`}
            style={{ fontSize: '0.7rem', padding: '3px 8px', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
          >
            {isMentor
              ? (status.charAt(0) + status.slice(1).toLowerCase())
              : (isCompleted ? 'Completed' : isCancelled ? 'Cancelled' : 'Enrolled')}
          </span>
          <span className="card-subject-pill" title={subject}>
            {subject}
          </span>
        </div>
      </div>

      {/* Right side: Course Content, Metadata, and Progress */}
      <div className="card-content-wrapper">
        <div className="card-content-top">
          <div className="card-mentor-label" title={isMentor ? `Cohort capacity: ${currentEnrollment}/${maxCapacity}` : `Mentor: ${mentor}`}>
            <span className="mentor-dot" />
            <span className="mentor-name">
              {isMentor ? `Capacity: ${currentEnrollment} / ${maxCapacity} Enrolled` : mentor}
            </span>
          </div>

          <h4 className="card-course-title" title={title}>
            {title}
          </h4>
        </div>

        {/* Compact Metadata Row with Icons */}
        <div className="card-meta-row">
          {/* Lessons / Modules */}
          <div className="card-meta-item" title={`${modulesCount} Lessons / Modules`}>
            <svg
              className="card-meta-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>{modulesCount} Lessons</span>
          </div>

          {/* Assignments / Tasks OR Students count for mentor */}
          {isMentor ? (
            <div className="card-meta-item" title={`${currentEnrollment} of ${maxCapacity} seats filled`}>
              <svg
                className="card-meta-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>{currentEnrollment}/{maxCapacity} Students</span>
            </div>
          ) : (
            <div className="card-meta-item" title={`${tasksCount} Assignments / Tasks`}>
              <svg
                className="card-meta-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                <polyline points="13 13 15 15 19 11" />
              </svg>
              <span>{tasksCount} Tasks</span>
            </div>
          )}

          {/* Duration */}
          <div className="card-meta-item" title={`Duration: ${durationStr}`}>
            <svg
              className="card-meta-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 16 14" />
            </svg>
            <span>{durationStr}</span>
          </div>
        </div>

        {/* Enrollment Progress Bar */}
        <div className="card-progress-section">
          <div className="card-progress-header">
            <span className="card-progress-label">
              {isMentor
                ? 'Enrolled capacity'
                : isCompleted
                ? 'Course completed'
                : isCancelled
                ? 'Enrollment cancelled'
                : 'Progress'}
            </span>
            <span className="card-progress-percent">
              {isMentor
                ? `${progress}% (${currentEnrollment}/${maxCapacity})`
                : isCancelled
                ? '0%'
                : `${progress}%`}
            </span>
          </div>
          <div className="card-progress-track">
            <div
              className={`card-progress-fill ${
                isCompleted ? 'completed' : isCancelled ? 'cancelled' : 'active'
              }`}
              style={{ width: `${isCancelled ? 0 : progress}%` }}
            />
          </div>
        </div>

        {/* Optional Action Controls (e.g. for MyEnrollments page) */}
        {showActions && (
          <div className="card-actions-row" onClick={(e) => e.stopPropagation()}>
            {isCancelled ? (
              <span className="status-note cancelled">Cancelled</span>
            ) : isCompleted ? (
              enrollment?.feedbackSubmitted ? (
                <span className="status-note completed">Feedback Submitted</span>
              ) : (
                <button
                  type="button"
                  className="primary-btn feedback-cta-btn"
                  onClick={() => onFeedback && onFeedback(enrollment)}
                >
                  Give Feedback
                </button>
              )
            ) : (
              <button
                type="button"
                className="action-btn delete cancel-cta-btn"
                onClick={() => onCancel && onCancel(enrollment.sessionId || enrollment.id, title)}
              >
                Cancel Enrollment
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default EnrollmentCard
