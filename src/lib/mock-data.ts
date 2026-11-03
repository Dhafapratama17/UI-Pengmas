import type {
  Activity,
  ActivityQrToken,
  ActivityRegistration,
  AppNotification,
  AttendanceRecord,
  Book,
  BookCategory,
  Borrowing,
  Donation,
  Payment,
  Profile,
  SiteSettings,
  VolunteerAssignment,
} from "@/types/db";

export const mockAccountPassword = "retemali2026-demo";

export interface MockAccount {
  profileId: string;
  email: string;
  password: string;
}

export const mockCategories: BookCategory[] = [
  { id: "cat-01", name: "Membaca", slug: "membaca" },
  { id: "cat-02", name: "Sains", slug: "sains" },
  { id: "cat-03", name: "Novel", slug: "novel" },
  { id: "cat-04", name: "Anak-anak", slug: "anak" },
  { id: "cat-05", name: "Dongeng", slug: "dongeng" },
];

export const mockProfiles: Profile[] = [
  {
    id: "usr-001",
    memberNo: "RM-2026-001",
    email: "siti.member@contoh-email.test",
    fullName: "Siti Rahmawati",
    phone: "0810-0000-001",
    avatarUrl: null,
    role: "member",
    membershipStatus: "active",
    volunteerApprovalStatus: "pending",
    createdAt: "2026-03-02",
  },
  {
    id: "usr-002",
    memberNo: "RM-2026-002",
    email: "budi.member@contoh-email.test",
    fullName: "Budi Santoso",
    phone: "0810-0000-002",
    avatarUrl: null,
    role: "member",
    membershipStatus: "active",
    volunteerApprovalStatus: "pending",
    createdAt: "2026-04-15",
  },
  {
    id: "usr-003",
    memberNo: "RM-2026-003",
    email: "ayu.member@contoh-email.test",
    fullName: "Ayu Lestari",
    phone: "0810-0000-003",
    avatarUrl: null,
    role: "member",
    membershipStatus: "active",
    volunteerApprovalStatus: "pending",
    createdAt: "2026-05-20",
  },
  {
    id: "usr-v01",
    memberNo: "RM-2026-021",
    email: "rian.volunteer@contoh-email.test",
    fullName: "Rian Hidayat",
    phone: "0810-0000-021",
    avatarUrl: null,
    role: "volunteer",
    membershipStatus: "active",
    volunteerApprovalStatus: "approved",
    createdAt: "2026-02-10",
  },
  {
    id: "usr-a01",
    memberNo: "RM-2026-099",
    email: "admin@contoh-email.test",
    fullName: "Admin ReteMali",
    phone: null,
    avatarUrl: null,
    role: "admin",
    membershipStatus: "active",
    volunteerApprovalStatus: "rejected",
    createdAt: "2026-01-05",
  },
];

export const mockBooks: Book[] = [
  {
    id: "buk-001",
    title: "Laskar Pelangi",
    author: "Andrea Hirata",
    publisher: "Bentang Pustaka",
    publicationYear: 2005,
    isbn: "9793062794",
    categoryId: "cat-03",
    synopsis:
      "Kisah perjuangan sepuluh anak Belitung meraih pendidikan di sekolah Muhammadiyah penuh keterbatasan.",
    coverUrl: null,
    totalCopies: 3,
    availableCopies: 2,
    status: "published",
    popularity: 42,
    createdAt: "2026-01-12",
  },
  {
    id: "buk-002",
    title: "Bumi",
    author: "Tere Liye",
    publisher: "Republika",
    publicationYear: 2014,
    isbn: "9786029971468",
    categoryId: "cat-03",
    synopsis:
      "Petualangan Raib, Ali, dan Seli menjelajahi dunia paralel yang penuh misteri.",
    coverUrl: null,
    totalCopies: 3,
    availableCopies: 0,
    status: "published",
    popularity: 55,
    createdAt: "2026-01-12",
  },
  {
    id: "buk-003",
    title: "Ensiklopedia Sains untuk Anak",
    author: "Tim Literasi ReteMali",
    publisher: "Kumpulan donatur",
    publicationYear: 2019,
    isbn: null,
    categoryId: "cat-02",
    synopsis:
      "Enam ratus entri sains ramah anak dengan ilustrasi berwarna dari koleksi donasi.",
    coverUrl: null,
    totalCopies: 5,
    availableCopies: 5,
    status: "published",
    popularity: 30,
    createdAt: "2026-02-01",
  },
  {
    id: "buk-004",
    title: "Gerbang Dunia Dongeng",
    author: "Kumpulan Penulis Taman Baca",
    publisher: "Salinan lokal",
    publicationYear: 2018,
    isbn: null,
    categoryId: "cat-05",
    synopsis:
      "Antologi dongeng Nusantara yang disalin ulang untuk sesi baca anak setiap Sabtu.",
    coverUrl: null,
    totalCopies: 4,
    availableCopies: 3,
    status: "published",
    popularity: 21,
    createdAt: "2026-02-01",
  },
  {
    id: "buk-005",
    title: "Cantik Itu Luka",
    author: "Eka Kurniawan",
    publisher: "Gramedia",
    publicationYear: 2002,
    isbn: "9789799798251",
    categoryId: "cat-03",
    synopsis:
      "Novel dua generasi perempuan Halimunda berlatar sejarah Indonesia abad ke-20.",
    coverUrl: null,
    totalCopies: 2,
    availableCopies: 1,
    status: "published",
    popularity: 18,
    createdAt: "2026-03-05",
  },
  {
    id: "buk-006",
    title: "Sejarah untuk Semua: Indonesia",
    author: "Adrian Vickers",
    publisher: "Kenji Edition",
    publicationYear: 2018,
    isbn: "9786021051116",
    categoryId: "cat-02",
    synopsis:
      "Riwayat kawasan dari kerajaan awal hingga masa modern ditulis ringan untuk pembaca umum.",
    coverUrl: null,
    totalCopies: 2,
    availableCopies: 2,
    status: "published",
    popularity: 12,
    createdAt: "2026-03-05",
  },
  {
    id: "buk-007",
    title: "Ayahku (Bukan) Pemarah",
    author: "Erni A. H., dkk.",
    publisher: "Literata",
    publicationYear: 2020,
    isbn: "9786236043096",
    categoryId: "cat-04",
    synopsis:
      "Kumpulan kisah keluarga horizontal dengan humor dan kehangatan rumah.",
    coverUrl: null,
    totalCopies: 3,
    availableCopies: 3,
    status: "published",
    popularity: 25,
    createdAt: "2026-04-02",
  },
  {
    id: "buk-008",
    title: "Aroma Karsa",
    author: "Dee Lestari",
    publisher: "Bentang Pustaka",
    publicationYear: 2018,
    isbn: "9786022914192",
    categoryId: "cat-03",
    synopsis:
      "Perburuan simbol sumpah paripurna Jati Wesi beserta Supriyo, pengrajin karsa misterius.",
    coverUrl: null,
    totalCopies: 2,
    availableCopies: 1,
    status: "published",
    popularity: 33,
    createdAt: "2026-04-02",
  },
  {
    id: "buk-009",
    title: "Kamus Harta Karun Baca Anak",
    author: "Tim Literasi ReteMali",
    publisher: "Kumpulan donatur",
    publicationYear: 2021,
    isbn: null,
    categoryId: "cat-04",
    synopsis:
      "Kamus ilustrasi kata dasar untuk membantu anak memulai membaca mandiri.",
    coverUrl: null,
    totalCopies: 6,
    availableCopies: 4,
    status: "published",
    popularity: 28,
    createdAt: "2026-05-11",
  },
  {
    id: "buk-010",
    title: "Cosmos: Ada di Mata Bintang",
    author: "Ann Druyan, dkk.",
    publisher: "Kenji Edition",
    publicationYear: 2020,
    isbn: "9786021051222",
    categoryId: "cat-02",
    synopsis:
      "Pengantar astronomi populer dengan infografis sederhana untuk pembaca pemula.",
    coverUrl: null,
    totalCopies: 2,
    availableCopies: 0,
    status: "published",
    popularity: 15,
    createdAt: "2026-06-01",
  },
  {
    id: "buk-011",
    title: "Max Havelaar",
    author: "Multatuli",
    publisher: "Kader Pustaka",
    publicationYear: 1860,
    isbn: "9789799798375",
    categoryId: "cat-03",
    synopsis:
      "Klasik satir kolonial yang memperkenalkan isu keadilan sosial pada era Hindia Belanda.",
    coverUrl: null,
    totalCopies: 2,
    availableCopies: 2,
    status: "published",
    popularity: 9,
    createdAt: "2026-06-01",
  },
  {
    id: "buk-012",
    title: "Garuda di Dadaku: Cerita Pahlawan",
    author: "Kumpulan Penulis Taman Baca",
    publisher: "Salinan lokal",
    publicationYear: 2017,
    isbn: null,
    categoryId: "cat-01",
    synopsis:
      "Kumpulan kisah pahlawan nasional disalin ulang untuk sesi baca menengah.",
    coverUrl: null,
    totalCopies: 4,
    availableCopies: 4,
    status: "published",
    popularity: 14,
    createdAt: "2026-07-03",
  },
];

export const mockActivities: Activity[] = [
  {
    id: "act-001",
    title: "Sesi Baca Anak Sabtu Pagi",
    description:
      "Membaca bersama anak usia 6-12 tahun dengan pembacaan bergantian dan kreatifitas sederhana.",
    posterUrl: null,
    startsAt: "2026-11-07T09:00:00+07:00",
    endsAt: "2026-11-07T11:00:00+07:00",
    location: "Ruang Utama Taman Baca ReteMali",
    organizer: "Panitia Literasi ReteMali",
    feeAmount: 0,
    capacity: 25,
    registrationDeadline: "2026-11-05T23:59:00+07:00",
    status: "published",
    createdAt: "2026-10-01",
  },
  {
    id: "act-002",
    title: "Workshop Cerpen Remaja",
    description:
      "Pelatihan menulis cerpen dua hari untuk remaja usia 13-18 tahun dengan mentor penulis.",
    posterUrl: null,
    startsAt: "2026-11-14T13:00:00+07:00",
    endsAt: "2026-11-15T16:00:00+07:00",
    location: "Ruang Utama Taman Baca ReteMali",
    organizer: "Panitia Literasi ReteMali",
    feeAmount: 50000,
    capacity: 15,
    registrationDeadline: "2026-11-10T23:59:00+07:00",
    status: "published",
    createdAt: "2026-10-02",
  },
  {
    id: "act-003",
    title: "Diskusi Buku: Laskar Pelangi",
    description:
      "Diskusi santai membahas buku paling populer di katalog ReteMali bulan ini.",
    posterUrl: null,
    startsAt: "2026-11-21T16:00:00+07:00",
    endsAt: "2026-11-21T18:00:00+07:00",
    location: "Ruang Diskusi",
    organizer: "Klub Baca ReteMali",
    feeAmount: 0,
    capacity: 20,
    registrationDeadline: "2026-11-19T23:59:00+07:00",
    status: "published",
    createdAt: "2026-10-05",
  },
  {
    id: "act-004",
    title: "Kelas Literasi Banjir Asia",
    description:
      "Kelas literasi digital dasar bagi orang tua dan orang dewasa pemula.",
    posterUrl: null,
    startsAt: "2026-11-28T10:00:00+07:00",
    endsAt: "2026-11-28T12:00:00+07:00",
    location: "Ruang Utama Taman Baca ReteMali",
    organizer: "Klub Baca ReteMali",
    feeAmount: 25000,
    capacity: 10,
    registrationDeadline: "2026-11-25T23:59:00+07:00",
    status: "published",
    createdAt: "2026-10-08",
  },
  {
    id: "act-005",
    title: "Panggung Dongeng Mungkin",
    description:
      "Panggung tulis ulang dongeng oleh anak-anak anggota Taman Baca ReteMali.",
    posterUrl: null,
    startsAt: "2026-11-21T15:00:00+07:00",
    endsAt: "2026-11-21T18:00:00+07:00",
    location: "Halaman Belakang",
    organizer: "Panitia Literasi ReteMali",
    feeAmount: 0,
    capacity: 40,
    registrationDeadline: "2026-11-01T23:59:00+07:00",
    status: "draft",
    createdAt: "2026-10-10",
  },
  {
    id: "act-006",
    title: "Sesi Baca Usia Dini Sepuluh",
    description:
      "Sesi baca mingguan untuk usia dini 4-6 tahun yang telah selesai pada Oktober.",
    posterUrl: null,
    startsAt: "2026-10-24T09:00:00+07:00",
    endsAt: "2026-10-24T10:30:00+07:00",
    location: "Sudut Baca Anak",
    organizer: "Panitia Literasi ReteMali",
    feeAmount: 0,
    capacity: 20,
    registrationDeadline: "2026-10-20T23:59:00+07:00",
    status: "published",
    createdAt: "2026-09-15",
  },
];

export const mockBorrowings: Borrowing[] = [
  {
    id: "brw-001",
    memberId: "usr-001",
    bookId: "buk-002",
    borrowedAt: "2026-10-05",
    dueDate: "2026-10-19",
    returnedAt: null,
    status: "active",
  },
  {
    id: "brw-002",
    memberId: "usr-001",
    bookId: "buk-001",
    borrowedAt: "2026-09-20",
    dueDate: "2026-10-04",
    returnedAt: "2026-10-02",
    status: "returned",
  },
  {
    id: "brw-003",
    memberId: "usr-001",
    bookId: "buk-005",
    borrowedAt: "2026-08-01",
    dueDate: "2026-08-15",
    returnedAt: null,
    status: "overdue",
  },
  {
    id: "brw-004",
    memberId: "usr-002",
    bookId: "buk-010",
    borrowedAt: "2026-10-10",
    dueDate: "2026-10-24",
    returnedAt: null,
    status: "active",
  },
];

