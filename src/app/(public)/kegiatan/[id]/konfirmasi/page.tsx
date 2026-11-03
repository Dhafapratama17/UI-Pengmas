import Link from "next/link";
import type { Metadata } from "next";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Hourglass,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import {
  describeRegistrationSummary,
  getActivity,
  getProfileById,
  getRegistrationByReference,
  listPayments,
} from "@/lib/services";
import { formatRupiah } from "@/lib/util/format";

export const metadata: Metadata = { title: "Status Registrasi Kegiatan" };

interface SearchParams {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RegistrationConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
} & SearchParams) {
  const [{ id }, resolved] = await Promise.all([params, searchParams]);
  const referenceRaw = Array.isArray(resolved.ref)
    ? resolved.ref[0]
    : resolved.ref;

  const activity = await getActivity(id);
  const registration = referenceRaw
    ? await getRegistrationByReference(referenceRaw)
    : null;

  if (!activity || !registration || registration.activityId !== activity.id) {
    return (
      <div className="mx-auto w-full max-w-xl space-y-6">
        <h1 className="text-xl font-bold text-primary-deep">
          Status Registrasi Kegiatan
        </h1>
        <Card className="space-y-3">
          <div
            role="status"
            className="flex items-start gap-2 rounded-field border border-danger/30 bg-red-50 px-3 py-2.5 text-sm text-danger"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              Registrasi dengan nomor tersebut tidak ditemukan atau bukan
              registrasi untuk kegiatan ini. Periksa kembali nomor
              registrasi Anda.
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <LinkButton href={`/kegiatan/${id}`} variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Detail kegiatan
            </LinkButton>
            <LinkButton href="/kegiatan" size="sm">
              Daftar kegiatan lain
            </LinkButton>
          </div>
        </Card>
      </div>
    );
  }

  const summary = await describeRegistrationSummary(activity);
  const relatedPayment = (await listPayments()).find(
    (p) => p.activityRegistrationId === registration.id
  );
  const memberProfile = registration.memberId
    ? await getProfileById(registration.memberId)
    : null;

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div>
        <Link
          href="/kegiatan"
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-deep underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke daftar kegiatan
        </Link>
        <h1 className="text-xl font-bold text-primary-deep">
          Status Registrasi {summary.isFree ? "Kegiatan" : "Pembayaran"}
        </h1>
      </div>

      <Card className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Nomor Registrasi:{" "}
          <span className="font-mono text-ink">{registration.reference}</span>
        </p>
        <h2 className="text-lg font-bold text-ink">{activity.title}</h2>
        <dl className="space-y-1 text-sm text-ink-soft">
          <div>
            Peserta:{" "}
            {memberProfile
              ? `${memberProfile.fullName}${memberProfile.memberNo ? ` (Nomor ${memberProfile.memberNo})` : ""}`
              : `${registration.guestName ?? "-"} (${registration.guestEmail ?? "-"})`}
          </div>
          <div>
            Status berbayar:{" "}
            {summary.isFree ? "Gratis" : `${formatRupiah(activity.feeAmount)} / peserta`}
          </div>
        </dl>
        <PaymentStatusBanner
          isFree={summary.isFree}
          paymentStatus={relatedPayment?.status ?? null}
          rejectionReason={relatedPayment?.rejectionReason ?? null}
        />
      </Card>

      <div className="grid gap-2">
        {registration.memberId ? (
          <LinkButton href="/member/kegiatan">
            Lihat di Menu Kegiatan Saya
            <ArrowRight className="h-4 w-4" aria-hidden />
          </LinkButton>
        ) : (
          <Link
            href="/beranda"
            className="inline-flex items-center justify-center gap-2 rounded-field bg-white px-4 py-2.5 text-sm font-semibold text-primary-deep underline-offset-4 hover:bg-surface-blue"
          >
            Kembali ke Beranda Utama
          </Link>
        )}
        <Link
          href={`/kegiatan/${activity.id}`}
          className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-primary-deep underline-offset-4 hover:underline"
        >
          Detail kegiatan
        </Link>
      </div>
    </div>
  );
}

function PaymentStatusBanner({
  isFree,
  paymentStatus,
  rejectionReason,
}: {
  isFree: boolean;
  paymentStatus: "pending" | "verified" | "rejected" | null;
  rejectionReason: string | null;
}) {
  if (isFree || paymentStatus === null) {
    return (
      <div
        role="status"
        className="flex items-start gap-2.5 rounded-field border border-success/30 bg-green-50 px-3 py-3 text-sm"
      >
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
        <div>
          <p className="font-bold text-success">
            Kegiatan Gratis: Terdaftar &amp; Kursi Dikonfirmasi
          </p>
          <p className="text-xs text-ink-soft">
            Tidak memerlukan pembayaran. Simpan nomor registrasi Anda untuk
            kehadiran hari-H.
          </p>
        </div>
      </div>
    );
  }

  if (paymentStatus === "pending") {
    return (
      <div
        role="status"
        className="flex items-start gap-2.5 rounded-field border border-primary/40 bg-amber-50 px-3 py-3 text-sm"
      >
        <Hourglass className="mt-0.5 h-5 w-5 shrink-0 text-[#E9A23B]" aria-hidden />
        <div>
          <p className="font-bold text-[#8a6414]">
            Menunggu Verifikasi Pembayaran Admin
          </p>
          <p className="text-xs text-ink-soft">
            Bukti transfer Anda telah diterima dan dalam antrean verifikasi.
            Belum dinyatakan lunas — status akan diperbarui setelah admin
            memeriksa.
          </p>
        </div>
      </div>
    );
  }

  if (paymentStatus === "rejected") {
    return (
      <div
        role="status"
        className="flex items-start gap-2.5 rounded-field border border-danger/30 bg-red-50 px-3 py-3 text-sm"
      >
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden />
        <div className="space-y-1.5">
          <p className="font-bold text-danger">Pembayaran Ditolak</p>
          {rejectionReason ? (
            <p className="text-xs text-ink-soft">
              Catatan admin: {rejectionReason}
            </p>
          ) : null}
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Unggah bukti baru melalui pengelola (jalur verifikasi admin aktif pada Fase 8).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="flex items-start gap-2.5 rounded-field border border-success/30 bg-green-50 px-3 py-3 text-sm"
    >
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
      <div>
        <p className="font-bold text-success">
          Berbayar: Pembayaran Telah Diverifikasi (Lunas)
        </p>
        <p className="text-xs text-ink-soft">
          Bukti pembayaran valid dan dikonfirmasi admin.
        </p>
      </div>
    </div>
  );
}
