const STAT_STYLES = [
  { gradient: 'linear-gradient(135deg, rgba(66, 96, 229, 0.35), rgba(28, 33, 171, 0.4))', border: 'rgba(66, 96, 229, 0.5)', glow: 'rgba(66, 96, 229, 0.4)', tag: '#4260e5' },
  { gradient: 'linear-gradient(135deg, rgba(120, 132, 215, 0.35), rgba(23, 32, 90, 0.45))', border: 'rgba(120, 132, 215, 0.5)', glow: 'rgba(120, 132, 215, 0.35)', tag: '#7884d7' },
  { gradient: 'linear-gradient(135deg, rgba(28, 33, 171, 0.4), rgba(61, 74, 160, 0.45))', border: 'rgba(181, 188, 239, 0.5)', glow: 'rgba(28, 33, 171, 0.45)', tag: '#1c21ab' },
  { gradient: 'linear-gradient(135deg, rgba(66, 96, 229, 0.45), rgba(120, 132, 215, 0.35))', border: 'rgba(66, 96, 229, 0.6)', glow: 'rgba(66, 96, 229, 0.5)', tag: '#b5bcef' },
]

function StatCards({ stats = [] }) {
  return (
    <div className="stat-grid">
      {stats.map((item, index) => {
        const style = STAT_STYLES[index % STAT_STYLES.length]
        return (
          <div
            key={item.label}
            className="stat-card"
            style={{
              background: style.gradient,
              borderColor: style.border,
              boxShadow: `0 12px 30px ${style.glow}, inset 0 1.5px 0.5px rgba(248, 249, 250, 0.35)`
            }}
          >
            <div className="stat-card-header">
              <span>{item.label}</span>
              <div className="stat-indicator" style={{ background: style.tag, boxShadow: `0 0 10px ${style.tag}` }} />
            </div>
            <strong>{item.value}</strong>
          </div>
        )
      })}
    </div>
  )
}

export default StatCards
