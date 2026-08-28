function CapacityBar({ current = 0, max = 1 }) {
  const ratio = max === 0 ? 0 : (current / max) * 100
  let colorClass = 'bar-green'

  if (ratio >= 90) colorClass = 'bar-red'
  else if (ratio >= 70) colorClass = 'bar-amber'

  return (
    <div className="capacity-wrap">
      <div className="meta-row">
        <span>Capacity</span>
        <strong>{current}/{max}</strong>
      </div>
      <div className="capacity-bar">
        <div className={`bar-fill ${colorClass}`} style={{ width: `${Math.min(ratio, 100)}%` }} />
      </div>
    </div>
  )
}

export default CapacityBar
