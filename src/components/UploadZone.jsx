import { useState } from 'react'

function UploadZone({ onFileUpload }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = (file) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.zip')) {
      alert('Harap upload file ZIP yang berisi dokumen PDF Bukti Potong')
      return
    }

    onFileUpload(file)
  }

  return (
    <div className="upload-zone">
      <div
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>

        <h2>Upload File ZIP Bukti Potong</h2>

        <p>Drag & drop file ZIP di sini, atau</p>

        <label className="upload-button">
          Pilih File
          <input
            type="file"
            accept=".zip"
            onChange={handleFileInput}
            hidden
          />
        </label>

        <div className="upload-info">
          <p className="info-item">📁 Format: .ZIP</p>
          <p className="info-item">📄 Isi: Kumpulan PDF Bukti Potong</p>
          <p className="info-item">⚡ Proses: Cepat & Otomatis</p>
        </div>
      </div>
    </div>
  )
}

export default UploadZone
