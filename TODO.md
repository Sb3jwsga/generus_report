# Pengembangan Fitur Upload Target Bulanan via Excel

## Fase 1: Setup & Persiapan
- [x] Install library `xlsx`
- [x] Inisialisasi file `TODO.md` (Selesai)

## Fase 2: Pengembangan UI (Antarmuka)
- [x] Tambah tombol "Upload Excel" di `src/pages/admin/TargetBulananPage.tsx`
- [x] Buat modal `UploadTargetModal`
- [x] Implementasi dropdown pilih Rombel di dalam modal
- [x] Implementasi input file (Excel)
- [x] Tambah fitur download template Excel di dalam modal

## Fase 3: Logika Parsing & Validasi
- [x] Implementasi fungsi parsing Excel menggunakan `xlsx`
- [x] Validasi header: `Bulan`, `Nama Target`, `Jumlah Target`
- [x] Validasi baris data (tipe data & field kosong)
- [x] Rombel otomatis tersimpan dari pilihan dropdown (tidak ada kolom Rombel di Excel)

## Fase 4: Integrasi Data
- [x] Implementasi batch insert ke tabel `target_bulanan` di Supabase
- [x] Handling error saat proses insert
- [x] Refresh data otomatis setelah upload berhasil

## Fase 5: Verifikasi
- [x] Linting & Typecheck
- [x] Build test lokal
- [ ] Pastikan tidak ada auto-push ke GitHub

---
*Catatan: File .env tidak dipush ke GitHub sesuai konfigurasi sebelumnya.*
