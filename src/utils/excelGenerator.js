import * as XLSX from 'xlsx'

/**
 * Generate Excel file dari parsed PDF data
 */
export async function generateExcel(parsedResults) {
  // Filter successful results
  const successfulParses = parsedResults.filter(result => result.success)

  if (successfulParses.length === 0) {
    throw new Error('Tidak ada PDF yang berhasil di-parse')
  }

  // Create worksheet data
  const worksheetData = prepareWorksheetData(successfulParses)

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

  // Set column widths
  setColumnWidths(worksheet)

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bukti Potong')

  // Generate Excel buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

  // Create blob
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
}

/**
 * Prepare data array untuk worksheet
 */
function prepareWorksheetData(successfulParses) {
  // Header row
  const data = [
    [
      'Nomor Bukti Pemotongan',
      'Masa Pajak',
      'Sifat Pemotongan',
      'Status Bukti Pemotongan',
      'NIK Penerima Penghasilan',
      'Nama Penerima Penghasilan',
      'Kode Objek Pajak',
      'Nama Objek Pajak',
      'Penghasilan Bruto',
      'PPh Dipotong',
      'Nama Pemotong',
      'Tanggal Pemotong PPh'
    ]
  ]

  // Data rows
  for (const parseResult of successfulParses) {
    const item = parseResult.data

    data.push([
      item.nomor_bukti || '',
      item.masa_pajak || '',
      item.sifat_pemotongan || '',
      item.status_bukti || '',
      item.nik || '',
      item.nama_penerima || '',
      item.kode_objek_pajak || '',
      item.nama_objek_pajak || '',
      item.penghasilan_bruto || 0,
      item.pph_dipotong || 0,
      item.nama_pemotong || '',
      item.tanggal_pemotong || ''
    ])
  }

  // Summary row
  const totalBruto = successfulParses.reduce((sum, item) => sum + (item.data.penghasilan_bruto || 0), 0)
  const totalPPh = successfulParses.reduce((sum, item) => sum + (item.data.pph_dipotong || 0), 0)

  data.push([])
  data.push(['', '', '', '', '', '', '', 'TOTAL:', totalBruto, totalPPh, '', ''])

  return data
}

/**
 * Set column widths untuk readability
 */
function setColumnWidths(worksheet) {
  worksheet['!cols'] = [
    { wch: 20 }, // Nomor Bukti Pemotongan
    { wch: 12 }, // Masa Pajak
    { wch: 15 }, // Sifat Pemotongan
    { wch: 15 }, // Status Bukti Pemotongan
    { wch: 25 }, // NIK Penerima Penghasilan
    { wch: 35 }, // Nama Penerima Penghasilan
    { wch: 15 }, // Kode Objek Pajak
    { wch: 60 }, // Nama Objek Pajak
    { wch: 18 }, // Penghasilan Bruto
    { wch: 15 }, // PPh Dipotong
    { wch: 40 }, // Nama Pemotong
    { wch: 20 }  // Tanggal Pemotong PPh
  ]
}
