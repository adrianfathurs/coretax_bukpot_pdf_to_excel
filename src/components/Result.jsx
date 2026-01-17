function Result({ results, onReset }) {
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length

  const totalBruto = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + (r.data?.penghasilan_bruto || 0), 0)

  const totalPPh = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + (r.data?.pph_dipotong || 0), 0)

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num)
  }

  return (
    <div className="result">
      <div className="result-card">
        <div className="success-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>

        <h2>Proses Selesai!</h2>

        <p className="result-message">
          File Excel telah otomatis terunduh dengan nama <strong>BuktiPotong_Rekap.xlsx</strong>
        </p>

        <div className="result-stats">
          <div className="stat-item">
            <div className="stat-label">Total PDF</div>
            <div className="stat-value">{results.length}</div>
          </div>

          <div className="stat-item success">
            <div className="stat-label">Berhasil</div>
            <div className="stat-value">{successful}</div>
          </div>

          {failed > 0 && (
            <div className="stat-item error">
              <div className="stat-label">Gagal</div>
              <div className="stat-value">{failed}</div>
            </div>
          )}

          <div className="stat-item money">
            <div className="stat-label">Total Bruto</div>
            <div className="stat-value">Rp {formatNumber(totalBruto)}</div>
          </div>

          <div className="stat-item money">
            <div className="stat-label">Total PPh</div>
            <div className="stat-value">Rp {formatNumber(totalPPh)}</div>
          </div>
        </div>

        <button className="reset-button" onClick={onReset}>
          Proses File Lain
        </button>
      </div>
    </div>
  )
}

export default Result
