function Processing({ progress }) {
  const { percentage, message, current, total } = progress

  return (
    <div className="processing">
      <div className="processing-card">
        <div className="processing-icon">
          <div className="spinner"></div>
        </div>

        <h2>Memproses File...</h2>

        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="progress-percentage">{percentage}%</div>
        </div>

        <p className="progress-message">{message}</p>

        {total > 0 && (
          <div className="progress-stats">
            <p>Memproses: <strong>{current}</strong> dari <strong>{total}</strong> PDF</p>
          </div>
        )}

        <div className="processing-steps">
          <div className={`step ${percentage >= 10 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Ekstrak ZIP</span>
          </div>
          <div className={`step ${percentage >= 20 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Baca PDF</span>
          </div>
          <div className={`step ${percentage >= 90 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Buat Excel</span>
          </div>
          <div className={`step ${percentage >= 100 ? 'active' : ''}`}>
            <span className="step-number">4</span>
            <span className="step-label">Download</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Processing
