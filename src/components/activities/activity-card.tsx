import { ArrowRight, CalendarDays, Clock, MapPin, Users } from "lucide-react";
import Image from "next/image";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ActivityCardProps } from "@/components/activities/types";
import {
  formatEventDateJakarta,
  formatTimeJakarta,
} from "@/lib/util/format";

export function ActivityCard({
  activity,
  summary,
  alreadyRegistered,
}: ActivityCardProps) {
  const isFree = summary.isFree;
  const stateLabel = windowLabel(summary.window);
  const registerable = summary.window === "open" && !alreadyRegistered;

  return (
    <article className="overflow-hidden rounded-card border border-surface-soft bg-white shadow-card transition-shadow hover:shadow-drawer">
      <div className="flex h-28 items-center justify-center bg-surface-blue/70 px-4">
        {activity.posterUrl ? (
          <Image
            src={activity.posterUrl}
            alt={`Poster kegiatan ${activity.title}`}
            width={800}
            height={224}
            className="h-28 w-full object-cover"
          />
        ) : (
          <span
            className="text-sm font-extrabold uppercase tracking-wide text-primary-deep"
            aria-hidden
          >
            Poster Kegiatan
          </span>
        )}
      </div>
      <div className="space-y-2.5 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={isFree ? "success" : "warning"}>
            {isFree ? "Gratis" : "Berbayar"}
          </Badge>
          <Badge tone={windowTone(summary.window)}>{stateLabel}</Badge>
          {alreadyRegistered ? <Badge tone="info">Sudah Terdaftar</Badge> : null}
        </div>
        <h3 className="font-bold leading-snug text-ink">{activity.title}</h3>
        <dl className="space-y-1.5 text-sm text-ink-soft">
          <div className="flex items-start gap-1.5">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary-deep" aria-hidden />
            <span>
              {formatEventDateJakarta(activity.startsAt)} • {formatTimeJakarta(activity.startsAt)} WIB
            </span>
          </div>
          <div className="flex items-start gap-1.5">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary-deep" aria-hidden />
            <span>Selesai {formatTimeJakarta(activity.endsAt)} WIB</span>
          </div>
          <div className="flex items-start gap-1.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-deep" aria-hidden />
            <span className="min-w-0">{activity.location}</span>
          </div>
          <div className="flex items-start gap-1.5">
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary-deep" aria-hidden />
            <span>
              Sisa {summary.slotsLeft} dari {activity.capacity} kuota
            </span>
          </div>
        </dl>
        <p className="text-xs text-ink-soft">
          Deadline pendaftaran:{" "}
          {formatTimeJakarta(activity.registrationDeadline)} WIB,{" "}
          {formatEventDateJakarta(activity.registrationDeadline)}
        </p>
        {registerable ? (
          <LinkButton
            href={`/kegiatan/${activity.id}/daftar`}
            size="sm"
            className="w-full"
          >
            {isFree ? "Daftar Sekarang (Gratis)" : "Daftar & Ikuti Kelas"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </LinkButton>
        ) : (
          <span
            aria-disabled
            className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-field bg-surface px-4 py-2.5 text-sm font-semibold text-ink-soft disabled:opacity-60"
          >
            {alreadyRegistered
              ? "Sudah Terdaftar"
              : `Pendaftaran Ditutup${summary.window === "full" ? " (Kuota Penuh)" : ""}`}
          </span>
        )}
      </div>
    </article>
  );
}

function windowLabel(window: "open" | "deadline_passed" | "full" | "closed"): string {
  switch (window) {
    case "open":
      return "Pendaftaran Dibuka";
    case "deadline_passed":
      return "Pendaftaran Ditutup";
    case "full":
      return "Kuota Penuh";
    default:
      return "Ditutup";
  }
}

function windowTone(window: "open" | "deadline_passed" | "full" | "closed") {
  switch (window) {
    case "open":
      return "success" as const;
    case "full":
      return "warning" as const;
    case "deadline_passed":
      return "danger" as const;
    default:
      return "neutral" as const;
  }
}
