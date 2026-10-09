-- Pastikan menghapus laporan_bulanan otomatis menghapus detail_laporan_bulanan terkait.
-- Jalankan sekali di SQL Editor Supabase.
-- Catatan: tabel `catatan` dihapus di level aplikasi karena relasinya
-- laporan_bulanan.id_catatan -> catatan.id_catatan (parent), sehingga
-- ON DELETE CASCADE tidak bisa dipasang dari sisi laporan.

DO $$
DECLARE
  cname text;
BEGIN
  -- Cari nama foreign key detail_laporan_bulanan -> laporan_bulanan
  SELECT conname INTO cname
  FROM pg_constraint
  WHERE conrelid = 'generus.detail_laporan_bulanan'::regclass
    AND confrelid = 'generus.laporan_bulanan'::regclass;

  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE generus.detail_laporan_bulanan DROP CONSTRAINT %I', cname);
  END IF;

  ALTER TABLE generus.detail_laporan_bulanan
    ADD CONSTRAINT detail_laporan_bulanan_id_laporan_fkey
    FOREIGN KEY (id_laporan)
    REFERENCES generus.laporan_bulanan(id_laporan)
    ON DELETE CASCADE;
END $$;

-- Verifikasi constraint yang aktif
SELECT conname, confdeltype
FROM pg_constraint
WHERE conrelid = 'generus.detail_laporan_bulanan'::regclass
  AND confrelid = 'generus.laporan_bulanan'::regclass;
