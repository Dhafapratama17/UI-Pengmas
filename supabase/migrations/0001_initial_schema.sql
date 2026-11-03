-- ReteMali initial schema (Fase 1)
-- Entitas mengikuti design (4).md section 19.

create extension if not exists "pgcrypto";

-- ENUM -------------------------------------------------------------------

create type user_role as enum ('member', 'volunteer', 'admin');
create type membership_status as enum ('pending', 'active', 'expired');
create type volunteer_approval as enum ('pending', 'approved', 'rejected');
create type book_status as enum ('published', 'archived');
create type loan_status as enum ('active', 'returned', 'overdue');
create type activity_status as enum ('draft', 'published', 'closed', 'archived');
create type registration_status as enum ('registered', 'cancelled');
create type payment_subject as enum ('activity_registration', 'donation');
create type payment_status as enum ('pending', 'verified', 'rejected');
create type payment_method as enum ('qris', 'bank_transfer');
create type donation_type as enum ('financial', 'physical');
create type donation_status as enum ('pending', 'confirmed', 'rejected', 'fulfilled');
create type attendance_role as enum ('member', 'volunteer');

-- PROFILES (1:1 auth.users) ----------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  member_no text unique not null default ('RM-' || to_char(now(), 'YYYY') || '-' || lpad((floor(random() * 9999) + 1)::text, 3, '0')),
  email text not null,
  full_name text not null,
  phone text,
  avatar_url text,
  role user_role not null default 'member',
  membership_status membership_status not null default 'pending',
  volunteer_approval_status volunteer_approval not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Helper utk policy RLS ---------------------------------------------------

create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select coalesce(
    (select true from public.profiles
      where id = auth.uid() and role = 'admin'),
    false
  );
$$;

create or replace function public.is_approved_volunteer()
returns boolean language sql stable security definer as $$
  select coalesce(
    (select true from public.profiles
      where id = auth.uid()
        and role = 'volunteer'
        and volunteer_approval_status = 'approved'),
    false
  );
$$;

-- BOOKS -------------------------------------------------------------------

create table public.book_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  publisher text not null,
  publication_year int not null check (publication_year between 1000 and 2100),
  isbn text unique,
  category_id uuid not null references public.book_categories (id),
  synopsis text not null default '',
  cover_url text,
  total_copies int not null default 0 check (total_copies >= 0),
  available_copies int not null default 0 check (available_copies >= 0 and available_copies <= total_copies),
  status book_status not null default 'published',
  popularity int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger books_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();

create index books_published_idx on public.books (status);
create index books_category_idx on public.books (category_id);

-- BORROWINGS --------------------------------------------------------------

create table public.borrowings (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books (id),
  member_id uuid not null references public.profiles (id),
  borrowed_at timestamptz not null default now(),
  due_date date not null,
  returned_at timestamptz,
  status loan_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger borrowings_updated_at
  before update on public.borrowings
  for each row execute function public.set_updated_at();

create index borrowings_member_idx on public.borrowings (member_id);

-- ACTIVITIES --------------------------------------------------------------

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  poster_url text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text not null default 'Taman Baca ReteMali',
  organizer text not null default 'Panitia Literasi ReteMali',
  fee_amount numeric(12, 0) not null default 0,
  capacity int not null check (capacity > 0),
  registration_deadline timestamptz not null,
  status activity_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger activities_updated_at
  before update on public.activities
  for each row execute function public.set_updated_at();

-- ACTIVITY REGISTRATIONS ---------------------------------------------------

create table public.activity_registrations (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  activity_id uuid not null references public.activities (id),
  member_id uuid references public.profiles (id),
  guest_name text,
  guest_email text,
  guest_phone text,
  registered_at timestamptz not null default now(),
  status registration_status not null default 'registered',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint registration_identity_or_guest check (
    (member_id is not null) or
    (guest_name is not null and guest_email is not null and guest_phone is not null)
  )
);

create trigger activity_registrations_updated_at
  before update on public.activity_registrations
  for each row execute function public.set_updated_at();

create index activity_registrations_activity_idx on public.activity_registrations (activity_id);

create or replace function public.prevent_duplicate_registration()
returns trigger language plpgsql as $$
begin
  if exists (
    select 1 from public.activity_registrations r
    where r.activity_id = new.activity_id
      and r.status = 'registered'
      and (
        (new.member_id is not null and r.member_id = new.member_id) or
        (new.member_id is null and r.guest_email = new.guest_email)
      )
  ) then
    raise exception 'Anda sudah terdaftar pada kegiatan ini.';
  end if;
  return new;
end;
$$;

create trigger activity_registrations_no_duplicate
  before insert on public.activity_registrations
  for each row execute function public.prevent_duplicate_registration();

-- DONATIONS -----------------------------------------------------------------

create table public.donations (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  type donation_type not null,
  donor_name text not null,
  donor_email text not null,
  donor_phone text not null,
  amount numeric(12, 0),
  book_count int,
  book_titles text,
  book_condition text,
  notes text,
  payment_method payment_method,
  evidence_url text,
  drop_off_at timestamptz,
  status donation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint donation_payload_by_type check (
    (type = 'financial' and amount is not null and amount > 0) or
    (type = 'physical' and book_count is not null and book_count > 0 and book_titles is not null)
  )
);

create trigger donations_updated_at
  before update on public.donations
  for each row execute function public.set_updated_at();

-- PAYMENTS -------------------------------------------------------------------

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  subject payment_subject not null,
  activity_registration_id uuid references public.activity_registrations (id),
  donation_id uuid references public.donations (id),
  amount numeric(12, 0) not null check (amount > 0),
  method payment_method not null,
  evidence_url text,
  status payment_status not null default 'pending',
  verified_at timestamptz,
  verified_by uuid references public.profiles (id),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_subject_ref check (
    (subject = 'activity_registration' and activity_registration_id is not null and donation_id is null) or
    (subject = 'donation' and donation_id is not null and activity_registration_id is null)
  )
);

create trigger payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- VOLUNTEER ASSIGNMENTS & ATTENDANCE ----------------------------------------

create table public.volunteer_assignments (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references public.profiles (id),
  activity_id uuid not null references public.activities (id),
  responsibilities text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger volunteer_assignments_updated_at
  before update on public.volunteer_assignments
  for each row execute function public.set_updated_at();

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id),
  person_id uuid not null references public.profiles (id),
  person_role attendance_role not null,
  scanned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (activity_id, person_id)
);

-- SITE SETTINGS (baris tunggal) -----------------------------------------------

create table public.site_settings (
  id int primary key default 1 check (id = 1),
  address text,
  maps_url text,
  instagram_url text,
  phone text,
  email text,
  qris_image_url text,
  bank_name text,
  bank_account_number text,
  bank_account_holder text,
  donation_instructions text,
  updated_at timestamptz not null default now()
);

create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();
