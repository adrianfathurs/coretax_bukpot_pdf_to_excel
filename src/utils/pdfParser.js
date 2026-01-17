import * as pdfjsLib from 'pdfjs-dist'
import jszip from 'jszip'

// Set worker menggunakan import dinamik dari node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

/**
 * Parse data dari teks PDF menggunakan regex patterns
 */
function extractDataFromText(text) {
  // Jangan terlalu aggressive cleanup, karena PDF punya spasi penting
  const cleanText = text.replace(/\s+/g, ' ').trim()

  // Special handling untuk header fields yang muncul berurutan
  // Pattern: LABEL1 LABEL2 LABEL3 LABEL4 VALUE1 VALUE2 VALUE3 VALUE4
  const headerMatch = cleanText.match(/NOMOR BUKTI PEMOTONGAN MASA PAJAK SIFAT PEMOTONGAN STATUS BUKTI PEMOTONGAN ([A-Z0-9]+) (\d{2}-\d{4}) (TIDAK FINAL|FINAL|BERSIFAT FINAL|TIDAK BERSIFAT FINAL) (NORMAL|PBK|SATUAN KERJA)/i)

  const data = {
    // Gunakan hasil dari header match jika ada
    nomor_bukti: headerMatch ? headerMatch[1] : extractField(cleanText, [/No\.? Bukti Pemotongan ([A-Z0-9]+)/i]),
    masa_pajak: headerMatch ? headerMatch[2] : extractField(cleanText, [/Masa Pajak (\d{2}-\d{4})/i]),
    sifat_pemotongan: headerMatch ? headerMatch[3] : extractField(cleanText, [/Sifat Pemotongan ([A-Z\s]+?) Status/i]),
    status_bukti: headerMatch ? headerMatch[4] : extractField(cleanText, [/Status Bukti Pemotongan ([A-Z]+?) A/i]),
    nik: extractField(cleanText, [
      /A\.1\s+NIK\/NPWP\s+:?\s*([\d.]+)/i,
      /NIK\/NPWP\s+:?\s*([\d.]+)/i
    ]),
    nama_penerima: extractField(cleanText, [
      /A\.2\s+Nama\s+:?\s*([A-Z][A-Z\s\.]+?)(?=\s+A\.3|$)/i
    ]),
    // Untuk tabel, cari pola spesifik di baris data
    penghasilan_bruto: extractNumber(cleanText, [
      // Pola: "Imbalan... [spasi] [angka bruto] [spasi] [DPP] [spasi] [TARIF] [spasi] [PPh]"
      /Imbalan kepada Pemberi Jasa[^\d]*?([\d.,]+)\s+[\d.]+\s+[\d.]+\s+[\d.]+/i
    ]),
    pph_dipotong: extractNumber(cleanText, [
      // Pola: "Imbalan... [bruto] [DPP] [tarif] [PPh]"
      /Imbalan kepada Pemberi Jasa[^\d]*?[\d.,]+\s+[\d.]+\s+[\d.]+\s+([\d.,]+)/i
    ]),
    nama_pemotong: extractField(cleanText, [
      /C\.3\s+Nama Pemotong\s+:?\s*([A-Z][A-Z\s\.,]+?)(?=\s+C\.4|$)/i,
      /Nama Pemotong\s+:?\s*([A-Z][A-Z\s\.,]+)/i
    ]),
    tanggal_pemotong: extractField(cleanText, [
      /C\.4\s+Tanggal\s+:?\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
      /Tanggal\s+:?\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i
    ])
  }

  // Clean up values
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      data[key] = data[key].trim()
    }
  })

  return data
}

/**
 * Extract field menggunakan multiple regex patterns
 */
function extractField(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  return ''
}

/**
 * Extract dan parse number field
 */
function extractNumber(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const cleaned = match[1].replace(/\./g, '').replace(',', '.')
      const num = parseFloat(cleaned)
      return isNaN(num) ? 0 : num
    }
  }
  return 0
}

/**
 * Parse single PDF file
 */
async function parsePDF(arrayBuffer, filename) {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise

    let fullText = ''

    // Extract text dari semua halaman
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map(item => item.str).join(' ')
      fullText += pageText + '\n'
    }

    // Debug: log extracted text
    console.log(`=== Text from ${filename} ===`)
    console.log(fullText.substring(0, 800)) // Log first 800 chars

    const data = extractDataFromText(fullText)

    // Debug: log extracted data
    console.log(`=== Extracted data from ${filename} ===`)
    console.log(JSON.stringify(data, null, 2))

    return {
      success: true,
      filename: filename,
      data: data
    }
  } catch (error) {
    console.error(`Error parsing PDF ${filename}:`, error)
    return {
      success: false,
      filename: filename,
      error: error.message
    }
  }
}

/**
 * Parse PDFs dari ZIP file
 */
export async function parsePDFsFromZip(file, setProgress) {
  const zip = await jszip.loadAsync(file)

  const pdfFiles = []
  const results = []

  // Collect semua PDF files dari ZIP
  zip.forEach((relativePath, zipEntry) => {
    if (relativePath.toLowerCase().endsWith('.pdf') && !zipEntry.dir) {
      pdfFiles.push(zipEntry)
    }
  })

  if (pdfFiles.length === 0) {
    throw new Error('Tidak ada file PDF ditemukan dalam arsip ZIP')
  }

  setProgress(prev => ({
    ...prev,
    percentage: 20,
    message: `Ditemukan ${pdfFiles.length} file PDF`,
    total: pdfFiles.length
  }))

  // Parse setiap PDF
  for (let i = 0; i < pdfFiles.length; i++) {
    const pdfFile = pdfFiles[i]
    try {
      const arrayBuffer = await pdfFile.async('arraybuffer')
      const result = await parsePDF(arrayBuffer, pdfFile.name)
      results.push(result)

      const percentage = 20 + Math.floor(((i + 1) / pdfFiles.length) * 70)
      setProgress(prev => ({
        ...prev,
        percentage,
        message: `Memproses: ${pdfFile.name}`,
        current: i + 1
      }))
    } catch (error) {
      console.error(`Error processing ${pdfFile.name}:`, error)
      results.push({
        success: false,
        filename: pdfFile.name,
        error: error.message
      })
    }
  }

  return results
}
