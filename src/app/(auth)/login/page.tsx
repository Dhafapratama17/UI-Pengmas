"use client";

import { Eye, EyeOff, HeartHandshake, BookOpen, User, ShieldCheck, ArrowRight, CircleAlert, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/components/providers/session-provider";
import { dashboardForRole } from "@/lib/auth/session-cookie";
import { dataMode } from "@/lib/config";

type AccessMode = "nonmember" | "member" | "volunteer" | "admin";

const accessOptions: {
  id: AccessMode;
  title: string;
  description: string;
  icon: typeof User;
  badge?: string;
}[] = [
  {
    id: "nonmember",
    title: "Masuk sebagai Non-Member",
    description: "Tanpa akun — jelajahi katalog, kegiatan, dan donasi.",
    icon: BookOpen,
  },
  {
    id: "member",
    title: "Masuk sebagai Member",
    description: "Akses peminjaman, kegiatan, QR absensi, dan profil.",
    icon: User,
  },
  {
    id: "volunteer",
    title: "Masuk sebagai Volunteer",
    description: "Dashboard relawan: jadwal, tugas, dan absensi.",
    icon: HeartHandshake,
    badge: "Perlu persetujuan admin",
  },
  {
    id: "admin",
    title: "Masuk sebagai Admin",
    description: "Kendali operasional pustaka manajemen.",
    icon: ShieldCheck,
    badge: "Terbatas",
  },
];

interface OptionCardProps {
  option: (typeof accessOptions)[number];
  selected: boolean;
  onSelect: () => void;
}

function AccessOptionCard({ option, selected, onSelect }: OptionCardProps) {
  const Icon = option.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-start gap-3 rounded-card border p-4 text-left transition-all ${
        selected
          ? "border-primary bg-surface-blue ring-2 ring-primary/30"
          : "border-surface-soft bg-white hover:border-primary/50 hover:bg-surface-blue/50"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          selected ? "bg-primary text-white" : "bg-surface text-primary-deep"
        }`}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-ink">{option.title}</span>
          {option.badge ? <Badge tone="warning">{option.badge}</Badge> : null}
        </span>
        <span className="mt-0.5 block text-sm text-ink-soft">
          {option.description}
        </span>
      </span>
    </button>
  );
}

function LoginForm({ mode }: { mode: Exclude<AccessMode, "nonmember"> }) {
  const router = useRouter();
  const { setSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeError, setNoticeError] = useState(false);

  const labels: Record<string, string> = {
    member: "Member",
    volunteer: "Volunteer",
    admin: "Administrator",
  };
  const registerHints: Record<string, string | null> = {
    member: null,
    volunteer: "Akun relawan perlu disetujui admin sebelum dashboard dapat diakses (§4.3).",
    admin: "Kredensial administrator tidak akan pernah diekspos pada frontend.",
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!email.includes("@")) nextErrors.email = "Masukkan alamat email yang valid.";
    if (password.length < 8)
      nextErrors.password = "Password minimal 8 karakter.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setNotice(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setNoticeError(true);
        setNotice(
          data.message ?? "Terjadi kesalahan saat proses login. Coba lagi."
        );
        return;
      }
      setSession(data.session);
      const requestedNext = new URLSearchParams(window.location.search).get("next");
      router.replace(
        requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//")
          ? requestedNext
          : dashboardForRole(data.session.role)
      );
    } catch {
      setNoticeError(true);
      setNotice("Tidak dapat menghubungi server autentikasi. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {registerHints[mode] ? (
        <p className="rounded-field bg-surface-blue px-3 py-2 text-xs text-primary-deep">
          {registerHints[mode]}
        </p>
      ) : null}
      <Input
        id={`${mode}-email`}
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="nama@contoh-email.test"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <Input
        id={`${mode}-password`}
        label="Password"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        trailingNode={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-surface hover:text-ink"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        }
      />
      {notice ? (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-field px-3 py-2.5 text-xs ${
            noticeError
              ? "border border-danger/30 bg-red-50 text-danger"
              : "border border-surface-soft bg-surface-blue/60 text-primary-deep"
          }`}
        >
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{notice}</span>
        </div>
      ) : null}
      {dataMode === "mock" ? <TestAccounts onSelect={(e) => setEmail(e)} /> : null}
      <div className="flex items-center justify-between">
        <Link
          href="/login/lupa-password"
          className="text-xs font-semibold text-primary-deep underline-offset-4 hover:underline"
        >
          Lupa password?
        </Link>
        {mode === "member" ? (
          <Link
            href="/login/daftar"
            className="text-xs font-semibold text-primary-deep underline-offset-4 hover:underline"
          >
            Daftar member baru
          </Link>
        ) : null}
      </div>
      <Button
        type="submit"
        loading={submitting}
        disabled={submitting}
        className="w-full"
      >
        Masuk sebagai {labels[mode]}
      </Button>
      {mode === "member" ? (
        <button
          type="button"
          onClick={() => router.push("/beranda")}
          className="w-full rounded-field px-4 py-2.5 text-sm font-semibold text-primary-deep transition-colors hover:bg-surface-blue"
        >
          Jelajahi dulu tanpa akun
        </button>
      ) : null}
    </form>
  );
}

