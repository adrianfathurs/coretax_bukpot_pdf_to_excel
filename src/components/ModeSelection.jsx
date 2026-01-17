import { useState } from 'react'

function ModeSelection({ onSelectMode }) {
  const [hovered, setHovered] = useState(null)

  const modes = [
    {
      id: 'pph21',
      title: 'Bukti Potong PPh 21',
      description: 'Convert ZIP berisi PDF Bukti Potong PPh 21 (BP21) ke Excel',
      icon: '💼',
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'unifikasi',
      title: 'Bukti Potong PPh Unifikasi',
      description: 'Convert ZIP berisi PDF Bukti Potong PPh Unifikasi (BPU) ke Excel',
      icon: '📋',
      color: 'from-green-500 to-teal-600'
    }
  ]

  return (
    <div className="mode-selection">
      <div className="selection-header">
        <div className="selection-icon">📊</div>
        <h2>Pilih Jenis Bukti Potong</h2>
        <p>Pilih jenis bukti potong yang ingin Anda konversi ke Excel</p>
      </div>

      <div className="mode-cards">
        {modes.map((mode) => (
          <div
            key={mode.id}
            className={`mode-card ${hovered === mode.id ? 'hovered' : ''}`}
            onClick={() => onSelectMode(mode.id)}
            onMouseEnter={() => setHovered(mode.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="mode-icon">{mode.icon}</div>
            <h3>{mode.title}</h3>
            <p>{mode.description}</p>
            <div className="mode-arrow">→</div>
          </div>
        ))}
      </div>

      <div className="selection-info">
        <p>🔒 Semua proses dilakukan di browser • Data tidak dikirim ke server</p>
      </div>
    </div>
  )
}

export default ModeSelection
