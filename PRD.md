# PRODUCT REQUIREMENT DOCUMENT (PRD)
## Web App Pengelolaan Perkembangan Generus & Santri

---

## 1. Overview & Goals
### 1.1 Latar Belakang
Pengelolaan perkembangan generus (santri) mulai dari tingkat kelompok, desa, hingga rombel memerlukan sistem pencatatan yang terstruktur, transparan, dan terpusat. Selama ini, rekapitulasi target bulanan, catatan perkembangan, serta raport semester sering kali dilakukan secara manual.

### 1.2 Tujuan Aplikasi
1. Membangun aplikasi web interaktif berbasis **React** dan **Supabase** dengan skema khusus **`generus`**.
2. Memfasilitasi **Pengurus** untuk mengelola data generus, laporan bulanan, dan raport secara terbatas hanya pada kelompok binaan mereka masing-masing.
3. Memfasilitasi **Admin** untuk mengelola keseluruhan sistem secara global (master data, target, user, dan lintas kelompok).
4. Menyediakan **Tampilan Umum (Public Portal)** agar masyarakat atau orang tua dapat memantau data santri, pencapaian bulanan, raport, dan materi belajar tanpa harus login.

---

## 2. User Roles & Permissions
Aplikasi ini memiliki 2 peran utama serta 1 akses publik:
1. **Public / Pengunjung (Tanpa Login)**:
   - Dapat melihat direktori data santri, pencapaian bulanan, raport semester, dan daftar materi pembelajaran berdasarkan rombel.
2. **Pengurus**:
   - Hak akses dibatasi berdasarkan `id_kelompok` yang terikat pada akun mereka (`user.id_kelompok`).
   - Dapat melakukan CRUD data **Generus** *hanya* di dalam kelompok mereka.
   - Dapat menginput dan mengelola **Laporan Bulanan** dan **Laporan Raport** untuk generus di kelompoknya.
3. **Admin**:
   - Memiliki akses penuh (Full CRUD) ke seluruh tabel dan modul aplikasi.
   - Dapat mengelola data Master (Desa, Kelompok, Rombel, Kategori Catatan, Materi).
   - Mengelola Target Bulanan & Target Raport untuk setiap Rombel.
   - Mengelola Manajemen User (tambah, edit, hapus user, role, dan kelompok).

---

## 3. Skema Database (Custom Schema: `generus`, ID Type: `TEXT`)

Berikut adalah struktur tabel relasional lengkap yang ditempatkan di dalam skema khusus **`generus`** dengan tipe data `TEXT` untuk seluruh kolom ID:

```sql
-- Membuat schema khusus
CREATE SCHEMA IF NOT EXISTS generus;

-- 1. Desa
CREATE TABLE generus.desa (
  id_desa TEXT PRIMARY KEY,
  nama_desa VARCHAR(100) NOT NULL
);

-- 2. Kelompok
CREATE TABLE generus.kelompok (
  id_kelompok TEXT PRIMARY KEY,
  nama_kelompok VARCHAR(100) NOT NULL,
  id_desa TEXT REFERENCES generus.desa(id_desa) ON DELETE CASCADE
);

-- 3. Rombel (Rombongan Belajar / Kelas)
CREATE TABLE generus.rombel (
  id_rombel TEXT PRIMARY KEY,
  nama_rombel VARCHAR(100) NOT NULL
);

-- 4. User
CREATE TABLE generus."user" (
  id_user TEXT PRIMARY KEY,
  nama_user VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('Admin', 'Pengurus')) NOT NULL,
  id_kelompok TEXT REFERENCES generus.kelompok(id_kelompok) ON DELETE SET NULL
);

-- 5. Generus (Santri)
CREATE TABLE generus.generus (
  id_generus TEXT PRIMARY KEY,
  nama_generus VARCHAR(150) NOT NULL,
  jenis_kelamin VARCHAR(15) CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')) NOT NULL,
  tanggal_lahir DATE NOT NULL,
  id_kelompok TEXT REFERENCES generus.kelompok(id_kelompok) ON DELETE CASCADE,
  id_rombel TEXT REFERENCES generus.rombel(id_rombel) ON DELETE SET NULL
);

-- 6. Category Catatan
CREATE TABLE generus.category_catatan (
  id_category TEXT PRIMARY KEY,
  nama_category VARCHAR(100) NOT NULL
);

-- 7. Catatan
CREATE TABLE generus.catatan (
  id_catatan TEXT PRIMARY KEY,
  id_category TEXT REFERENCES generus.category_catatan(id_category) ON DELETE CASCADE,
  catatan TEXT NOT NULL
);

-- 8. Target Bulanan
CREATE TABLE generus.target_bulanan (
  id_target_bulan TEXT PRIMARY KEY,
  nama_target VARCHAR(150) NOT NULL,
  jumlah_target NUMERIC NOT NULL,
  satuan_target VARCHAR(50) NOT NULL,
  bulan_target VARCHAR(20) NOT NULL,
  id_rombel TEXT REFERENCES generus.rombel(id_rombel) ON DELETE CASCADE
);

-- 9. Laporan Bulanan
CREATE TABLE generus.laporan_bulanan (
  id_laporan TEXT PRIMARY KEY,
  tanggal_laporan DATE NOT NULL,
  id_santri TEXT REFERENCES generus.generus(id_generus) ON DELETE CASCADE,
  id_catatan TEXT REFERENCES generus.catatan(id_catatan) ON DELETE SET NULL
);

-- 10. Detail Laporan Bulanan
CREATE TABLE generus.detail_laporan_bulanan (
  id_detail TEXT PRIMARY KEY,
  id_laporan TEXT REFERENCES generus.laporan_bulanan(id_laporan) ON DELETE CASCADE,
  id_target TEXT REFERENCES generus.target_bulanan(id_target_bulan) ON DELETE CASCADE,
  jumlah_capaian NUMERIC NOT NULL
);

-- 11. Catatan Raport
CREATE TABLE generus.catatan_raport (
  id_catatan_raport TEXT PRIMARY KEY,
  catatan_raport TEXT NOT NULL
);

-- 12. Target Raport (Semester)
CREATE TABLE generus.target_raport (
  id_target_raport TEXT PRIMARY KEY,
  nama_target VARCHAR(150) NOT NULL,
  id_rombel TEXT REFERENCES generus.rombel(id_rombel) ON DELETE CASCADE,
  semester VARCHAR(20) NOT NULL,
  jumlah_target NUMERIC NOT NULL,
  satuan_target VARCHAR(50) NOT NULL
);

-- 13. Laporan Raport
CREATE TABLE generus.laporan_raport (
  id_laporan_raport TEXT PRIMARY KEY,
  id_santri TEXT REFERENCES generus.generus(id_generus) ON DELETE CASCADE,
  id_catatan_raport TEXT REFERENCES generus.catatan_raport(id_catatan_raport) ON DELETE SET NULL
);

-- 14. Detail Raport
CREATE TABLE generus.detail_raport (
  id_detail_raport TEXT PRIMARY KEY,
  id_laporan_raport TEXT REFERENCES generus.laporan_raport(id_laporan_raport) ON DELETE CASCADE,
  id_target TEXT REFERENCES generus.target_raport(id_target_raport) ON DELETE CASCADE,
  nilai_raport NUMERIC NOT NULL
);

-- 15. Materi
CREATE TABLE generus.materi (
  id_materi TEXT PRIMARY KEY,
  nama_materi VARCHAR(150) NOT NULL,
  kategori_materi VARCHAR(100) NOT NULL,
  id_rombel TEXT REFERENCES generus.rombel(id_rombel) ON DELETE CASCADE
);
```

