# AGENTS.md

## Setup & Run

1. **Environment**: Copy `.env.example` → `.env`, fill `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
2. **Database**: Run `supabase/migration.sql` in Supabase SQL Editor
3. **Dev server**: `npm run dev`
4. **Build**: `npm run build` (runs `tsc -b && vite build`)

## Project Structure

```
src/
├── api/supabase.ts        # Supabase client (generus schema)
├── components/
│   ├── layout/            # Sidebar, DashboardLayout, Navbar
│   ├── ui/                # Button, Modal, Input, Combobox, Icon, PageHeader
├── pages/
│   ├── admin/             # Admin routes (/admin/*)
│   ├── pengurus/          # Pengurus routes (/pengurus/*)
│   ├── public/            # Public routes (no auth)
│   └── auth/              # Login page
├── contexts/AuthContext.tsx  # Custom auth (bcrypt username+password)
├── types/index.ts         # TypeScript interfaces (Desa, Kelompok, Rombel, User, Generus, etc.)
└── main.tsx               # App entry
```

## Auth & Roles

- **Schema**: `generus.user` with `role` = `'Admin' | 'Pengurus'`
- **Auth**: Custom login (bcrypt password) — Supabase auth not used
- **ProtectedRoute**: Checks `allowedRoles` in `src/components/auth/ProtectedRoute.tsx`

## Routing

| Role | Routes | Sidebar Items |
|------|--------|---------------|
| Admin | `/admin/*` | Dashboard, Desa, Kelompok, Rombel, **Kelola Generus**, User, Target Bulanan/Raport, Materi, Catatan, Semester |
| Pengurus | `/pengurus/*` | Dashboard, Data Generus, Laporan Bulanan, Raport Semester |

## Database Schema (generus schema)

Key tables:
- `desa` → `kelompok` (via `id_desa`) → `generus` (via `id_kelompok`)
- `rombel` → `generus` (via `id_rombel`, nullable)
- `generus` → `laporan_bulanan` (via `id_santri`)
- `target_bulanan` linked to `rombel`

## Important Notes

- **GenerusPage.tsx** conflict: Two files exist — `src/pages/admin/GenerusPage.tsx` (Admin CRUD) and `src/pages/pengurus/GenerusPage.tsx` (Pengurus view). Admin route imports as `AdminGenerusPage`.
- **Filter cascade**: Desa → Kelompok → Rombel (client-side chaining in Admin GenerusPage).
- **Combobox**: Used everywhere for searchable dropdowns (`@headlessui/react`).
- **Icons**: Material Symbols (`<Icon name="xxx" />`) — see `src/components/ui/Icon.tsx` for list.
- **Build order**: TypeScript check runs first (`tsc -b`) before Vite build.

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Lint | `npm run lint` (oxlint) |
| Preview | `npm run preview` |
| Tailwind watch | `npm run tailwind` |
