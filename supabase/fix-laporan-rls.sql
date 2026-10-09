-- Fix RLS agar pengurus bisa input laporan (jalankan sekali di SQL Editor)
DROP POLICY IF EXISTS pengurus_laporan_bulanan ON generus.laporan_bulanan;
CREATE POLICY pengurus_laporan_bulanan ON generus.laporan_bulanan
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS pengurus_detail_laporan_bulanan ON generus.detail_laporan_bulanan;
CREATE POLICY pengurus_detail_laporan_bulanan ON generus.detail_laporan_bulanan
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS pengurus_laporan_raport ON generus.laporan_raport;
CREATE POLICY pengurus_laporan_raport ON generus.laporan_raport
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS pengurus_detail_raport ON generus.detail_raport;
CREATE POLICY pengurus_detail_raport ON generus.detail_raport
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS pengurus_generus ON generus.generus;
CREATE POLICY pengurus_generus ON generus.generus
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS pengurus_rombel ON generus.rombel;
CREATE POLICY pengurus_rombel ON generus.rombel
  FOR ALL USING (true) WITH CHECK (true);

-- Grants (pastikan anon bisa tulis):
GRANT SELECT, INSERT, UPDATE, DELETE ON generus.laporan_bulanan TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON generus.detail_laporan_bulanan TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON generus.laporan_raport TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON generus.detail_raport TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON generus.generus TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON generus.rombel TO anon, authenticated;

-- Verifikasi (semua harus permissive, qual & with_check = true):
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'generus'
  AND tablename IN ('laporan_bulanan', 'detail_laporan_bulanan', 'laporan_raport', 'detail_raport', 'generus', 'rombel')
ORDER BY tablename, policyname;
