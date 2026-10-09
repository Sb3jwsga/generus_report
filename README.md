# Aplikasi Pengelolaan Perkembangan Generus & Santri

Aplikasi web untuk pengelolaan data generus, laporan bulanan, dan raport berbasis React dan Supabase.

## Tech Stack
- **Frontend**: React (Vite, TypeScript, Tailwind CSS)
- **Backend/DB**: Supabase (PostgreSQL)
- **UI Components**: Headless UI, Tailwind CSS

## Setup Lokal

1. **Clone project** dan install dependencies:
   ```bash
   npm install
   ```

2. **Konfigurasi Environment**:
   - Salin `.env.example` ke `.env`
   - Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dari dashboard Supabase Anda.

3. **Setup Database**:
   - Salin isi file `supabase/migration.sql`
   - Jalankan di **SQL Editor** Supabase project Anda.

4. **Menjalankan Dev Server**:
   ```bash
   npm run dev
   ```

## Fitur Utama
- **Public Portal**: Melihat direktori santri, capaian bulanan, raport, dan materi tanpa login.
- **Admin Dashboard**: Manajemen Master Data (Desa, Kelompok, Rombel, User, Target, Materi).
- **Pengurus Dashboard**: CRUD Santri di kelompoknya, input laporan bulanan (otomatis filter target), dan input raport.
- **Searchable Dropdowns**: Menggunakan Combobox (Headless UI) untuk semua pilihan data.

## Skema Database
Seluruh tabel berada dalam skema khusus `generus`. Auth menggunakan custom username + password (bcrypt) pada tabel `generus.user`.
