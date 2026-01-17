function Error({ message, onReset }) {
  return (
    <div className="error">
      <div className="error-card">
        <div className="error-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>

        <h2>Terjadi Kesalahan</h2>

        <p className="error-message">{message}</p>

        <div className="error-tips">
          <p><strong>Tips:</strong></p>
          <ul>
            <li>Pastikan file ZIP berisi dokumen PDF Bukti Potong yang valid</li>
            <li>File PDF tidak boleh dipassword</li>
            <li>Coba ekstrak ZIP dan buka PDF manual untuk memastikan bisa dibaca</li>
            <li>File ZIP tidak boleh corrupt</li>
          </ul>
        </div>

        <button className="retry-button" onClick={onReset}>
          Coba Lagi
        </button>
      </div>
    </div>
  )
}

export default Error
