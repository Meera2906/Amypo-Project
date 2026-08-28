function StatCards({ stats = [] }) {
  return (
    <div className="stat-grid">
      {stats.map((item) => (
        <div key={item.label} className="stat-card">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  )
}

export default StatCards
