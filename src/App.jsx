import { useState, useEffect } from 'react'
import './App.css'
import UploadZone from './components/UploadZone'
import Processing from './components/Processing'
import Result from './components/Result'
import Error from './components/Error'
import { parsePDFsFromZip } from './utils/pdfParser'
import { generateExcel } from './utils/excelGenerator'

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or system preference
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) return saved === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState({ percentage: 0, message: '', current: 0, total: 0 })
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
    // Save to localStorage
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const handleFileUpload = async (file) => {
    setStatus('processing')
    setProgress({ percentage: 0, message: 'Memuat file ZIP...', current: 0, total: 0 })

    try {
      // Parse PDFs
      const parseResults = await parsePDFsFromZip(file, setProgress)

      if (parseResults.length === 0) {
        throw new Error('Tidak ada file PDF ditemukan dalam arsip ZIP')
      }

      // Generate Excel
      setProgress(prev => ({ ...prev, percentage: 95, message: 'Membuat file Excel...' }))
      const blob = await generateExcel(parseResults)

      // Auto download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'BuktiPotong_Rekap.xlsx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Show results
      setResults(parseResults)
      setProgress(prev => ({ ...prev, percentage: 100, message: 'Selesai!' }))
      setStatus('complete')
    } catch (err) {
      console.error('Error processing file:', err)
      setError(err.message)
      setStatus('error')
    }
  }

  const handleReset = () => {
    setStatus('idle')
    setProgress({ percentage: 0, message: '', current: 0, total: 0 })
    setResults(null)
    setError(null)
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">📊</span>
            <div>
              <h1>Bukti Potong Converter</h1>
              <p>Convert ZIP Bukti Potong ke Excel secara instan</p>
            </div>
          </div>
          <button
            className="dark-mode-toggle"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="App-main">
        {status === 'idle' && (
          <UploadZone onFileUpload={handleFileUpload} />
        )}

        {status === 'processing' && (
          <Processing progress={progress} />
        )}

        {status === 'complete' && (
          <Result results={results} onReset={handleReset} />
        )}

        {status === 'error' && (
          <Error message={error} onReset={handleReset} />
        )}
      </main>

      <footer className="App-footer">
        <p>🔒 Privasi Terjaga • Semua proses di browser • Data tidak dikirim ke server</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.8 }}>Idea by Wahyu Budi Lestari. Powered by AFS</p>
      </footer>
    </div>
  )
}

export default App
