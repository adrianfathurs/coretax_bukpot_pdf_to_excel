import * as pdfjsLib from 'pdfjs-dist'
import jszip from 'jszip'

// Set worker menggunakan import dinamik dari node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

/**
 * Mapping Kode Sistem (Kode Objek Pajak) ke Nama Legal (Nama Objek Pajak)
 * Untuk PPh Unifikasi (Pasal 22)
 */
const KODE_SISTEM_MAP = {
  '22-100-01': 'Pembelian barang oleh Bendahara Pemerintah',
  '22-100-02': 'Pembelian barang oleh BUMN/BUMD',
  '22-100-11': 'Impor barang melalui DJBC',
  '22-100-13': 'Pembelian komoditas tambang dari pemegang IUP'
}

/**
 * Parse data dari teks PDF PPh Unifikasi menggunakan regex patterns
 */
function extractDataFromText(text) {
  // Debug: log raw text
  console.log('=== Raw PDF Text (first 2500 chars) ===')
  console.log(text.substring(0, 2500))

  // JANGAN terlalu aggressive cleanup, karena PDF punya spasi penting
  // Hanya ganti multiple newlines dengan single space
  const cleanText = text.replace(/[\r\n]+/g, ' ').trim()

  // Helper function untuk extract field
  const extractField = (text, patterns) => {
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        console.log(`Match found:`, match[1])
        return match[1].trim()
      }
    }
    return ''
  }

  const data = {
    // Header: Value di bawah label header
    // Setelah semua header labels (PEMUNGUTAN), value-nya muncul berurutan
    // Pola: ... PEMUNGUTAN [space] NOMOR_VALUE [space] MASA_VALUE [space] ...
    nomor_bukti: extractField(cleanText, [
      /PEMUNGUTAN\s+([A-Z0-9]+)\s+(\d{2}-\d{4})/i
    ]),

    masa_pajak: extractField(cleanText, [
      /PEMUNGUTAN\s+[A-Z0-9]+\s+(\d{2}-\d{4})/i
    ]),

    // Bagian A
    npwp_nik: extractField(cleanText, [
      /A\.1\s+[^:]+?:\s*([\d.]+)/i
    ]),
    nama: extractField(cleanText, [
      /A\.2\s+NAMA\s*[^:]*?:\s*([A-Z][A-Z\s]+?)(?=\s+A\.3|\s+B\.)/i
    ]),
    nitku: extractField(cleanText, [
      /A\.3\s+[^:]+?:\s*([\d.]+)/i
    ]),

    // Bagian B - Table values (B.3, B.4, B.5, B.6, B.7 di header, value di bawah berurutan)
    // Struktur: "B.3 B.4 B.5 B.6 B.7 [newline] 22-100-13 Pembelian... 5.919.903.529 1.5 88.798.553"
    kode_objek_pajak: extractField(cleanText, [
      /B\.3[^B]*?(\d{2}-\d{3}-\d{2})/i
    ]),
    dpp: extractField(cleanText, [
      /Pembelian[\s\S]+?\s+([\d.,]+)\s+[\d.,]+\s+[\d.,]+/i
    ]),
    tarif: extractField(cleanText, [
      /Pembelian[\s\S]+?\s+[\d.,]+\s+([\d.,]+)\s+[\d.,]+/i
    ]),
    pph: extractField(cleanText, [
      /Pembelian[\s\S]+?\s+[\d.,]+\s+[\d.,]+\s+([\d.,]+)/i
    ]),

    // B.9 - Nomor Dokumen
    nomor_dokumen: extractField(cleanText, [
      /B\.9\s+Nomor\s+Dokumen\s*:\s*([0-9]+)/i
    ]),

    // Bagian C
    nama_pemotong: extractField(cleanText, [
      /C\.3\s+NAMA\s+[^:]+?:\s*([A-Z][A-Z\s]+?)(?=\s+C\.4|\s+IDENTITAS)/i
    ]),

    tanggal_pemotong: extractField(cleanText, [
      /C\.4\s+TANGGAL\s+[^:]+?:\s*(\d{1,2}\s+\w+\s+\d{4})/i,
      /C\.4\s+[^:]+?:\s*(\d{1,2}\s+\w+\s+\d{4})/i
    ])
  }

  // Debug: log extracted data
  console.log('=== Extracted Data ===')
  console.log(JSON.stringify(data, null, 2))

  // Cleanup nama - remove trailing section label
  if (data.nama) {
    data.nama = data.nama.replace(/\s+A\s*\.?\d*$/, '').trim()
  }

  // Lookup nama objek pajak dari kode objek pajak menggunakan mapping
  if (data.kode_objek_pajak) {
    data.objek_pajak = KODE_SISTEM_MAP[data.kode_objek_pajak] || ''
  } else {
    data.objek_pajak = ''
  }

  // Cleanup DPP and PPh - remove dots (Indonesian format uses dots as thousand separators)
  if (data.dpp) {
    data.dpp = parseFloat(data.dpp.replace(/\./g, '').replace(/,/g, '.')) || 0
  }
  if (data.pph) {
    data.pph = parseFloat(data.pph.replace(/\./g, '').replace(/,/g, '.')) || 0
  }

  return data
}

/**
 * Parse satu file PDF
 */
async function parsePDF(arrayBuffer, fileName) {
  try {
    const loadingTask = pdfjsLib.getDocument(arrayBuffer)
    const pdf = await loadingTask.promise

    let fullText = ''

    // Ambil teks dari semua halaman
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map(item => item.str).join(' ')
      fullText += pageText + ' '
    }

    // Ekstrak data
    const data = extractDataFromText(fullText)

    return {
      fileName,
      success: Object.values(data).some(v => v !== ''),
      data
    }
  } catch (error) {
    console.error(`Error parsing PDF ${fileName}:`, error)
    return {
      fileName,
      success: false,
      error: error.message
    }
  }
}

/**
 * Parse multiple PDFs dari ZIP file
 */
export async function parsePDFsFromZip(file, onProgress) {
  const zip = new jszip()

  try {
    // Baca ZIP file
    onProgress({ percentage: 10, message: 'Membuka file ZIP...', current: 0, total: 0 })

    const zipContents = await zip.loadAsync(file)

    // Cari semua file PDF
    const pdfFiles = []
    zipContents.forEach((relativePath, zipEntry) => {
      if (zipEntry.name.toLowerCase().endsWith('.pdf') && !zipEntry.dir) {
        pdfFiles.push(zipEntry)
      }
    })

    if (pdfFiles.length === 0) {
      throw new Error('Tidak ada file PDF ditemukan dalam arsip ZIP')
    }

    onProgress({
      percentage: 20,
      message: `Ditemukan ${pdfFiles.length} file PDF`,
      current: 0,
      total: pdfFiles.length
    })

    // Parse setiap PDF
    const results = []
    const progressStep = 70 / pdfFiles.length

    for (let i = 0; i < pdfFiles.length; i++) {
      const pdfFile = pdfFiles[i]

      onProgress({
        percentage: 20 + (i * progressStep),
        message: `Memproses ${pdfFile.name}...`,
        current: i + 1,
        total: pdfFiles.length
      })

      const arrayBuffer = await pdfFile.async('arraybuffer')
      const result = await parsePDF(arrayBuffer, pdfFile.name)
      results.push(result)
    }

    // Filter hanya yang berhasil
    const successfulParses = results.filter(r => r.success).map(r => ({
      fileName: r.fileName,
      ...r.data
    }))

    if (successfulParses.length === 0) {
      throw new Error('Tidak ada PDF yang berhasil di-parse')
    }

    return successfulParses
  } catch (error) {
    throw error
  }
}
