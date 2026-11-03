import { z } from "zod";

export const guestParticipantSchema = z.object({
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  email: z.email("Alamat email tidak valid"),
  phone: z.string().min(8, "Nomor telepon minimal 8 digit"),
});

export const freeActivityRegistrationSchema = guestParticipantSchema.extend({
  activityId: z.string().min(1),
});

export const paidActivityRegistrationSchema = freeActivityRegistrationSchema.extend(
  {
    method: z.enum(["qris", "bank_transfer"]),
    evidenceUrl: z.string().min(1, "Bukti pembayaran wajib diunggah"),
  }
);

export const financialDonationSchema = guestParticipantSchema.extend({
  amount: z.number().int().positive("Nominal donasi harus lebih dari 0"),
  method: z.enum(["qris", "bank_transfer"]),
  notes: z.string().max(500).optional(),
});

export const physicalBookDonationSchema = guestParticipantSchema.extend({
  bookCount: z.number().int().positive("Jumlah buku harus lebih dari 0"),
  bookTitles: z.string().min(1, "Daftar buku wajib diisi"),
  bookCategory: z.string().min(1, "Kategori buku wajib dipilih"),
  bookCondition: z.enum(["Baru", "Baik", "Layak pakai", "Butuh perbaikan"]),
  notes: z.string().max(500).optional(),
  dropOffAt: z.string().min(1, "Jadwal drop-off wajib dipilih"),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  phone: z.string().min(8, "Nomor WhatsApp/HP minimal 8 digit"),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi"),
    newPassword: z.string().min(8, "Kata sandi baru minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Konfirmasi kata sandi tidak sama dengan kata sandi baru",
    path: ["confirmPassword"],
  });

export const bookWriteFields = {
  title: z.string().min(2, "Judul buku minimal 2 karakter"),
  author: z.string().min(2, "Nama penulis minimal 2 karakter"),
  publisher: z.string().min(2, "Nama penerbit minimal 2 karakter"),
  publicationYear: z
    .number()
    .int()
    .min(1900, "Tahun terbit minimal 1900")
    .max(new Date().getFullYear() + 1, "Tahun terbit tidak wajar"),
  isbn: z.string().trim().max(32).optional().nullable(),
  categoryId: z.string().min(1, "Kategori buku wajib dipilih"),
  synopsis: z.string().min(10, "Sinopsis minimal 10 karakter"),
  coverUrl: z.string().trim().optional().nullable(),
  totalCopies: z
    .number()
    .int()
    .min(1, "Total salinan minimal 1"),
  availableCopies: z
    .number()
    .int()
    .min(0, "Salinan tersedia tidak boleh negatif"),
  status: z.enum(["published", "archived"]),
};

export const bookWriteSchema = z
  .object(bookWriteFields)
  .refine((value) => value.availableCopies <= value.totalCopies, {
    message: "Salinan tersedia tidak boleh melebihi total salinan",
    path: ["availableCopies"],
  });

export const bookUpdateSchema = z.object(bookWriteFields).partial();

export const activityWriteFields = {
  title: z.string().min(3, "Judul kegiatan minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi kegiatan minimal 10 karakter"),
  posterUrl: z.string().trim().optional().nullable(),
  startsAt: z.string().min(1, "Waktu mulai wajib diisi"),
  endsAt: z.string().min(1, "Waktu selesai wajib diisi"),
  location: z.string().min(3, "Lokasi kegiatan minimal 3 karakter"),
  organizer: z.string().min(3, "Penanggung jawab minimal 3 karakter"),
  feeAmount: z.number().int().min(0, "Biaya kegiatan tidak boleh negatif"),
  capacity: z.number().int().min(1, "Kapasitas kegiatan minimal 1 peserta"),
  registrationDeadline: z.string().min(1, "Batas pendaftaran wajib diisi"),
  status: z.enum(["draft", "published", "closed", "archived"]),
};

export const activityWriteSchema = z
  .object(activityWriteFields)
  .refine((value) => new Date(value.endsAt) > new Date(value.startsAt), {
    message: "Waktu selesai harus setelah waktu mulai",
    path: ["endsAt"],
  })
  .refine(
    (value) =>
      new Date(value.registrationDeadline) <= new Date(value.startsAt),
    {
      message: "Batas pendaftaran tidak boleh setelah waktu mulai",
      path: ["registrationDeadline"],
    }
  );

export const activityUpdateSchema = z.object(activityWriteFields).partial();

export const membershipStatusSchema = z.object({
  membershipStatus: z.enum(["pending", "active", "expired"]),
});

export const volunteerApprovalSchema = z.object({
  approval: z.enum(["approved", "rejected", "pending"]),
});

export const paymentDecisionSchema = z
  .object({
    decision: z.enum(["verified", "rejected"]),
    rejectionReason: z.string().trim().optional(),
  })
  .refine(
    (value) => value.decision === "verified" || value.rejectionReason,
    {
      message: "Alasan penolakan wajib diisi minimal 5 karakter",
      path: ["rejectionReason"],
    }
  )
  .refine(
    (value) =>
      value.decision === "verified" ||
      (value.rejectionReason?.length ?? 0) >= 5,
    {
      message: "Alasan penolakan wajib diisi minimal 5 karakter",
      path: ["rejectionReason"],
    }
  );

export const physicalDonationStatusSchema = z.object({
  status: z.enum(["confirmed", "rejected", "fulfilled"]),
});

export const loanReturnSchema = z.object({
  action: z.literal("returned"),
});

export const attendanceCheckinSchema = z.object({
  token: z.string().trim().min(8, "Token QR absensi tidak valid"),
});

export const qrTokenToggleSchema = z.object({
  active: z.boolean(),
});

export const broadcastSchema = z.object({
  title: z.string().trim().min(3, "Judul pengumuman minimal 3 karakter"),
  body: z.string().trim().min(5, "Isi pengumuman minimal 5 karakter"),
  target: z.enum(["member", "volunteer", "all"]),
});

export const markReadSchema = z
  .object({
    id: z.string().min(1).optional(),
    all: z.boolean().optional(),
  })
  .refine(
    (value) => Boolean(value.all) !== Boolean(value.id),
    {
      message: "Pilih satu notifikasi atau tandai semua",
    }
  );

const optionalTrimmedText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maksimal ${max} karakter`)
    .optional()
    .nullable();

export const siteSettingsSchema = z
  .object({
    address: optionalTrimmedText(200),
    mapsUrl: z.url("URL Google Maps tidak valid").trim().optional().nullable(),
    instagramUrl: z
      .url("URL Instagram tidak valid")
      .trim()
      .optional()
      .nullable(),
    phone: optionalTrimmedText(32),
    email: z.email("Email tidak valid").trim().optional().nullable(),
    qrisImageUrl: optionalTrimmedText(300),
    bankName: optionalTrimmedText(80),
    bankAccountNumber: optionalTrimmedText(40),
    bankAccountHolder: optionalTrimmedText(80),
    donationInstructions: optionalTrimmedText(500),
  })
  .refine(
    (value) =>
      !value.instagramUrl ||
      /^https?:\/\/(www\.)?(instagram\.com)/i.test(value.instagramUrl),
    {
      message: "URL harus mengarah ke instagram.com",
      path: ["instagramUrl"],
    }
  );

export type GuestParticipantInput = z.infer<typeof guestParticipantSchema>;

export const memberRegistrationSchema = z
  .object({
    fullName: z.string().min(2, "Nama lengkap minimal 2 karakter"),
    email: z.email("Alamat email tidak valid"),
    phone: z.string().min(8, "Nomor WhatsApp/HP minimal 8 digit"),
    password: z.string().min(8, "Kata sandi minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
    agreedTerms: z.boolean().refine((value) => value === true, {
      message: "Persetujuan ketentuan anggota wajib dicentang",
    }),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Konfirmasi kata sandi tidak sama dengan kata sandi",
    path: ["confirmPassword"],
  });

export type MemberRegistrationInput = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreedTerms: boolean;
};

export const passwordRecoverySchema = z.object({
  email: z.email("Alamat email tidak valid"),
});

export type PasswordRecoveryInput = z.infer<typeof passwordRecoverySchema>;
