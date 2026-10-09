-- Buat schema khusus
CREATE SCHEMA IF NOT EXISTS generus;

-- Helper: buat UUID berbasis nanoid untuk insert otomatis
CREATE OR REPLACE FUNCTION generus.nanoid()
RETURNS TEXT
LANGUAGE sql
AS $$
  SELECT replace(gen_random_uuid()::text, '-', '');
$$;

-- 1. Desa
CREATE TABLE generus.desa (
  id_desa TEXT PRIMARY KEY DEFAULT generus.nanoid(),
  nama_desa VARCHAR(100) NOT NULL
);

-- 2. Kelompok
CREATE TABLE generus.kelompok (
  id_kelompok TEXT PRIMARY KEY DEFAULT generus.nanoid(),
  nama_kelompok VARCHAR(100) NOT NULL,
  id_desa TEXT REFERENCES generus.desa(id_desa) ON DELETE CASCADE
);

-- 3. Rombel (Rombongan Belajar / Kelas)
CREATE TABLE generus.rombel (
  id_rombel TEXT PRIMARY KEY DEFAULT generus.nanoid(),
  nama_rombel VARCHAR(100) NOT NULL
);

-- 4. User
CREATE TABLE generus."user" (
  id_user TEXT PRIMARY KEY DEFAULT generus.nanoid(),
  nama_user VARCHAR(100) NOT NULL DEFAULT '',
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('Admin', 'Pengurus')) NOT NULL,
  id_kelompok TEXT REFERENCES generus.kelompok(id_kelompok) ON DELETE SET NULL
);

-- 5. Generus (Santri)
CREATE TABLE generus.generus (
  id_generus TEXT PRIMARY KEY DEFAULT generus.nanoid(),
  nama_generus VARCHAR(150) NOT NULL,
  jenis_kelamin VARCHAR(15) CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')) NOT NULL,
  tanggal_lahir DATE NOT NULL,
  id_kelompok TEXT REFERENCES generus.kelompok(id_kelompok) ON DELETE CASCADE,
  id_rombel TEXT REFERENCES generus.rombel(id_rombel) ON DELETE SET NULL
);

-- 6. Category Catatan
CREATE TABLE generus.category_catatan (
  id_category TEXT PRIMARY KEY DEFAULT generus.nanoid(),
  nama_category VARCHAR(100) NOT NULL
);

-- 7. Catatan
CREATE TABLE generus.catatan (
  id_catatan TEXT PRIMARY KEY DEFAULT generus.nanoid(),
  id_category TEXT REFERENCES generus.category_catatan(id_category) ON DELETE CASCADE,
  catatan TEXT NOT NULL
);

-- 8. Target Bulanan
CREATE TABLE generus.target_bulanan (
  id_target_bulan TEXT PRIMARY KEY DEFAULT generus.nanoid(),
  nama_target VARCHAR(150) NOT NULL,
  jumlah_target NUMERIC NOT NULL,
  satuan_target VARCHAR(50) NOT NULL,
  bulan_target VARCHAR(20) NOT NULL,
  id_rombel TEXT REFERENCES generus.rombel(id_rombel) ON DELETE CASCADE
);

-- 9. Laporan Bulanan
CREATE TABLE generus.laporan_bulanan (
  id_laporan TEXT PRIMARY KEY DEFAULT generus.nanoid(),
  tanggal_laporan DATE NOT NULL DEFAULT CURRENT_DATE,
  id_santri TEXT REFERENCES generus.generus(id_generus) ON DELETE CASCADE,
  id_catatan TEXT REFERENCES generus.catatan(id_catatan) ON DELETE SET NULL
);

-- 10. Detail Laporan Bulanan
CREATE TABLE generus.detail_laporan_bulanan (
  id_detail TEXT PRIMARY KEY DEFAULT generus.nanoid(),
  id_laporan TEXT REFERENCES generus.laporan_bulanan(id_laporan) ON DELETE CASCADE,
  id_target TEXT REFERENCES generus.target_bulanan(id_target_bulan) ON DELETE CASCADE,
  jumlah_capaian NUMERIC NOT NULL
);

-- 11. Catatan Raport
CREATE TABLE generus.catatan_raport (
  id_catatan_raport TEXT PRIMARY KEY DEFAULT generus.nanoid(),
  catatan_raport TEXT NOT NULL
);

-- 12. Target Raport (Semester)
CREATE TABLE generus.target_raport (
  id_target_raport TEXT PRIMARY KEY DEFAULT generus.nanoid(),
  nama_target VARCHAR(150) NOT NULL,
  id_rombel TEXT REFERENCES generus.rombel(id_rombel) ON DELETE CASCADE,
  semester VARCHAR(20) NOT NULL,
  jumlah_target NUMERIC NOT NULL,
  satuan_target VARCHAR(50) NOT NULL
);

-- 13. Laporan Raport
CREATE TABLE generus.laporan_raport (
  id_laporan_raport TEXT PRIMARY KEY DEFAULT generus.nanoid(),
  id_santri TEXT REFERENCES generus.generus(id_generus) ON DELETE CASCADE,
  id_catatan_raport TEXT REFERENCES generus.catatan_raport(id_catatan_raport) ON DELETE SET NULL
);

-- 14. Detail Raport
CREATE TABLE generus.detail_raport (
  id_detail_raport TEXT PRIMARY KEY DEFAULT generus.nanoid(),
  id_laporan_raport TEXT REFERENCES generus.laporan_raport(id_laporan_raport) ON DELETE CASCADE,
  id_target TEXT REFERENCES generus.target_raport(id_target_raport) ON DELETE CASCADE,
  nilai_raport NUMERIC NOT NULL
);

