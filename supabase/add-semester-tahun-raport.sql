-- Tambah semester + tahun ajaran ke laporan_raport
-- Jalankan di Supabase SQL Editor

ALTER TABLE generus.laporan_raport
  ADD COLUMN IF NOT EXISTS semester VARCHAR(20),
  ADD COLUMN IF NOT EXISTS tahun_ajaran VARCHAR(20);

-- Backfill dari detail -> target_raport (ambil semester pertama yg ketemu)
UPDATE generus.laporan_raport lr
SET semester = t.semester
FROM generus.detail_raport dr
JOIN generus.target_raport t ON t.id_target_raport = dr.id_target
WHERE dr.id_laporan_raport = lr.id_laporan_raport
  AND lr.semester IS NULL;

-- Default tahun ajaran berjalan untuk baris lama yg masih NULL
-- Ganjil (Jan-Jun) = tahun-1/tahun, Genap (Jul-Des) = tahun/tahun+1
UPDATE generus.laporan_raport
SET tahun_ajaran = CASE
  WHEN EXTRACT(MONTH FROM NOW()) <= 6
    THEN (EXTRACT(YEAR FROM NOW())::int - 1) || '/' || EXTRACT(YEAR FROM NOW())::int
  ELSE EXTRACT(YEAR FROM NOW())::int || '/' || (EXTRACT(YEAR FROM NOW())::int + 1)
END
WHERE tahun_ajaran IS NULL;

-- Cegah duplikat: 1 generus hanya 1 raport per semester per tahun ajaran
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_laporan_raport_santri_semester_tahun'
  ) THEN
    ALTER TABLE generus.laporan_raport
      ADD CONSTRAINT uq_laporan_raport_santri_semester_tahun
      UNIQUE (id_santri, semester, tahun_ajaran);
  END IF;
END $$;
