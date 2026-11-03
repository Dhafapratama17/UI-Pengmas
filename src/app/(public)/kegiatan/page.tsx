import Link from "next/link";
import type { Metadata } from "next";
import { CalendarX } from "lucide-react";
import { cookies } from "next/headers";
import {
  describeRegistrationSummary,
  listActivities,
  listRegistrationsForUser,
} from "@/lib/services";
import { ActivityCard } from "@/components/activities/activity-card";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionTitle } from "@/components/ui/card";
import {
  decodeSessionCookie,
  SESSION_COOKIE,
} from "@/lib/auth/session-cookie";
import {
  activityFilterOptions,
  parseActivityFilter,
} from "@/components/activities/filters";

export const metadata: Metadata = { title: "Kegiatan Komunitas" };

export default async function KegiatanPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const filter = parseActivityFilter(resolved.filter);

  try {
    const now = new Date();
    const activities = await listActivities({
      now,
      freeOnly: filter === "gratis",
      paidOnly: filter === "berbayar",
    });

    const visible =
      filter === "selesai"
        ? activities.filter((a) => new Date(a.startsAt).getTime() < now.getTime())
        : activities;
    visible.sort((a, b) => {
      if (filter === "selesai") return b.startsAt.localeCompare(a.startsAt);
      return a.startsAt.localeCompare(b.startsAt);
    });

    const cookieStore = await cookies();
    const session = await decodeSessionCookie(
      cookieStore.get(SESSION_COOKIE)?.value
    );
    const ownRegistrations = session
      ? await listRegistrationsForUser({
          memberId: session.userId,
          email: session.email,
        })
      : [];
    const registeredActivityIds = new Set(
      ownRegistrations
        .filter((r) => r.status === "registered")
        .map((r) => r.activityId)
    );

    const summaries = await Promise.all(
      visible.map((activity) => describeRegistrationSummary(activity, now))
    );

    return (
      <div className="space-y-6">
        <SectionTitle
          title="Kegiatan Komunitas"
          description="Temukan kegiatan literasi ReteMali — daftar gratis langsung tanpa biaya, atau ikuti kelas berbayar dengan bukti pembayaran."
        />

        <nav
          aria-label="Filter kegiatan"
          className="flex flex-wrap gap-2"
          role="group"
        >
          {activityFilterOptions.map((option) => {
            const active = filter === option.slug;
            return (
              <Link
                key={option.slug}
                href={
                  option.slug === "semua"
                    ? "/kegiatan"
                    : `/kegiatan?filter=${option.slug}`
                }
                aria-pressed={active}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-surface-soft bg-white text-ink-soft hover:border-primary/50"
                }`}
              >
                {option.label}
              </Link>
            );
          })}
        </nav>

        {visible.length === 0 ? (
          <EmptyState
            icon={<CalendarX aria-hidden />}
            title={
              filter === "selesai"
                ? "Belum ada kegiatan yang sudah selesai"
                : "Belum ada kegiatan pada kategori ini"
            }
            description="Kegiatan yang dipublikasikan pengelola akan tampil di sini. Coba pilih kategori lain."
            action={
              <Link
                href="/kegiatan"
                className="text-sm font-semibold text-primary-deep underline-offset-4 hover:underline"
              >
                Lihat semua kegiatan
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visible.map((activity, index) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                summary={summaries[index]}
                alreadyRegistered={registeredActivityIds.has(activity.id)}
              />
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="space-y-6">
        <SectionTitle title="Kegiatan Komunitas" />
        <ErrorState
          title="Kegiatan tidak dapat dimuat"
          description={
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat daftar kegiatan."
          }
        />
      </div>
    );
  }
}