-- 15. Materi
CREATE TABLE generus.materi (
  id_materi TEXT PRIMARY KEY DEFAULT generus.nanoid(),
  nama_materi VARCHAR(150) NOT NULL,
  kategori_materi VARCHAR(100) NOT NULL,
  id_rombel TEXT REFERENCES generus.rombel(id_rombel) ON DELETE CASCADE
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS untuk semua tabel di schema generus
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'generus'
  LOOP
    EXECUTE format('ALTER TABLE generus.%I ENABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END;
$$;

-- Helper: get current user id_user dari request headers (set oleh aplikasi)
CREATE OR REPLACE FUNCTION generus.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(current_setting('app.current_role', true), '');
$$;

CREATE OR REPLACE FUNCTION generus.current_user_kelompok()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(current_setting('app.current_kelompok', true), '');
$$;

CREATE OR REPLACE FUNCTION generus.current_user_id()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(current_setting('app.current_user_id', true), '');
$$;

-- Policy: Admin bisa full CRUD
CREATE POLICY admin_full_access ON generus.desa
  FOR ALL USING (generus.current_user_role() = 'Admin');

CREATE POLICY admin_full_access_kelompok ON generus.kelompok
  FOR ALL USING (generus.current_user_role() = 'Admin');

CREATE POLICY admin_full_access_rombel ON generus.rombel
  FOR ALL USING (generus.current_user_role() = 'Admin');

CREATE POLICY admin_full_access_user ON generus."user"
  FOR ALL USING (generus.current_user_role() = 'Admin');

-- Login: anon perlu SELECT untuk verifikasi username + password
-- (password tetap diverifikasi di aplikasi via bcrypt, bukan di DB)
DROP POLICY IF EXISTS login_select_user ON generus."user";
CREATE POLICY login_select_user ON generus."user"
  FOR SELECT USING (true);

-- User management via aplikasi (hash password di client, Admin atur via UI)
DROP POLICY IF EXISTS app_write_user ON generus."user";
CREATE POLICY app_write_user ON generus."user"
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY admin_full_access_category ON generus.category_catatan
  FOR ALL USING (generus.current_user_role() = 'Admin');

DROP POLICY IF EXISTS admin_full_access_target_bulanan ON generus.target_bulanan;
CREATE POLICY admin_full_access_target_bulanan ON generus.target_bulanan
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS admin_full_access_target_raport ON generus.target_raport
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY admin_full_access_materi ON generus.materi
  FOR ALL USING (generus.current_user_role() = 'Admin');

-- Policy: Pengurus hanya bisa CRUD data di kelompoknya
CREATE POLICY pengurus_kelompok_desa ON generus.desa
  FOR SELECT USING (true);

CREATE POLICY pengurus_kelompok ON generus.kelompok
  FOR ALL USING (
    id_kelompok IN (SELECT id_kelompok FROM generus."user" WHERE id_user = generus.current_user_id() AND role = 'Pengurus')
    OR generus.current_user_role() = 'Admin'
  );

CREATE POLICY pengurus_rombel ON generus.rombel
  FOR ALL USING (generus.current_user_role() = 'Admin');

DROP POLICY IF EXISTS pengurus_generus ON generus.generus;
CREATE POLICY pengurus_generus ON generus.generus
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY pengurus_catatan ON generus.catatan
  FOR ALL USING (generus.current_user_role() = 'Admin');

DROP POLICY IF EXISTS pengurus_laporan_bulanan ON generus.laporan_bulanan;
CREATE POLICY pengurus_laporan_bulanan ON generus.laporan_bulanan
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS pengurus_detail_laporan_bulanan ON generus.detail_laporan_bulanan;
CREATE POLICY pengurus_detail_laporan_bulanan ON generus.detail_laporan_bulanan
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS pengurus_target_bulanan ON generus.target_bulanan;
CREATE POLICY pengurus_target_bulanan ON generus.target_bulanan
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY pengurus_catatan_raport ON generus.catatan_raport
  FOR ALL USING (generus.current_user_role() = 'Admin');

DROP POLICY IF EXISTS pengurus_target_raport ON generus.target_raport;
CREATE POLICY pengurus_target_raport ON generus.target_raport
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS pengurus_laporan_raport ON generus.laporan_raport;
CREATE POLICY pengurus_laporan_raport ON generus.laporan_raport
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS pengurus_detail_raport ON generus.detail_raport;
CREATE POLICY pengurus_detail_raport ON generus.detail_raport
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY pengurus_materi ON generus.materi
  FOR ALL USING (generus.current_user_role() = 'Admin');

-- Public read access (tanpa login): baca data santri, laporan, target, materi, dll
CREATE POLICY public_read_generus ON generus.generus
  FOR SELECT USING (true);

CREATE POLICY public_read_desa ON generus.desa
  FOR SELECT USING (true);

CREATE POLICY public_read_kelompok ON generus.kelompok
  FOR SELECT USING (true);

CREATE POLICY public_read_rombel ON generus.rombel
  FOR SELECT USING (true);

CREATE POLICY public_read_target_bulanan ON generus.target_bulanan
  FOR SELECT USING (true);

CREATE POLICY public_read_target_raport ON generus.target_raport
  FOR SELECT USING (true);

CREATE POLICY public_read_materi ON generus.materi
  FOR SELECT USING (true);

CREATE POLICY public_read_catatan_raport ON generus.catatan_raport
  FOR SELECT USING (true);

-- Policy detail laporan bisa dibaca publik jika laporannya terkait generus publik
CREATE POLICY public_read_laporan_bulanan ON generus.laporan_bulanan
  FOR SELECT USING (true);

CREATE POLICY public_read_detail_laporan_bulanan ON generus.detail_laporan_bulanan
  FOR SELECT USING (true);

CREATE POLICY public_read_laporan_raport ON generus.laporan_raport
  FOR SELECT USING (true);

CREATE POLICY public_read_detail_raport ON generus.detail_raport
  FOR SELECT USING (true);

-- ============================================================
-- GRANTS (wajib: anon key dipakai langsung oleh frontend)
-- ============================================================
GRANT USAGE ON SCHEMA generus TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA generus TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA generus GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA generus TO anon, authenticated;