export const mockRegistrations: ActivityRegistration[] = [
  {
    id: "reg-001",
    reference: "REG-2026-0001",
    activityId: "act-001",
    memberId: "usr-001",
    guestName: null,
    guestEmail: null,
    guestPhone: null,
    registeredAt: "2026-10-12",
    status: "registered",
  },
  {
    id: "reg-002",
    reference: "REG-2026-0002",
    activityId: "act-001",
    memberId: "usr-002",
    guestName: null,
    guestEmail: null,
    guestPhone: null,
    registeredAt: "2026-10-13",
    status: "registered",
  },
  {
    id: "reg-003",
    reference: "REG-2026-0003",
    activityId: "act-002",
    memberId: "usr-001",
    guestName: null,
    guestEmail: null,
    guestPhone: null,
    registeredAt: "2026-10-20",
    status: "registered",
  },
];

export const mockPayments: Payment[] = [
  {
    id: "pay-001",
    subject: "activity_registration",
    activityRegistrationId: "reg-003",
    donationId: null,
    amount: 50000,
    method: "bank_transfer",
    evidenceUrl: "mock/evidence/reg-003/bukti-transfer-01.jpg",
    status: "pending",
    verifiedAt: null,
    rejectionReason: null,
    createdAt: "2026-10-20",
  },
  {
    id: "pay-002",
    subject: "donation",
    activityRegistrationId: null,
    donationId: "don-001",
    amount: 100000,
    method: "qris",
    evidenceUrl: "mock/evidence/don-001/bukti-qris-01.jpg",
    status: "verified",
    verifiedAt: "2026-10-18",
    rejectionReason: null,
    createdAt: "2026-10-17",
  },
];

export const mockDonations: Donation[] = [
  {
    id: "don-001",
    reference: "DON-2026-0001",
    type: "financial",
    donorName: "Hamba Allah",
    donorEmail: "donatur@contoh-email.test",
    donorPhone: "0810-0000-777",
    amount: 100000,
    bookCount: null,
    bookTitles: null,
    bookCondition: null,
    notes: null,
    paymentMethod: "qris",
    evidenceUrl: "mock/evidence/don-001/bukti-qris-01.jpg",
    dropOffAt: null,
    status: "confirmed",
    createdAt: "2026-10-17",
  },
  {
    id: "don-002",
    reference: "DON-2026-0002",
    type: "physical",
    donorName: "Nadia Fadilah",
    donorEmail: "nadia@contoh-email.test",
    donorPhone: "0810-0000-888",
    amount: null,
    bookCount: 8,
    bookTitles:
      "Ensiklopedia Sains untuk Anak, Gerbang Dunia Dongeng, dll.",
    bookCondition: "Baik",
    notes: "Sebagian buku untuk anak usia SD.",
    paymentMethod: null,
    evidenceUrl: null,
    dropOffAt: "2026-11-02T10:00:00+07:00",
    status: "pending",
    createdAt: "2026-10-26",
  },
];

export const mockAssignments: VolunteerAssignment[] = [
  {
    id: "asg-001",
    volunteerId: "usr-v01",
    activityId: "act-001",
    responsibilities: "Mengatur pendaftaran di meja depan dan mengarahkan anak.",
  },
  {
    id: "asg-002",
    volunteerId: "usr-v01",
    activityId: "act-003",
    responsibilities: "Moderasi diskusi dan mencatat rangkuman pembaca utama.",
  },
];

export const mockAttendance: AttendanceRecord[] = [
  {
    id: "atd-001",
    activityId: "act-006",
    personId: "usr-v01",
    personRole: "volunteer",
    scannedAt: "2026-10-24T08:55:00+07:00",
  },
  {
    id: "atd-002",
    activityId: "act-006",
    personId: "usr-002",
    personRole: "member",
    scannedAt: "2026-10-24T09:05:00+07:00",
  },
];

export const mockSiteSettings: SiteSettings = {
  address: null,
  mapsUrl: null,
  instagramUrl: null,
  phone: null,
  email: null,
  qrisImageUrl: null,
  bankName: null,
  bankAccountNumber: null,
  bankAccountHolder: null,
  donationInstructions: null,
};

