import { useState } from 'react'

const EVENT_ICONS = {
  SESSION: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  MENTOR: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  FEEDBACK: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  MILESTONE: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  DEFAULT: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
}

const TYPE_COLORS = {
  SESSION: { ring: '#4260e5', bg: 'rgba(66, 96, 229, 0.2)', text: '#93a5ff' },
  MENTOR: { ring: '#10b981', bg: 'rgba(16, 185, 129, 0.2)', text: '#6ee7b7' },
  FEEDBACK: { ring: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)', text: '#fcd34d' },
  MILESTONE: { ring: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.2)', text: '#c4b5fd' },
  DEFAULT: { ring: '#7884d7', bg: 'rgba(120, 132, 215, 0.2)', text: '#b5bcef' },
}

function Timeline({ activities = [] }) {
  const [filter, setFilter] = useState('ALL')

  const filteredActivities = filter === 'ALL'
    ? activities
    : activities.filter((a) => a.type === filter)

  return (
    <div className="activity-timeline-container">
      {/* Category filters */}
      <div className="timeline-filters" style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {['ALL', 'SESSION', 'MENTOR', 'MILESTONE'].map((f) => (
          <button
            key={f}
            type="button"
            className={`timeline-filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? 'var(--color-royal-blue)' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid ' + (filter === f ? 'var(--color-vivid-blue)' : 'var(--glass-border)'),
              color: filter === f ? '#fff' : 'var(--text-secondary)',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {f === 'ALL' ? 'All Activity' : f.charAt(0) + f.slice(1).toLowerCase() + 's'}
          </button>
        ))}
      </div>

      {filteredActivities.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '16px 0' }}>
          No activities match this filter.
        </div>
      ) : (
        <div className="vertical-timeline-track" style={{ position: 'relative', paddingLeft: '28px' }}>
          {/* Continuous vertical connector line */}
          <div
            className="timeline-vertical-line"
            style={{
              position: 'absolute',
              left: '11px',
              top: '12px',
              bottom: '16px',
              width: '2px',
              background: 'linear-gradient(180deg, #4260e5 0%, #7884d7 50%, rgba(66, 96, 229, 0.1) 100%)',
            }}
          />

          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredActivities.map((activity, index) => {
              const type = activity.type || 'DEFAULT'
              const colorInfo = TYPE_COLORS[type] || TYPE_COLORS.DEFAULT
              const icon = EVENT_ICONS[type] || EVENT_ICONS.DEFAULT

              return (
                <li
                  key={`${activity.title}-${index}`}
                  className="timeline-item-row"
                  style={{
                    position: 'relative',
                    background: 'rgba(18, 22, 45, 0.6)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                  }}
                >
                  {/* Glowing Node on the vertical line */}
                  <div
                    className="timeline-node-circle"
                    style={{
                      position: 'absolute',
                      left: '-28px',
                      top: '14px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: colorInfo.bg,
                      border: `2px solid ${colorInfo.ring}`,
                      boxShadow: `0 0 10px ${colorInfo.ring}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: colorInfo.ring,
                    }}
                  >
                    {icon}
                  </div>

                  {/* Header row with Type badge and Time */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: colorInfo.text,
                        background: colorInfo.bg,
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {activity.category || type}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {activity.time || 'Recent'}
                    </span>
                  </div>

                  {/* Activity title */}
                  <strong style={{ display: 'block', color: 'var(--color-soft-white)', fontSize: '0.95rem', marginBottom: '4px' }}>
                    {activity.title}
                  </strong>

                  {/* Activity detail text */}
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: '1.4' }}>
                    {activity.detail}
                  </p>

                  {/* Optional highlight badge */}
                  {activity.badge && (
                    <span
                      className={`badge ${activity.badgeClass || 'badge-scheduled'}`}
                      style={{ display: 'inline-block', marginTop: '8px', fontSize: '0.75rem' }}
                    >
                      {activity.badge}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Timeline
