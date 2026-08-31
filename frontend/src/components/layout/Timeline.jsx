const TIMELINE_DOT_COLORS = ['#4260e5', '#7884d7', '#1c21ab', '#b5bcef']

function Timeline({ activities = [] }) {
  return (
    <ul className="timeline">
      {activities.map((activity, index) => {
        const color = TIMELINE_DOT_COLORS[index % TIMELINE_DOT_COLORS.length]
        return (
          <li key={`${activity.title}-${index}`} className="timeline-item">
            <div
              className="timeline-dot"
              style={{
                background: color,
                boxShadow: `0 0 12px ${color}`
              }}
            />
            <div>
              <strong>{activity.title}</strong>
              <span>{activity.detail}</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default Timeline
