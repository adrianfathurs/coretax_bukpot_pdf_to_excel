import * as XLSX from 'xlsx'

/**
 * Generate Excel file dari data PPh Unifikasi yang sudah di-parse
 */
export async function generateExcel(parseResults) {
  if (!parseResults || parseResults.length === 0) {
    throw new Error('Tidak ada PDF yang berhasil di-parse')
  }

  // Definisi kolom untuk PPh Unifikasi
  const columns = [
    { header: 'Nomor Bukti Potong', key: 'nomor_bukti', width: 25 },
    { header: 'Masa Pajak', key: 'masa_pajak', width: 15 },
    { header: 'NPWP/NIK', key: 'npwp_nik', width: 25 },
    { header: 'Nama', key: 'nama', width: 35 },
    { header: 'NITKU', key: 'nitku', width: 15 },
    { header: 'Kode Objek Pajak', key: 'kode_objek_pajak', width: 20 },
    { header: 'Objek Pajak', key: 'objek_pajak', width: 30 },
    { header: 'DPP (Rp)', key: 'dpp', width: 20 },
    { header: 'Tarif', key: 'tarif', width: 12 },
    { header: 'PPh (Rp)', key: 'pph', width: 20 },
    { header: 'Nomor Dokumen', key: 'nomor_dokumen', width: 25 },
    { header: 'Nama Pemotong', key: 'nama_pemotong', width: 35 },
    { header: 'Tanggal Pemotongan', key: 'tanggal_pemotong', width: 20 }
  ]

  // Transform data ke array of objects
  const worksheetData = parseResults.map(result => {
    const row = {}

    columns.forEach(col => {
      row[col.header] = result[col.key] || ''
    })

    return row
  })

  // Buat worksheet
  const worksheet = XLSX.utils.json_to_sheet(worksheetData)

  // Set column widths
  worksheet['!cols'] = columns.map(col => ({ wch: col.width }))

  // Buat workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bukti Potong Unifikasi')

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

  // Create blob
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  return blob
}