const testAccounts: { email: string; label: string }[] = [
  { email: "admin@contoh-email.test", label: "Administrator" },
  { email: "rian.volunteer@contoh-email.test", label: "Relawan (disetujui)" },
  { email: "siti.member@contoh-email.test", label: "Member" },
];

function TestAccounts({ onSelect }: { onSelect: (email: string) => void }) {
  return (
    <details className="rounded-field border border-surface-soft bg-surface px-3 py-2.5 text-xs">
      <summary className="cursor-pointer select-none font-semibold text-ink">
        <span className="inline-flex items-center gap-1.5">
          <KeyRound className="h-3.5 w-3.5" aria-hidden />
          Akun uji mode demo (mock)
        </span>
      </summary>
      <ul className="mt-2 space-y-1">
        {testAccounts.map((account) => (
          <li key={account.email} className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-ink-soft">
              <span className="font-semibold text-ink">{account.label}:</span>{" "}
              {account.email}
            </span>
            <button
              type="button"
              onClick={() => onSelect(account.email)}
              className="shrink-0 font-semibold text-primary-deep underline-offset-4 hover:underline"
            >
              Gunakan
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-ink-soft">
        Password demo untuk semua akun uji:{" "}
        <code className="font-mono font-semibold text-ink">retemali2026-demo</code>
      </p>
      <p className="mt-1 text-ink-soft">
        Sesi mock adalah simulasi — keamanan sesi sungguhan berlaku saat mode
        supabase aktif dengan kredensial.
      </p>
    </details>
  );
}

function NonMemberPanel() {
  const router = useRouter();
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-soft">
        Sebagai pengunjung publik tanpa akun, Anda dapat:
      </p>
      <ul className="space-y-2 text-sm text-ink" aria-label="Fitur non-member">
        <li className="rounded-field bg-white px-3 py-2 shadow-card">Melihat beranda, profil, dan kontak pusat pustaka</li>
        <li className="rounded-field bg-white px-3 py-2 shadow-card">Menjelajah dan mencari katalog buku</li>
        <li className="rounded-field bg-white px-3 py-2 shadow-card">Melihat dan mendaftar kegiatan komunitas</li>
        <li className="rounded-field bg-white px-3 py-2 shadow-card">Memberikan donasi finansial atau buku fisik</li>
      </ul>
      <Button className="w-full" onClick={() => router.push("/beranda")}>
        Buka Aplikasi Publik
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>
      <p className="text-center text-xs text-ink-soft">
        Fitur khusus member (pinjam buku, QR absensi) memerlukan akun tervalifikasi.
      </p>
    </div>
  );
}

export default function LoginPage() {
  const [selected, setSelected] = useState<AccessMode>("nonmember");

  return (
    <div className="grid min-h-[calc(100dvh-4rem)] lg:grid-cols-2">
      <section className="flex flex-col justify-center gap-6 bg-surface-blue/60 px-6 py-10 lg:px-14">
        <div className="flex items-center gap-4">
          <Logo size={56} showName={false} />
          <div>
            <h1 className="text-2xl font-extrabold text-primary-deep lg:text-3xl">
              Selamat Datang di ReteMali
            </h1>
            <p className="mt-1 max-w-md text-sm text-ink-soft lg:text-base">
              Temukan buku, ikuti kegiatan komunitas, dan tumbuh bersama Taman
              Baca ReteMali.
            </p>
          </div>
        </div>
        <p className="max-w-md text-sm text-ink lg:text-base">
          ReteMali hadir sebagai ruang belajar, membaca, dan bertumbuh bersama
          masyarakat melalui kegiatan literasi yang terbuka dan bermanfaat.
        </p>
        <ul className="grid gap-2 text-sm text-ink lg:grid-cols-2">
          <li className="rounded-card bg-white/80 px-4 py-3 shadow-card">
            Katalog buku dapat dicari dan disaring
          </li>
          <li className="rounded-card bg-white/80 px-4 py-3 shadow-card">
            Kegiatan gratis maupun berbayar
          </li>
          <li className="rounded-card bg-white/80 px-4 py-3 shadow-card">
            Donasi finansial & buku fisik
          </li>
          <li className="rounded-card bg-white/80 px-4 py-3 shadow-card">
            Dashboard member, relawan, & admin
          </li>
        </ul>
      </section>

      <section className="flex flex-col justify-center px-6 py-10 lg:px-14">
        <div className="mx-auto w-full max-w-md space-y-5">
          <div>
            <h2 className="text-lg font-bold text-primary-deep">
              Pilih mode akses
            </h2>
            <p className="text-sm text-ink-soft">
              Member, volunteer, admin, dan pengunjung publik memiliki hak akses
              yang berbeda. Pilih sesuai peran yang telah diverifikasi.
            </p>
          </div>
          <div className="space-y-3">
            {accessOptions.map((option) => (
              <AccessOptionCard
                key={option.id}
                option={option}
                selected={selected === option.id}
                onSelect={() => setSelected(option.id)}
              />
            ))}
          </div>
          <div className="rounded-card border border-surface-soft bg-white p-5 shadow-card">
            {selected === "nonmember" ? <NonMemberPanel /> : <LoginForm mode={selected} />}
          </div>
        </div>
      </section>
    </div>
  );
}
