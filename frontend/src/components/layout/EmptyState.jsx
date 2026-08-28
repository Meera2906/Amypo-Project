function EmptyState({ message, ctaText, onCtaClick }) {
  return (
    <div className="empty-state card">
      <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔎</div>
      <p>{message}</p>
      {ctaText && onCtaClick && (
        <button type="button" className="primary-btn" onClick={onCtaClick}>
          {ctaText}
        </button>
      )}
    </div>
  )
}

export default EmptyState
