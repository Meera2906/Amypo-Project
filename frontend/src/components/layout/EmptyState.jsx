function EmptyState({ message, ctaText, onCtaClick }) {
  return (
    <div className="empty-state card">
      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-light-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
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
