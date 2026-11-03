# Repository Instructions

## Project
- ReteMali web app (Taman Baca ReteMali library/community PWA, Bahasa Indonesia UI).
- `design (4).md` is the main requirement/spec source (roles, routes, flows, checklist in section 22). Follow it; do not invent features without an explained basis.
- `retemali_library_system.figcraft` is the UI design artifact (1,224 nodes, 32 frames, 0 embedded images). Treat as read-only reference; export to `design-exports/` for pixel reference instead of editing.

## Stack
- Next.js 15 (App Router) + TypeScript strict + React 19 + Tailwind CSS v4 + lucide-react + zod.
- Data layer: `NEXT_PUBLIC_DATA_MODE` = `mock` (default) | `supabase`. Service functions in `src/lib/services/*` branch on this; only the books adapter has a Supabase path so far (`src/lib/services/supabase/books.ts`), other domains throw "Adapter Supabase belum tersedia" in supabase mode.
- SQL schema + RLS + seed live in `supabase/migrations/0001-*.sql` / `0002-*.sql` / `0003-*.sql`. No Supabase credentials exist; do NOT fabricate any. To switch modes, fill `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- Domain types in `src/types/db.ts` use camelCase; SQL uses snake_case — adapters must map columns explicitly.

## Commands (PowerShell, Windows)
- `npm.cmd install`, `npm.cmd run dev` (PowerShell blocks .ps1 shims: always run `npm.cmd`/`npx.cmd`)
- Verify before reporting done: `npx.cmd eslint .`, `npx.cmd tsc --noEmit`, `npx.cmd vitest run`, `npm.cmd run build`
- Production runtime check: `npm.cmd run build` then `npm.cmd start` (port 3000).

## Conventions (differ from defaults)
- No inline code comments; use self-explanatory names instead.
- Payment/registration states: submitted ≠ verified. A payment is `pending` until an admin verifies it — never render unverified payments as success (design doc sections 9.5/10.3).
- Physical book donation is drop-off ONLY (no courier); the UI notice is mandatory (section 10.5).
- Do not fabricate organization contact info, QRIS, or bank details — all belong in `site_settings` (admin-configurable); leave `null` until provided.
- Mock data email domains use `.test`; real org data must never be invented even in mocks.

## Roles (approved)
- Four access modes: public non-member, member, volunteer, admin. Donor is NOT a separate role — donations are a public channel. Volunteer features require `volunteerApprovalStatus = approved`.
- Frontend menu hiding is not authorization; RLS policies (0002) are the real gate. Keep new tables/queries consistent with those policies.

## Logo & assets
- Original logo: `retemali-logo.png` (608x410). App copy: `public/images/retemali-logo.png` (bit-identical SHA-256 `61757B2F...` — verify after any copy). Keep originals untouched; no recolor/distort. Alt text: "Logo Taman Baca ReteMali".
- `publicimageslogo-retemali.png.png` is a redundant duplicate with a malformed name; prefer `retemali-logo.png`.

## Roadmap (approved; do not skip phases)
- Fase 0/1 done: scaffold, tokens (Tailwind `@theme` in `src/app/globals.css`), mock data + services, SQL/RLS/seed, vitest (16 tests in `src/lib/services/__tests__/`).
- Fase 2 done: UI kit `src/components/ui/*` (button, badge, input/select/textarea, card/stat, table, modal, toast provider, empty/error/skeleton, logo) + shells `src/components/layout/*` (`AppShell` client variant public/member/volunteer/admin) + nav config `src/lib/navigation.ts` + route groups: `(auth)/login` 4-mode login, `(public)` beranda/katalog/kegiatan/donasi/design-review, `admin|member|volunteer` layouts with `[section]` placeholder pages (see `src/lib/section-placeholders.ts`). Design QA page: `/design-review`.
- When a later phase fills a `[section]` route, replace the placeholder page (map in `src/lib/section-placeholders.ts`) — do not leave both.
- Next: Fase 3 auth & route guards (wire Supabase Auth to login page; login submit currently validates client-side and honestly reports Fase 3) → Fase 4 catalog search/filter → Fase 5 activities → Fase 6 donations → Fase 7 member/volunteer → Fase 8 admin → Fase 9 QR attendance → Fase 10 polish/deploy.
- Route structure per design (4).md section 17: `(public) /beranda /katalog /kegiatan /donasi` + `/member/*` `/volunteer/*` `/admin/*`.

## FigCraft workflow
- CLI: `C:\Program Files\FigCraft\figcraft-cli.exe` — `info`, `export`, `convert`, `render`, `run`, `mcp`.
- Inspect: `& "C:\Program Files\FigCraft\figcraft-cli.exe" info "retemali_library_system.figcraft" --json`
- Export previews: `... export "retemali_library_system.figcraft" -o "design-exports" --format png` (32 PNGs currently in `design-exports/`, gitignored).
- MCP config: `.agents/mcp_config.json` (`mcp --attach 7979`). FigCraft Desktop must run with its control bridge on port 7979; never change the port in only one file.
