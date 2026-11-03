import { LogIn, QrCode } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { MemberCheckinPanel } from "@/components/attendance/member-checkin";
import { getSessionFromServer } from "@/lib/auth/server-session";
import { describeAttendanceWindow, resolveActiveToken } from "@/lib/services/qr";

export const metadata = { title: "QR Absensi Kegiatan" };

export default async function AbsensiPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  const session = await getSessionFromServer();
  const tokenTrimmed = (token ?? "").trim();

  if (!session) {
    return (
      <div className="mx-auto w-full max-w-xl space-y-6">
        <SectionTitle
          title="QR Absensi Kegiatan"
          description="Halaman check-in peserta dan relawan melalui QR taman baca."
        />
        <Card className="flex items-start gap-3">
          <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="text-sm font-bold text-ink">
              Masuk untuk melakukan check-in
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Check-in mengikat ke akun Anda (member terdaftar atau relawan
              bertugas). Silakan masuk terlebih dahulu, lalu buka kembali QR
              absensi dari petugas.
            </p>
          </div>
        </Card>
        <LinkButton
          href={`/login?next=${encodeURIComponent(
            `/absensi?token=${tokenTrimmed}`
          )}`}
          className="w-full"
        >
          <LogIn className="h-4 w-4" aria-hidden />
          Masuk untuk Check-in
        </LinkButton>
        {!tokenTrimmed ? (
          <p className="text-center text-xs text-ink-soft">
            QR belum berisi token. Pindai QR yang ditampilkan petugas
            kegiatan.
          </p>
        ) : null}
      </div>
    );
  }

  if (session.role === "admin") {
    return (
      <div className="mx-auto w-full max-w-xl">
        <ErrorState
          title="Akun admin tidak check-in di sini"
          description="Halaman ini untuk check-in member dan relawan. Admin mengelola QR melalui menu QR dan Absensi."
        />
      </div>
    );
  }

  if (!tokenTrimmed) {
    return (
      <div className="mx-auto w-full max-w-xl">
        <ErrorState
          title="Token QR tidak ditemukan"
          description="Buka halaman ini melalui QR yang ditampilkan petugas kegiatan."
        />
      </div>
    );
  }

  const resolved = resolveActiveToken(tokenTrimmed);
  if (!resolved) {
    return (
      <div className="mx-auto w-full max-w-xl">
        <MemberCheckinPanel
          token={tokenTrimmed}
          preflight={{
            state: "invalid_token",
            message:
              "Token QR tidak valid, sudah diganti, atau tidak aktif. Minta QR terbaru pada petugas.",
          }}
        />
      </div>
    );
  }

  const window = describeAttendanceWindow(resolved.activity);
  if (resolved.activity.status !== "published") {
    return (
      <div className="mx-auto w-full max-w-xl">
        <MemberCheckinPanel
          token={tokenTrimmed}
          preflight={{
            state: "activity_unavailable",
            message: "Kegiatan tidak tersedia untuk absensi.",
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <MemberCheckinPanel
        token={tokenTrimmed}
        preflight={{
          state: "valid",
          activity: {
            id: resolved.activity.id,
            title: resolved.activity.title,
            location: resolved.activity.location,
            startsAt: resolved.activity.startsAt,
            endsAt: resolved.activity.endsAt,
          },
          windowState: window.state,
          opensAt: window.opensAt,
          closesAt: window.closesAt,
        }}
      />
    </div>
  );
}
