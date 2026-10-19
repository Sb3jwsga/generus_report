# AGENTS.md

React 19 + Vite + TypeScript SPA (Tailwind v4) di atas Supabase dengan schema khusus `generus`.

## Commands
| Task | Command | Note |
|------|---------|------|
| Typecheck + build | `npm run build` | `tsc -b && vite build`. Satu-satunya gerbang verifikasi. |
| Lint | `npm run lint` | oxlint (`.oxlintrc.json`). |
| Dev | `npm run dev` | Vite dev server. |
| Seed/reset admin | `node scripts/seed-admin.mjs <url> <anon-key> [username] [password] [nama]` | bcrypt; default `admin` / `admin123`. |

Tidak ada test dan tidak ada CI. Jangan pakai `npm run tailwind`: script itu hanya menulis `src/output.css` yang tidak diimpor siapa pun.

## Environment
- `.env` (gitignored): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — keduanya di-inline ke bundle client.
- Tanpa Supabase yang bisa diakses, dev/build tetap jalan tapi semua halaman kosong; tidak ada data mock/fixture.
- Deploy lewat Vercel (`vercel.json`), build ke `dist`, semua path di-rewrite ke `/index.html` (SPA).

## Database & Auth
- `src/api/supabase.ts` mem-pin `db.schema: 'generus'`; query memakai nama tabel polos.
- ID `TEXT` dengan default DB `generus.nanoid()` (uuid tanpa dash). Jangan membuat ID di client.
- `laporan_bulanan.id_santri` dan `laporan_raport.id_santri` berisi `generus.id_generus` — nama kolomnya menyesatkan.
- **`supabase/migration.sql` bukan schema live.** Kolom `laporan_bulanan.jumlah_hadir|jumlah_izin|jumlah_sakit|jumlah_alfa`, `laporan_raport.semester|tahun_ajaran`, dan tabel `semester_config` hanya ada di patch `supabase/*.sql` atau ditambahkan manual di SQL Editor Supabase. Kontrak schema = `src/types/index.ts`. SQL baru ditulis ke `supabase/*.sql` lalu dijalankan manual (tidak ada migration tooling/CLI).
- Auth custom, bukan Supabase Auth: `src/api/auth.ts` select `generus.user` by `username` memakai anon key lalu `bcrypt.compare`, user di-cache di `localStorage` key `generus_user` (`AuthContext`). Jangan pakai `supabase.auth.*`.
- **RLS tidak menegakkan apa pun.** Tanpa sesi Supabase, `generus.current_user_role()` / `current_user_kelompok()` (membaca setting `app.current_*` yang tidak pernah di-set oleh kode mana pun) selalu NULL sehingga policy berbasis role tidak pernah match; aplikasi berjalan di policy `USING (true)` + grant `anon`. Jangan mengandalkan RLS saat menambah policy/fitur.
- Scoping pengurus eksplisit per query: `.eq('id_kelompok', user.id_kelompok)` (pakai `generus!inner(id_kelompok)` untuk join).

## Wiring halaman baru
1. `src/App.tsx`: route; route admin/pengurus dibungkus `ProtectedRoute allowedRoles={[...]}`. Catch-all `*` melempar ke `/login`.
2. Nav: `PublicLayout.tsx` (`tabs`), atau `Sidebar.tsx` **dan** `BottomNav.tsx` (daftar mobile & desktop terpisah).
3. Halaman publik juga butuh card di `src/pages/public/PublicPortal.tsx`.

## Konvensi UI
- Tailwind v4 via `@tailwindcss/vite`. Token warna ada di blok `@theme` `src/index.css`; `tailwind.config.js` legacy dan **tidak dibaca** — tambah warna di `@theme` atau warnanya tidak ada.
- Ikon: `src/components/ui/Icon.tsx` dengan nama ligature Material Symbols (`filled` untuk state aktif).
- Pakai `src/components/ui/*` (`Modal`, `Combobox`, `EmptyState`, `Spinner`, `Button`); dropdown selalu `Combobox` yang searchable.
- Admin: CRUD di dalam modal pada satu halaman. Pengurus: CRUD lewat route form terpisah dan wajib meround-trip filter/search/sort via URL query param.
- Filename duplikat memang disengaja: `admin/GenerusPage.tsx`, `pengurus/GenerusPage.tsx`, `public/PublicGenerusPage.tsx`.
- Filter admin mengikuti cascade Desa → Kelompok → Rombel. Urut bulan pakai `BULAN_LIST` (`src/utils/constants.ts`) karena urutan alfabetis salah. Nama generus UPPERCASE (dipaksa saat input dan saat simpan).
- Materi publik: grouping hierarkis Kategori → Semester → List Materi.
- Dashboard: Grafik batang dibuat manual (CSS bars) tanpa library chart. Filter tahun di-derive dari data `tanggal_laporan`.

## Verifikasi
1. `npm run build` harus lolos — `noUnusedLocals`, `noUnusedParameters`, dan `verbatimModuleSyntax` aktif (buang variabel mati, pakai `import type`).
2. `npm run lint` saat menyentuh hooks/exports.
3. Tanpa akses project Supabase live, rendering yang bergantung data tidak bisa diverifikasi — sebutkan apa yang belum diverifikasi, jangan diasumsikan.
