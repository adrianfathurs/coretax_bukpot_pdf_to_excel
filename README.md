# 📊 Bukti Potong PDF to Excel Converter

Aplikasi web berbasis React untuk mengkonversi file ZIP berisi kumpulan PDF Bukti Potong (BP21) menjadi file Excel (.xlsx) secara instan dan otomatis.

## ✨ Fitur

- ⚡ **Proses Cepat** - Upload dan otomatis terkonversi
- 📁 **ZIP Support** - Upload satu file ZIP berisi banyak PDF
- 🤖 **Auto Download** - Excel otomatis terunduh setelah selesai
- 🔒 **Privacy First** - Semua proses di browser, tidak ada data ke server
- 📊 **Statistics** - Tampilkan total bruto, PPh, dan jumlah PDF
- 🎨 **Beautiful UI** - Tampilan modern dengan gradient dan animasi
- 📱 **Responsive** - Bisa diakses dari desktop maupun mobile
- ✅ **Robust Parsing** - Toleran terhadap variasi format PDF

## 🚀 Cara Menggunakan

### Development Mode

```bash
cd bukpot-converter
npm install
npm run dev
```

Buka browser di `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 📖 Cara Pakai

1. **Buka Aplikasi** - Akses `http://localhost:5173`
2. **Upload ZIP** - Drag & drop atau klik untuk pilih file ZIP
3. **Tunggu Proses** - Aplikasi akan:
   - Mengekstrak ZIP
   - Membaca semua PDF
   - Mengekstrak data penting
   - Membuat file Excel
4. **Auto Download** - File `BuktiPotong_Rekap.xlsx` otomatis terunduh
5. **Lihat Hasil** - Statistik processing akan ditampilkan

## 📋 Data yang Diekstrak

Setiap PDF akan diekstrak untuk mendapatkan:

| Kolom Excel | Sumber di PDF |
|-------------|---------------|
| Nomor Bukti Pemotongan | NOMOR BUKTI PEMOTONGAN |
| Masa Pajak | MASA PAJAK |
| Sifat Pemotongan | SIFAT PEMOTONGAN |
| Status Bukti Pemotongan | STATUS BUKTI PEMOTONGAN |
| NIK Penerima Penghasilan | A.1 NIK/NPWP |
| Nama Penerima Penghasilan | A.2 Nama |
| Penghasilan Bruto | PENGHASILAN BRUTO |
| PPh Dipotong | PPh DIPOTONG |
| Nama Pemotong | C.3 Nama Pemotong |
| Tanggal Pemotong PPh | C.4 Tanggal |

## 🛠️ Tech Stack

- **React 18** - UI Framework
- **Vite** - Build Tool (super fast!)
- **JSZip** - ZIP extraction
- **PDF.js** - PDF parsing
- **SheetJS (XLSX)** - Excel generation

## 📁 Struktur Project

```
bukpot-converter/
├── src/
│   ├── components/
│   │   ├── UploadZone.jsx    # Upload interface
│   │   ├── Processing.jsx    # Processing view
│   │   ├── Result.jsx        # Result display
│   │   └── Error.jsx         # Error handling
│   ├── utils/
│   │   ├── pdfParser.js      # PDF parsing logic
│   │   └── excelGenerator.js # Excel generation
│   ├── App.jsx               # Main app component
│   ├── App.css               # Styling
│   └── main.jsx              # Entry point
├── package.json
└── README.md
```

## 🔒 Privasi & Keamanan

- ✅ **100% Client-side** - Semua proses di browser
- ✅ **No Server Upload** - Data tidak dikirim kemana pun
- ✅ **No Storage** - Data tidak disimpan
- ✅ **Immediate Processing** - Langsung diproses
- ✅ **Auto Cleanup** - Data dihapus setelah selesai

## ⚠️ Requirements

- ZIP file harus berisi PDF Bukti Potong
- PDF tidak boleh dipassword
- PDF dalam format teks (bukan scan image)
- File size reasonable (recommended < 50MB)

## 🐛 Troubleshooting

### PDF tidak terbaca?
- Pastikan PDF bukan scan image
- Coba buka PDF manual untuk memastikan bisa dibaca
- PDF tidak boleh dipassword

### Process lambat?
- Tergantung jumlah PDF di ZIP
- Tergantung size PDF
- Normal untuk 10-50 PDF

### Download tidak otomatis?
- Cek browser popup blocker
- File tetap bisa didownload dari result page

## 📝 Deployment

### Deploy ke Vercel

```bash
npm install -g vercel
vercel
```

### Deploy ke Netlify

```bash
npm run build
# Upload 'dist' folder ke Netlify
```

### Deploy ke GitHub Pages

```bash
npm run build
# Upload 'dist' folder ke GitHub Pages branch
```

## 🎯 Future Enhancements

- [ ] Support untuk Bukti Potong format lama
- [ ] Preview data sebelum download
- [ ] Export ke format lain (CSV, JSON)
- [ ] Batch processing multiple ZIP
- [ ] Custom field selection
- [ ] Dark mode

## 📄 License

MIT License - Bebas digunakan untuk personal atau commercial

## 👨‍💻 Development

Dibuat dengan ❤️ menggunakan React + Vite

---

**Note:** Aplikasi ini 100% client-side. Tidak ada data yang dikirim ke server. Semua proses dilakukan di browser Anda.
