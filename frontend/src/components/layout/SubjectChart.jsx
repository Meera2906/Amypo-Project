function SubjectChart({ data = [] }) {
  const maxCount = Math.max(...data.map((item) => Number(item.count || 0)), 1)

  return (
    <div className="card">
      {data.map((item) => (
        <div key={item.name} className="chart-row">
          <div className="chart-label">{item.name}</div>
          <div className="chart-track">
            <div
              className="chart-fill"
              style={{ width: `${(Number(item.count || 0) / maxCount) * 100}%` }}
            />
          </div>
          <div className="chart-label" style={{ width: '32px', textAlign: 'right' }}>
            {item.count}
          </div>
        </div>
      ))}
    </div>
  )
}

export default SubjectChart
