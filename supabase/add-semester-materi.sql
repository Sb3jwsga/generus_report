-- Tambah semester ke materi yang sudah ada.
-- Jalankan sekali di Supabase SQL Editor.

ALTER TABLE generus.materi
  ADD COLUMN IF NOT EXISTS semester VARCHAR(20);

-- Data lama belum memiliki semester; isi sementara dengan Ganjil.
UPDATE generus.materi
SET semester = 'Ganjil'
WHERE semester IS NULL;

ALTER TABLE generus.materi
  ALTER COLUMN semester SET NOT NULL;

ALTER TABLE generus.materi
  DROP CONSTRAINT IF EXISTS materi_semester_check;

ALTER TABLE generus.materi
  ADD CONSTRAINT materi_semester_check
  CHECK (semester IN ('Ganjil', 'Genap'));
