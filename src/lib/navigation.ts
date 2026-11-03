import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  BookMarked,
  BookOpen,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  FileText,
  HeartHandshake,
  History,
  Home,
  LayoutDashboard,
  QrCode,
  Receipt,
  Settings,
  Ticket,
  User,
  UserRoundCog,
  Users,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export type ShellVariant = "public" | "member" | "volunteer" | "admin";

export const publicNav: NavItem[] = [
  { label: "Beranda", href: "/beranda", icon: Home },
  { label: "Katalog Buku", href: "/katalog", icon: BookOpen },
  { label: "Kegiatan Komunitas", href: "/kegiatan", icon: CalendarDays },
  { label: "Donasi", href: "/donasi", icon: HeartHandshake },
];

export const memberNav: NavItem[] = [
  { label: "Dashboard", href: "/member", icon: LayoutDashboard },
  { label: "Profil Saya", href: "/member/profil", icon: User },
  { label: "Peminjaman Saya", href: "/member/peminjaman", icon: BookMarked },
  { label: "Kegiatan Saya", href: "/member/kegiatan", icon: CalendarDays },
  { label: "QR Absensi", href: "/member/qr-absensi", icon: QrCode },
  { label: "Notifikasi", href: "/member/notifikasi", icon: History },
  { label: "Pengaturan Akun", href: "/member/pengaturan", icon: Settings },
];

export const volunteerNav: NavItem[] = [
  { label: "Dashboard", href: "/volunteer", icon: LayoutDashboard },
  { label: "Kegiatan Saya", href: "/volunteer/kegiatan", icon: CalendarDays },
  { label: "Jadwal dan Tugas", href: "/volunteer/jadwal", icon: CalendarClock },
  { label: "QR Absensi", href: "/volunteer/qr-absensi", icon: QrCode },
  { label: "Riwayat Kehadiran", href: "/volunteer/kehadiran", icon: History },
  { label: "Notifikasi", href: "/volunteer/notifikasi", icon: ClipboardList },
  { label: "Profil Saya", href: "/volunteer/profil", icon: User },
];

export const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Manajemen Buku", href: "/admin/buku", icon: BookOpen },
  {
    label: "Manajemen Peminjaman",
    href: "/admin/peminjaman",
    icon: BookMarked,
  },
  { label: "Manajemen Member", href: "/admin/member", icon: Users },
  { label: "Manajemen Kegiatan", href: "/admin/kegiatan", icon: CalendarDays },
  {
    label: "Pendaftaran Kegiatan",
    href: "/admin/pendaftaran",
    icon: Ticket,
  },
  {
    label: "Verifikasi Pembayaran",
    href: "/admin/pembayaran",
    icon: Receipt,
  },
  { label: "Manajemen Donasi", href: "/admin/donasi", icon: HeartHandshake },
  { label: "Manajemen Volunteer", href: "/admin/volunteer", icon: ClipboardList },
  { label: "QR dan Absensi", href: "/admin/absensi", icon: QrCode },
  { label: "Notifikasi", href: "/admin/notifikasi", icon: BellRing },
  { label: "Laporan", href: "/admin/laporan", icon: FileText },
  { label: "Pengaturan Website", href: "/admin/pengaturan", icon: Settings },
  {
    label: "Pengaturan Akun",
    href: "/admin/akun",
    icon: UserRoundCog,
  },
];

export function navForVariant(variant: ShellVariant): NavItem[] {
  switch (variant) {
    case "member":
      return memberNav;
    case "volunteer":
      return volunteerNav;
    case "admin":
      return adminNav;
    default:
      return publicNav;
  }
}
