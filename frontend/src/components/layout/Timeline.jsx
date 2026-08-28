function Timeline({ activities = [] }) {
  return (
    <ul className="timeline">
      {activities.map((activity, index) => (
        <li key={`${activity.title}-${index}`} className="timeline-item">
          <div className="timeline-dot" />
          <div>
            <strong>{activity.title}</strong>
            <span>{activity.detail}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default Timeline
