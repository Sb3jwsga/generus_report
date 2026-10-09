# AGENTS.md

## Commands
| Task | Command | Note |
|------|---------|------|
| Build | `npm run build` | Runs `tsc -b && vite build`. Always run to verify TS. |
| Lint | `npm run lint` | Uses `oxlint`. |
| Dev | `npm run dev` | |
| Tailwinds | `npm run tailwind` | |

## Database & Auth
- **Supabase Schema**: Uses `generus` schema (non-public).
- **Auth**: Custom implementation in `src/contexts/AuthContext.tsx`. Uses `bcryptjs` on `generus.user` table. **Do not use Supabase Auth.**
- **Permissions**: Managed via `ProtectedRoute.tsx` and `user.role` (`Admin` \| `Pengurus`).

## State & Navigation
- **Filter Preservation**: CRUD pages in `/pengurus/*` must preserve filter/search/sort state via URL query params when navigating to forms and back.
- **Admin CRUD**: Primarily uses Modals on the same page. No navigation needed.

## Project Structure Quirks
- **Duplicate Filenames**: `src/pages/admin/GenerusPage.tsx` (Admin CRUD) vs `src/pages/pengurus/GenerusPage.tsx` (Pengurus view).
- **Icons**: Custom wrapper `src/components/ui/Icon.tsx` using Material Symbols.
- **Cascading Filters**: Admin filters follow `Desa -> Kelompok -> Rombel` hierarchy.

## Verification Checklist
1. `npm run build` to catch TypeScript errors.
2. Verify filter state persists after form submission/cancellation on Pengurus pages.
3. Check `src/types/index.ts` before modifying DB-linked interfaces.