---

## 4. Public Portal (Tampilan Umum Tanpa Login)
Halaman publik dirancang untuk memberikan transparansi informasi kepada publik/orang tua tanpa memerlukan autentikasi:
1. **Data Santri (Direktori Generus)**: Menampilkan daftar santri dengan filter berdasarkan Rombel dan Kelompok.
2. **Pencapaian Bulanan**: Memantau grafik dan rekapitulasi capaian target bulanan per santri/rombel.
3. **Raport Santri**: Melihat ringkasan nilai raport semester secara transparan.
4. **Materi Pembelajaran**: Menyediakan daftar kurikulum atau materi belajar yang dikelompokkan berdasarkan `kategori_materi` dan `id_rombel`.
5. **Akses Login**: Terdapat tombol navigasi khusus "Login" untuk admin dan pengurus.

---

## 5. Tech Stack
* **Frontend**: **React.js** (Vite, Tailwind CSS untuk styling, React Router untuk navigasi).
* **Backend & Database**: **Supabase** (PostgreSQL dengan kustom schema `generus`, Supabase Auth, dan Row Level Security).
* **Deployment**: Vercel / Netlify.

---

## 6. UI/UX Guidelines & Responsive Design
### 6.1 Identitas Warna
* **Warna Utama (Primary)**: Biru (`#1e63b2`) — Digunakan untuk sidebar, header, tombol utama, dan aksen aktif.
* **Warna Sekunder / Aksen (Accent)**: Kuning (`#fddd31`) — Digunakan untuk tombol *call-to-action*, indikator status, dan sorotan elemen penting.
* **Latar Belakang**: Putih bersih (`#ffffff`) dan abu-abu muda (`#f8fafc`).

### 6.2 Perilaku Responsif (Desktop vs Mobile)
* **Tampilan Desktop (> 768px)**:
  * Menggunakan **Sidebar Vertikal** di sisi kiri berwarna Biru (`#1e63b2`).
  * Header atas dengan informasi profil dan tombol logout.
  * Area konten utama luas dengan tabel interaktif dan kartu ringkasan (grid 3 kolom).
* **Tampilan Mobile ($\le$ 768px)**:
  * Sidebar otomatis tersembunyi.
  * Navigasi berpindah ke **Bottom Menu (Bottom Navigation Bar)** yang melekat di bagian bawah layar dengan ikon-ikon utama (Beranda, Generus, Laporan, Raport, Materi).
  * Menu aktif disorot dengan latar kapsul berwarna Kuning (`#fddd31`) dan ikon Biru (`#1e63b2`).
  * Desain kartu (card-based layout) menggantikan tabel lebar agar nyaman disentuh dan digulir.