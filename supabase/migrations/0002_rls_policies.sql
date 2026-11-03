-- ReteMali RLS policies (Fase 1)
-- Hiding menus di frontend tidak cukup: setiap tabel dilindungi di level database.

alter table public.profiles enable row level security;
alter table public.book_categories enable row level security;
alter table public.books enable row level security;
alter table public.borrowings enable row level security;
alter table public.activities enable row level security;
alter table public.activity_registrations enable row level security;
alter table public.donations enable row level security;
alter table public.payments enable row level security;
alter table public.volunteer_assignments enable row level security;
alter table public.attendance_records enable row level security;
alter table public.site_settings enable row level security;

-- PROFILES ------------------------------------------------------------------
create policy "profiles: read own" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "profiles: update own" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

-- Pelindung: member/volunteer tidak boleh mengangkat peran,
-- status keanggotaan, atau nomor member miliknya sendiri.
create or replace function public.guard_profile_role_change()
returns trigger language plpgsql security definer as $$
begin
  if public.is_admin() then
    return new;
  end if;
  if new.role is distinct from old.role
    or new.membership_status is distinct from old.membership_status
    or new.volunteer_approval_status is distinct from old.volunteer_approval_status
    or new.member_no is distinct from old.member_no
  then
    raise exception 'Peran dan status keanggotaan hanya dapat diubah oleh admin.';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role_change
  before update on public.profiles
  for each row execute function public.guard_profile_role_change();

-- Profil baru otomatis dibuat saat seseorang mendaftar via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      split_part(coalesce(new.email, 'Tanpa Email'), '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger handle_new_user
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- BOOK CATEGORIES -----------------------------------------------------------
create policy "categories: public read" on public.book_categories
  for select using (true);

-- BOOKS -----------------------------------------------------------------------
create policy "books: public read published" on public.books
  for select using (status = 'published' or public.is_admin());

create policy "books: admin write" on public.books
  for all using (public.is_admin()) with check (public.is_admin());

-- ACTIVITIES --------------------------------------------------------------------
create policy "activities: public read published" on public.activities
  for select using (status = 'published' or public.is_admin() or public.is_approved_volunteer());

create policy "activities: admin write" on public.activities
  for all using (public.is_admin()) with check (public.is_admin());

-- BORROWINGS -----------------------------------------------------------------------
create policy "borrowings: read own or admin" on public.borrowings
  for select using (member_id = auth.uid() or public.is_admin());

create policy "borrowings: admin write" on public.borrowings
  for all using (public.is_admin()) with check (public.is_admin());

-- ACTIVITY REGISTRATIONS ----------------------------------------------------------------
-- TAMBAHAN: baris guest tidak dapat dibaca publik; konfirmasi ditampilkan
-- langsung dari respons submit. Pengunjung publik tidak melihat riwayat orang lain.
create policy "registrations: read own or admin" on public.activity_registrations
  for select using (
    member_id = auth.uid()
    or public.is_admin()
  );

create policy "registrations: guest insert" on public.activity_registrations
  for insert with check (true);

create policy "registrations: own update" on public.activity_registrations
  for update using (member_id = auth.uid()) with check (member_id = auth.uid());

-- Pelindung: pemilik hanya boleh membatalkan (status -> 'cancelled').
create or replace function public.guard_registration_cancel_only()
returns trigger language plpgsql security definer as $$
begin
  if public.is_admin() then
    return new;
  end if;
  if new.registered_at <> old.registered_at
    or new.activity_id is distinct from old.activity_id
    or new.member_id is distinct from old.member_id
    or new.guest_name is distinct from old.guest_name
    or new.guest_email is distinct from old.guest_email
    or new.guest_phone is distinct from old.guest_phone
  then
    raise exception 'Isi pendaftaran tidak dapat diubah; hanya pembatalan yang diizinkan.';
  end if;
  if new.status is distinct from old.status and new.status <> 'cancelled' then
    raise exception 'Hanya pembatalan (cancelled) yang diperbolehkan.';
  end if;
  return new;
end;
$$;

create trigger registrations_guard_cancel_only
  before update on public.activity_registrations
  for each row execute function public.guard_registration_cancel_only();

-- DONATIONS -------------------------------------------------------------------------------
create policy "donations: read admin only" on public.donations
  for select using (public.is_admin());

create policy "donations: guest insert" on public.donations
  for insert with check (true);

create policy "donations: admin update" on public.donations
  for update using (public.is_admin()) with check (public.is_admin());

-- PAYMENTS ----------------------------------------------------------------------------------
create policy "payments: read own or admin" on public.payments
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.activity_registrations r
      where r.id = payments.activity_registration_id
        and r.member_id = auth.uid()
    )
  );

create policy "payments: insert own or admin" on public.payments
  for insert with check (
    public.is_admin()
    or (
      subject = 'activity_registration'
      and activity_registration_id is not null
      and exists (
        select 1 from public.activity_registrations r
        where r.id = payments.activity_registration_id
          and r.member_id = auth.uid()
      )
    )
    or (
      subject = 'donation'
      and donation_id is not null
      and exists (
        select 1 from public.donations d
        where d.id = payments.donation_id
          and d.donor_email = (
            select p.email from public.profiles p where p.id = auth.uid()
          )
      )
    )
  );
-- Bukti pengunjung publik (tanpa akun) disimpan di kolom donations.evidence_url
-- yang diisi melalui route server (Fase 6), bukan melalui insert payments publik.

create policy "payments: admin verify" on public.payments
  for update using (public.is_admin()) with check (public.is_admin());

-- VOLUNTEER ASSIGNMENTS -----------------------------------------------------------------------
create policy "assignments: volunteer read own, admin full" on public.volunteer_assignments
  for select using (volunteer_id = auth.uid() or public.is_admin());

create policy "assignments: admin write" on public.volunteer_assignments
  for all using (public.is_admin()) with check (public.is_admin());

-- ATTENDANCE RECORDS ------------------------------------------------------------------------------
create policy "attendance: read own or admin" on public.attendance_records
  for select using (person_id = auth.uid() or public.is_admin());

create policy "attendance: insert admin or scanner service" on public.attendance_records
  for insert with check (public.is_admin());

-- SITE SETTINGS -------------------------------------------------------------------------------------
create policy "settings: public read" on public.site_settings
  for select using (true);

create policy "settings: admin write" on public.site_settings
  for update using (public.is_admin()) with check (public.is_admin());

-- STORAGE: bucket bukti pembayaran (privat) ------------------------------------

insert into storage.buckets (id, name, public)
values ('payment-evidence', 'payment-evidence', false)
on conflict (id) do nothing;

create policy "payment-evidence: upload own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'payment-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "payment-evidence: read own or admin" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'payment-evidence'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );
