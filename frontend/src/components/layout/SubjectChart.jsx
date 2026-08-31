const CHART_GRADIENTS = [
  'linear-gradient(90deg, #4260e5, #7884d7)',
  'linear-gradient(90deg, #1c21ab, #4260e5)',
  'linear-gradient(90deg, #3d4aa0, #b5bcef)',
  'linear-gradient(90deg, #17205a, #7884d7)',
]

function SubjectChart({ data = [] }) {
  const maxCount = Math.max(...data.map((item) => Number(item.count || 0)), 1)

  return (
    <div className="chart-container">
      {data.map((item, idx) => (
        <div key={item.name} className="chart-row">
          <div className="chart-label">{item.name}</div>
          <div className="chart-track">
            <div
              className="chart-fill"
              style={{
                width: `${(Number(item.count || 0) / maxCount) * 100}%`,
                background: CHART_GRADIENTS[idx % CHART_GRADIENTS.length],
                boxShadow: '0 0 14px rgba(66, 96, 229, 0.5)'
              }}
            />
          </div>
          <div className="chart-label" style={{ width: '36px', textAlign: 'right', fontWeight: '700', color: '#b5bcef' }}>
            {item.count}
          </div>
        </div>
      ))}
    </div>
  )
}

export default SubjectChart