export function createMockNotifications(): AppNotification[] {
  const now = new Date().toISOString();
  const earlier = new Date(Date.now() - 26 * 3600 * 1000).toISOString();
  const older = new Date(Date.now() - 70 * 3600 * 1000).toISOString();
  return [
    {
      id: "ntf-001",
      userId: "usr-001",
      category: "pembayaran",
      title: "Pembayaran menunggu verifikasi",
      body: "Registrasi Workshop Cerpen Remaja (REG-2026-0003): bukti transfer sedang diverifikasi admin. Status tetap menunggu sampai konfirmasi admin.",
      href: "/member/kegiatan",
      readAt: null,
      createdAt: now,
    },
    {
      id: "ntf-002",
      userId: "usr-001",
      category: "kegiatan",
      title: "Registrasi berhasil",
      body: "Anda terdaftar pada Sesi Baca Anak Sabtu Pagi melalui referensi REG-2026-0001.",
      href: "/member/kegiatan",
      readAt: earlier,
      createdAt: earlier,
    },
    {
      id: "ntf-003",
      userId: "usr-001",
      category: "donasi",
      title: "Donasi Anda sedang diproses",
      body: "Donasi untuk Taman Baca ReteMali tercatat. Status dapat dipantau melalui halaman status donasi.",
      href: "/donasi/status",
      readAt: null,
      createdAt: older,
    },
    {
      id: "ntf-004",
      userId: "usr-v01",
      category: "kegiatan",
      title: "Tugas relawan di Sesi Baca Anak Sabtu Pagi",
      body: "Anda bertugas mengatur pendaftaran di meja depan. Buka menu QR Absensi saat kegiatan dimulai.",
      href: "/volunteer/qr-absensi",
      readAt: null,
      createdAt: now,
    },
    {
      id: "ntf-005",
      userId: "usr-v01",
      category: "pengumuman",
      title: "Pengumuman koordinator",
      body: "Gunakan pakaian bertema hijau pada kegiatan Sesi Baca Anak Sabtu Pagi.",
      href: "/volunteer/kegiatan",
      readAt: null,
      createdAt: older,
    },
    {
      id: "ntf-006",
      userId: "usr-a01",
      category: "pembayaran",
      title: "Pembayaran baru menunggu verifikasi",
      body: "Referensi REG-2026-0003 mengirim bukti transfer sebesar Rp 50.000.",
      href: "/admin/pembayaran",
      readAt: null,
      createdAt: now,
    },
    {
      id: "ntf-007",
      userId: "usr-a01",
      category: "donasi",
      title: "Pengajuan donasi buku baru",
      body: "Nadia Fadilah mengajukan 8 buku (drop-off 2 November).",
      href: "/admin/donasi",
      readAt: earlier,
      createdAt: earlier,
    },
  ];
}

export function createMockQrTokens(): ActivityQrToken[] {
  const now = new Date().toISOString();
  return [
    {
      id: "qrt-001",
      activityId: "act-001",
      token: "rt-demo-sesi-baca-001",
      active: false,
      expiresAt: new Date(
        new Date("2026-11-07T11:00:00+07:00").getTime() + 60 * 60 * 1000,
      ).toISOString(),
      createdBy: "usr-a01",
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export interface MockStore {
  profiles: Profile[];
  accounts: MockAccount[];
  categories: BookCategory[];
  books: Book[];
  borrowings: Borrowing[];
  activities: Activity[];
  registrations: ActivityRegistration[];
  payments: Payment[];
  donations: Donation[];
  assignments: VolunteerAssignment[];
  attendance: AttendanceRecord[];
  settings: SiteSettings;
  notifications: AppNotification[];
  qrTokens: ActivityQrToken[];
}

export function createMockStore(): MockStore {
  return {
    profiles: mockProfiles.map((p) => ({ ...p })),
    accounts: [],
    categories: mockCategories.map((c) => ({ ...c })),
    books: mockBooks.map((bk) => ({ ...bk })),
    borrowings: mockBorrowings.map((x) => ({ ...x })),
    activities: mockActivities.map((a) => ({ ...a })),
    registrations: mockRegistrations.map((r) => ({ ...r })),
    payments: mockPayments.map((p) => ({ ...p })),
    donations: mockDonations.map((d) => ({ ...d })),
    assignments: mockAssignments.map((x) => ({ ...x })),
    attendance: mockAttendance.map((x) => ({ ...x })),
    settings: { ...mockSiteSettings },
    notifications: createMockNotifications(),
    qrTokens: createMockQrTokens(),
  };
}
