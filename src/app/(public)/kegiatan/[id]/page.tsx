import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import {
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Wallet,
} from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  describeRegistrationSummary,
  getActivity,
  listRegistrationsForUser,
} from "@/lib/services";
import { decodeSessionCookie, SESSION_COOKIE } from "@/lib/auth/session-cookie";
import {
  formatActivityWindow,
  formatEventDateJakarta,
  formatRupiah,
  formatTimeJakarta,
} from "@/lib/util/format";

function RegistrationButton({
  activityId,
  isFree,
  window,
  alreadyRegistered,
}: {
  activityId: string;
  isFree: boolean;
  window: "open" | "deadline_passed" | "full" | "closed";
  alreadyRegistered: boolean;
}) {
  if (alreadyRegistered) {
    return (
      <div
        role="status"
        className="flex w-full items-center justify-center gap-2 rounded-field bg-surface-blue px-4 py-3 text-sm font-semibold text-primary-deep"
      >
        <CalendarClock className="h-4 w-4" aria-hidden />
        Sudah Terdaftar — lihat status di menu Kegiatan Saya
      </div>
    );
  }
  if (window === "open") {
    return (
      <LinkButton href={`/kegiatan/${activityId}/daftar`} className="w-full">
        {isFree ? "Daftar Sekarang (Gratis)" : "Daftar & Ikuti Kelas"}
      </LinkButton>
    );
  }
  return (
    <div className="space-y-2">
      <span
        aria-disabled
        className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-field bg-surface px-4 py-2.5 text-sm font-semibold text-ink-soft"
      >
        Pendaftaran Ditutup
      </span>
      <p className="text-center text-xs text-ink-soft">
        {window === "full"
          ? "Kuota kegiatan sudah penuh."
          : "Batas waktu pendaftaran telah lewat."}
      </p>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const activity = await getActivity(id);
  if (!activity) notFound();
  return { title: activity.title };
}

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activity = await getActivity(id);
  if (!activity) notFound();

  const now = new Date();
  const summary = await describeRegistrationSummary(activity, now);

  const cookieStore = await cookies();
  const session = await decodeSessionCookie(cookieStore.get(SESSION_COOKIE)?.value);
  const ownRegistrations = session
    ? await listRegistrationsForUser({
        memberId: session.userId,
        email: session.email,
      })
    : [];
  const alreadyRegistered = ownRegistrations.some(
    (r) => r.activityId === activity.id && r.status === "registered"
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <Link
          href="/kegiatan"
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-deep underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke Kegiatan Komunitas
        </Link>
        <h1 className="sr-only">Detail Kegiatan</h1>
      </div>

      <div className="flex h-40 items-center justify-center rounded-card border border-surface-soft bg-surface-blue/70">
        {activity.posterUrl ? (
          <Image
            src={activity.posterUrl}
            alt={`Poster kegiatan ${activity.title}`}
            width={1024}
            height={320}
            className="h-40 w-full rounded-card object-cover"
          />
        ) : (
          <span className="text-base font-extrabold uppercase tracking-wide text-primary-deep" aria-hidden>
            Poster Kegiatan
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={summary.isFree ? "success" : "warning"}>
            {summary.isFree ? "Gratis" : "Berbayar"}
          </Badge>
          <Badge
            tone={
              summary.window === "open"
                ? "success"
                : summary.window === "full"
                  ? "warning"
                  : "danger"
            }
          >
            {summary.window === "open"
              ? "Pendaftaran Dibuka"
              : summary.window === "full"
                ? "Kuota Penuh"
                : "Pendaftaran Ditutup"}
          </Badge>
        </div>
        <h2 className="text-2xl font-extrabold text-primary-deep">
          {activity.title}
        </h2>
        <p className="text-sm text-ink-soft">Diselenggarakan oleh {activity.organizer}</p>
      </div>

      <Card className="divide-y divide-surface-soft">
        <SpecRow
          icon={<CalendarDays className="h-4 w-4" />}
          label="Jadwal"
          value={formatEventDateJakarta(activity.startsAt)}
        />
        <SpecRow
          icon={<Clock className="h-4 w-4" />}
          label="Waktu"
          value={`${formatTimeJakarta(activity.startsAt)} — ${formatTimeJakarta(activity.endsAt)} WIB`}
        />
        <SpecRow
          icon={<MapPin className="h-4 w-4" />}
          label="Lokasi"
          value={activity.location}
        />
        <SpecRow
          icon={<Wallet className="h-4 w-4" />}
          label="Biaya"
          value={summary.isFree ? "Gratis" : `${formatRupiah(activity.feeAmount)} / peserta`}
        />
        <SpecRow
          icon={<Users className="h-4 w-4" />}
          label="Kuota"
          value={`${summary.registeredCount} terisi • sisa ${summary.slotsLeft} dari ${activity.capacity}`}
        />
        <SpecRow
          icon={<CalendarClock className="h-4 w-4" />}
          label="Deadline Pendaftaran"
          value={`${formatEventDateJakarta(activity.registrationDeadline)} • ${formatTimeJakarta(activity.registrationDeadline)} WIB`}
        />
      </Card>

      <Card className="space-y-2">
        <h3 className="text-base font-bold text-primary-deep">Deskripsi Kegiatan</h3>
        <p className="text-sm leading-relaxed text-ink">{activity.description}</p>
      </Card>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-ink">
          {summary.isFree
            ? "Pendaftaran gratis — cukup isi identitas peserta."
            : "Biaya pendaftaran " +
              formatRupiah(activity.feeAmount) +
              " — bukti pembayaran akan diverifikasi admin."}
        </p>
        <RegistrationButton
          activityId={activity.id}
          isFree={summary.isFree}
          window={summary.window}
          alreadyRegistered={alreadyRegistered}
        />
        <p className="text-center text-xs text-ink-soft">
          Rentang waktu kegiatan: {formatActivityWindow(activity.startsAt, activity.endsAt)} (WIB)
        </p>
      </div>
    </div>
  );
}

function SpecRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="flex items-center gap-2 text-sm text-ink-soft">
        <span className="text-primary-deep" aria-hidden>
          {icon}
        </span>
        {label}
      </span>
      <span className="text-right text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}
