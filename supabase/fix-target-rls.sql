-- Fix RLS target_bulanan + target_raport (jalankan sekali di SQL Editor)
DROP POLICY IF EXISTS admin_full_access_target_bulanan ON generus.target_bulanan;
CREATE POLICY admin_full_access_target_bulanan ON generus.target_bulanan
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS pengurus_target_bulanan ON generus.target_bulanan;
CREATE POLICY pengurus_target_bulanan ON generus.target_bulanan
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS admin_full_access_target_raport ON generus.target_raport;
CREATE POLICY admin_full_access_target_raport ON generus.target_raport
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS pengurus_target_raport ON generus.target_raport;
CREATE POLICY pengurus_target_raport ON generus.target_raport
  FOR ALL USING (true) WITH CHECK (true);

-- Verifikasi (harus tampil 4 baris, semua permissive):
SELECT policyname, cmd, permissive, qual, with_check
FROM pg_policies
WHERE schemaname = 'generus'
  AND tablename IN ('target_bulanan', 'target_raport');
