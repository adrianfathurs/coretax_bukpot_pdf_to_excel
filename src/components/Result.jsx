function Result({ results, onReset, mode }) {
  const successful = results.length
  const fileName = mode === 'unifikasi'
    ? 'BuktiPotong_Unifikasi_Rekap.xlsx'
    : 'BuktiPotong_PPh21_Rekap.xlsx'

  // Hitung totals berdasarkan mode
  let totalBruto = 0
  let totalDPP = 0
  let totalPPh = 0

  if (mode === 'unifikasi') {
    // Untuk Unifikasi, hitung DPP dan PPh
    totalDPP = results
      .reduce((sum, r) => sum + (r.dpp || 0), 0)

    totalPPh = results
      .reduce((sum, r) => sum + (r.pph || 0), 0)
  } else {
    // Untuk PPh21, hitung Bruto dan PPh dari r.data
    totalBruto = results
      .reduce((sum, r) => sum + ((r.data?.penghasilan_bruto || r.penghasilan_bruto) || 0), 0)

    totalPPh = results
      .reduce((sum, r) => sum + ((r.data?.pph_dipotong || r.pph_dipotong) || 0), 0)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num)
  }

  const getTitle = () => {
    return mode === 'unifikasi'
      ? 'Bukti Potong Unifikasi'
      : 'Bukti Potong PPh 21'
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
          File Excel telah otomatis terunduh dengan nama <strong>{fileName}</strong>
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

          {mode === 'unifikasi' ? (
            <>
              <div className="stat-item money">
                <div className="stat-label">Total DPP</div>
                <div className="stat-value">Rp {formatNumber(totalDPP)}</div>
              </div>

              <div className="stat-item money">
                <div className="stat-label">Total PPh</div>
                <div className="stat-value">Rp {formatNumber(totalPPh)}</div>
              </div>
            </>
          ) : (
            <>
              <div className="stat-item money">
                <div className="stat-label">Total Bruto</div>
                <div className="stat-value">Rp {formatNumber(totalBruto)}</div>
              </div>

              <div className="stat-item money">
                <div className="stat-label">Total PPh</div>
                <div className="stat-value">Rp {formatNumber(totalPPh)}</div>
              </div>
            </>
          )}
        </div>

        <button className="reset-button" onClick={onReset}>
          Proses File Lain
        </button>
      </div>
    </div>
  )
}

export default Result
