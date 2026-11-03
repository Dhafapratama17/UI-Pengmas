export interface SectionMeta {
  title: string;
  phase: string;
  description: string;
}

export const adminSections: Record<string, SectionMeta> = {
  buku: {
    title: "Manajemen Buku",
    phase: "Fase 8",
    description:
      "CRUD buku, kategori, stok salinan, dan arsipkan koleksi (design 4.md §13.2).",
  },
  peminjaman: {
    title: "Manajemen Peminjaman",
    phase: "Fase 8",
    description:
      "Sirkulasi pinjam-kembali: persetujuan, pengembalian, dan denda sesuai kebijakan.",
  },
  member: {
    title: "Manajemen Member",
    phase: "Fase 8",
    description:
      "Verifikasi keanggotaan dan kelola akun member (tabel profiles, RLS admin).",
  },
  kegiatan: {
    title: "Manajemen Kegiatan",
    phase: "Fase 8",
    description:
      "Buat, perbarui, publikasikan, dan tutup kegiatan; atur kuota & deadline.",
  },
  pendaftaran: {
    title: "Pendaftaran Kegiatan",
    phase: "Fase 8",
    description:
      "Kelola pendaftaran (registrations) untuk kegiatan gratis maupun berbayar.",
  },
  pembayaran: {
    title: "Verifikasi Pembayaran",
    phase: "Fase 8",
    description:
      "Verifikasi bukti transfer: pending → verified/rejected dengan alasan penolakan.",
  },
  donasi: {
    title: "Manajemen Donasi",
    phase: "Fase 8",
    description:
      "Tinjau donasi finansial dan buku fisik; konfirmasi jadwal drop-off.",
  },
  volunteer: {
    title: "Manajemen Volunteer",
    phase: "Fase 8",
    description:
      "Persetujuan relawan dan penugasan per kegiatan (volunteer_assignments).",
  },
  laporan: {
    title: "Laporan",
    phase: "Fase 8",
    description: "Statistik operasional dan laporan periodik pustaka.",
  },
  pengaturan: {
    title: "Pengaturan Website",
    phase: "Fase 8",
    description:
      "Alamat, kontak, QRIS, rekening resmi (site_settings) — jangan diisi data fiktif.",
  },
};

export const memberSections: Record<string, SectionMeta> = {};

export const volunteerSections: Record<string, SectionMeta> = {};
