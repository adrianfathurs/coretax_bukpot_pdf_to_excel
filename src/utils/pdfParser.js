import * as pdfjsLib from 'pdfjs-dist'
import jszip from 'jszip'

// Set worker menggunakan import dinamik dari node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

/**
 * Mapping Kode Objek Pajak ke Nama Objek Pajak
 */
const KODE_OBJEK_PAJAK_MAP = {
  '21-100-35': 'Upah Pegawai Tidak Tetap yang Dibayarkan secara Bulanan',
  '21-100-27': 'Upah Pegawai Tidak Tetap yang Dibayarkan secara Bulanan yang Mendapat Fasilitas di Daerah Tertentu',
  '21-100-30': 'Upah Pegawai Tidak Tetap yang Dibayarkan secara Harian, Mingguan, Satuan dan Borongan dengan Penghasilan Bruto lebih dari Rp2.500.000 Sehari',
  '21-100-31': 'Upah Pegawai Tidak Tetap yang Dibayarkan secara Harian, Mingguan, Satuan dan Borongan dengan Penghasilan Bruto lebih dari Rp2.500.000 Sehari yang Mendapat Fasilitas di Daerah Tertentu',
  '21-100-24': 'Upah Pegawai Tidak Tetap yang Dibayarkan secara Harian, Mingguan, Satuan dan Borongan dengan Penghasilan Bruto sampai dengan Rp2.500.000 Sehari',
  '21-100-29': 'Upah Pegawai Tidak Tetap yang Dibayarkan secara Harian, Mingguan, Satuan dan Borongan dengan Penghasilan Bruto sampai dengan Rp2.500.000 Sehari yang Mendapat Fasilitas di Daerah Tertentu',
  '21-100-18': 'Imbalan kepada Penasihat, Pengajar, Pelatih, Penceramah, Penyuluh, dan Moderator',
  '21-100-19': 'Imbalan kepada Pengarang, Peneliti, Penerjemah',
  '21-100-20': 'Imbalan kepada Pemberi Jasa dalam Segala Bidang',
  '21-100-21': 'Imbalan kepada Agen Iklan',
  '21-100-22': 'Imbalan kepada Pengawas atau Pengelola Proyek',
  '21-100-23': 'Imbalan kepada Pembawa Pesanan atau yang Menemukan Langganan atau yang Menjadi Perantara',
  '21-100-06': 'Imbalan kepada Petugas Penjaja Barang Dagangan',
  '21-100-33': 'Imbalan kepada Pemain Musik, Pembawa Acara, Penyanyi, Pelawak, Bintang Film, Bintang Sinetron, Bintang Iklan, Sutradara, Kru Film, Foto Model, Peragawan/Peragawati, Pemain Drama, Penari, Pemahat, Pelukis, Pembuat/Pencipta Konten pada Media yang Dibagikan secara Daring (Influencer, Selebgram, Blogger, Vlogger, dan Sejenis Lainnya), dan Seniman Lainnya',
  '21-100-34': 'Imbalan yang Diterima oleh Olahragawan',
  '21-100-36': 'Imbalan kepada Peserta Perlombaan dalam Segala Bidang, antara lain Perlombaan Olah Raga, Seni, Ketangkasan, Ilmu Pengetahuan, Teknologi, dan Perlombaan Lainnya',
  '21-100-14': 'Imbalan kepada Peserta Rapat, Konferensi, Sidang, Pertemuan, Kunjungan Kerja, Seminar, Lokakarya, atau Pertunjukan, atau Kegiatan Tertentu Lainnya',
  '21-100-15': 'Imbalan kepada Peserta atau Anggota dalam Suatu Kepanitiaan sebagai Penyelenggara Kegiatan Tertentu',
  '21-100-16': 'Imbalan kepada Peserta Pendidikan, Pelatihan, dan Magang',
  '21-100-17': 'Imbalan kepada Peserta Kegiatan Lainnya',
  '21-100-10': 'Honorarium atau Imbalan kepada Anggota Dewan Komisaris atau Dewan Pengawas yang Menerima Imbalan secara Tidak Teratur',
  '21-100-07': 'Imbalan kepada Tenaga Ahli (Pengacara, Akuntan, Arsitek, Dokter, Konsultan, Notaris, Pejabat Pembuat Akte Tanah, Penilai, Aktuaris)',
  '21-100-05': 'Imbalan kepada Agen Asuransi',
  '21-100-12': 'Uang Manfaat Pensiun atau Penghasilan Sejenisnya yang diambil sebagian oleh Peserta Program Pensiun yang Masih Berstatus sebagai Pegawai',
  '21-401-01': 'Uang Pesangon yang Dibayarkan Sekaligus',
  '21-401-02': 'Uang Manfaat Pensiun, Tunjangan Hari Tua, atau Jaminan Hari Tua yang Dibayarkan Sekaligus'
}

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
    // Extract kode objek pajak, lalu lookup nama objek pajak dari mapping
    kode_objek_pajak: extractField(cleanText, [
      /KODE\s+OBJEK\s+PAJAK\s*:\s*(\d{2}-\d{3}-\d{2})/i,
      /(\d{2}-\d{3}-\d{2})/i
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

  // Lookup nama objek pajak dari kode objek pajak menggunakan mapping
  if (data.kode_objek_pajak) {
    data.nama_objek_pajak = KODE_OBJEK_PAJAK_MAP[data.kode_objek_pajak] || ''
  } else {
    data.nama_objek_pajak = ''
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
