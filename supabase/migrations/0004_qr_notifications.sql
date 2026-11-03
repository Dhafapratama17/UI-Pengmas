-- FASE 9: QR ABSENSI & NOTIFIKASI ------------------------------------------------
-- Token QR per kegiatan: token unik acak (server-side), bukan ID kegiatan.

create table public.activity_qr_tokens (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id),
  token text not null unique check (length(token) >= 16),
  active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index activity_qr_tokens_activity_idx
  on public.activity_qr_tokens (activity_id);

create trigger activity_qr_tokens_updated_at
  before update on public.activity_qr_tokens
  for each row execute function public.set_updated_at();

-- Notifikasi internal aplikasi (per pengguna).

create type notification_category as enum (
  'kegiatan',
  'pembayaran',
  'donasi',
  'absensi',
  'pengumuman',
  'pengingat'
);

create table public.app_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id),
  category notification_category not null,
  title text not null,
  body text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index app_notifications_user_idx
  on public.app_notifications (user_id, created_at desc);

alter table public.activity_qr_tokens enable row level security;
alter table public.app_notifications enable row level security;

-- POLICY: TOKEN QR -------------------------------------------------------------------------------
-- Token tidak boleh dibaca publik; penulisan hanya admin. Check-in memakai
-- service/admin-side lookup (pemanggilan server, bukan query dari client).

create policy "qr tokens: admin full" on public.activity_qr_tokens
  for all using (public.is_admin()) with check (public.is_admin());

-- POLICY: NOTIFIKASI -----------------------------------------------------------------------------

create policy "notifications: read own" on public.app_notifications
  for select using (user_id = auth.uid() or public.is_admin());

create policy "notifications: update own read state" on public.app_notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "notifications: admin insert" on public.app_notifications
  for insert with check (public.is_admin());
