-- Seed ReteMali (Fase 1) — data contoh untuk pengembangan.
-- KONTAK ORGANISASI & QRIS SENGAJA KOSONG (null):
-- jangan mengarang nomor telepon, email, alamat, atau QRIS sungguhan.
-- Semua diisi Admin melalui menu Pengaturan Website.

insert into public.book_categories (name, slug) values
  ('Membaca', 'membaca'),
  ('Sains', 'sains'),
  ('Novel', 'novel'),
  ('Anak-anak', 'anak'),
  ('Dongeng', 'dongeng');

insert into public.profiles (id, email, full_name, role, membership_status, volunteer_approval_status)
values
  (gen_random_uuid(), 'member1@contoh-mail.test', 'Siti Rahmawati', 'member', 'active', 'pending'),
  (gen_random_uuid(), 'member2@contoh-mail.test', 'Budi Santoso', 'member', 'active', 'pending'),
  (gen_random_uuid(), 'volunteer1@contoh-mail.test', 'Rian Hidayat', 'volunteer', 'active', 'approved'),
  (gen_random_uuid(), 'admin@contoh-mail.test', 'Admin ReteMali', 'admin', 'active', 'rejected');

insert into public.site_settings (id) values (1);

insert into public.books (title, author, publisher, publication_year, isbn, category_id, synopsis, total_copies, available_copies)
values
  ('Laskar Pelangi', 'Andrea Hirata', 'Bentang Pustaka', 2005, '9793062794', (select id from public.book_categories where slug = 'novel'), 'Kisah kejuangan sepuluh anak Belitung meraih pendidikan penuh keterbatasan.', 3, 2),
  ('Bumi', 'Tere Liye', 'Republika', 2014, '9786029971468', (select id from public.book_categories where slug = 'novel'), 'Petualangan Raib, Ali, dan Seli ke dunia paralel penuh misteri.', 3, 0),
  ('Ensiklopedia Sains untuk Anak', 'Tim Literasi', 'Kumpulan donatur', 2019, null, (select id from public.book_categories where slug = 'sains'), 'Entri sains ramah anak dengan ilustrasi berwarna.', 5, 5),
  ('Ayahku (Bukan) Pemarah', 'Erni A. H., dkk.', 'Literata', 2020, '9786236043096', (select id from public.book_categories where slug = 'anak'), 'Kumpulan kisah keluarga dengan humor dan kehangatan.', 3, 3),
  ('Max Havelaar', 'Multatuli', 'Kader Pustaka', 1860, '9789799798375', (select id from public.book_categories where slug = 'novel'), 'Klasik satir kolonial tentang keadilan sosial.', 2, 2);

insert into public.activities (title, description, starts_at, ends_at, location, organizer, fee_amount, capacity, registration_deadline, status)
values
  ('Sesi Baca Anak Sabtu Pagi', 'Membaca bersama anak usia 6-12 tahun.', '2026-11-07T09:00:00+07:00', '2026-11-07T11:00:00+07:00', 'Ruang Utama', 'Panitia Literasi ReteMali', 0, 25, '2026-11-05T23:59:00+07:00', 'published'),
  ('Workshop Cerpen Remaja', 'Pelatihan menulis cerpen dua hari dengan mentor penulis.', '2026-11-14T13:00:00+07:00', '2026-11-15T16:00:00+07:00', 'Ruang Utama', 'Panitia Literasi ReteMali', 50000, 15, '2026-11-10T23:59:00+07:00', 'published');
