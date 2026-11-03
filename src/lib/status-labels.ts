import type { ActivityStatus } from "@/types/db";
import type { BadgeTone } from "@/components/ui/badge";

export function activityStatusLabel(status: ActivityStatus): string {
  switch (status) {
    case "draft":
      return "Draf";
    case "published":
      return "Terbit";
    case "closed":
      return "Ditutup";
    default:
      return "Arsip";
  }
}

export function activityStatusTone(status: ActivityStatus): BadgeTone {
  switch (status) {
    case "draft":
      return "neutral";
    case "published":
      return "info";
    case "closed":
      return "warning";
    default:
      return "neutral";
  }
}

export function bookStatusLabel(status: "published" | "archived"): string {
  return status === "published" ? "Tersedia" : "Arsip";
}

export function bookStatusTone(status: "published" | "archived"): BadgeTone {
  return status === "published" ? "success" : "neutral";
}

export function membershipStatusLabel(status: string): string {
  switch (status) {
    case "active":
      return "Aktif";
    case "pending":
      return "Menunggu verifikasi";
    default:
      return "Kedaluwarsa";
  }
}

export function membershipStatusTone(status: string): BadgeTone {
  switch (status) {
    case "active":
      return "success";
    case "pending":
      return "warning";
    default:
      return "neutral";
  }
}

export function volunteerApprovalLabel(status: string): string {
  switch (status) {
    case "approved":
      return "Disetujui";
    case "pending":
      return "Menunggu verifikasi";
    default:
      return "Ditolak";
  }
}

export function volunteerApprovalTone(status: string): BadgeTone {
  switch (status) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    default:
      return "danger";
  }
}

export function paymentStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Menunggu verifikasi";
    case "verified":
      return "Terverifikasi";
    default:
      return "Ditolak";
  }
}

export function paymentStatusTone(status: string): BadgeTone {
  switch (status) {
    case "pending":
      return "warning";
    case "verified":
      return "success";
    default:
      return "danger";
  }
}

export function donationStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Menunggu verifikasi";
    case "confirmed":
      return "Diterima (drop-off)";
    case "rejected":
      return "Ditolak";
    default:
      return "Diproses";
  }
}

export function donationStatusTone(status: string): BadgeTone {
  switch (status) {
    case "pending":
      return "warning";
    case "confirmed":
      return "info";
    case "rejected":
      return "danger";
    default:
      return "success";
  }
}

export function registrationStatusLabel(status: string): string {
  return status === "registered" ? "Terdaftar" : "Dibatalkan";
}

export function registrationStatusTone(status: string): BadgeTone {
  return status === "registered" ? "success" : "neutral";
}

export function paymentSubjectLabel(subject: string): string {
  return subject === "donation" ? "Donasi" : "Registrasi kegiatan";
}

export function notificationCategoryLabel(category: string): string {
  switch (category) {
    case "kegiatan":
      return "Kegiatan";
    case "pembayaran":
      return "Pembayaran";
    case "donasi":
      return "Donasi";
    case "absensi":
      return "Absensi";
    case "pengumuman":
      return "Pengumuman";
    case "pengingat":
      return "Pengingat";
    default:
      return "Notifikasi";
  }
}

export function notificationCategoryTone(category: string): BadgeTone {
  switch (category) {
    case "pembayaran":
      return "warning";
    case "donasi":
      return "info";
    case "absensi":
      return "success";
    case "pengumuman":
      return "danger";
    case "pengingat":
      return "warning";
    default:
      return "info";
  }
}

export function formatDateTimeWib(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}

export function formatDateWib(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}
