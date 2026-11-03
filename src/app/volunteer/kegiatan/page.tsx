import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { getSessionFromServer } from "@/lib/auth/server-session";
import {
  getActivity,
  listAssignmentsForVolunteer,
} from "@/lib/services";
import { formatActivityWindow } from "@/lib/util/format";

export const metadata: Metadata = { title: "Kegiatan Saya (Relawan)" };

export default async function VolunteerActivitiesPage() {
  const session = await getSessionFromServer();
  if (!session || session.role !== "volunteer") {
    return (
      <ErrorState
        title="Sesi Relawan tidak ditemukan"
        description="Masuk kembali sebagai relawan untuk melihat kegiatan Anda."
      />
    );
  }

  const now = new Date();
  const assignments = await listAssignmentsForVolunteer(session.userId);
  const rows = await Promise.all(
    assignments.map(async (assignment) => ({
      assignment,
      activity: await getActivity(assignment.activityId),
    }))
  );
  const sorted = rows.sort((a, b) =>
    (b.activity?.startsAt ?? "").localeCompare(a.activity?.startsAt ?? "")
  );

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Kegiatan Saya (Relawan)"
        description="Kegiatan yang Anda tugasi beserta tanggung jawab dan koordinator."
      />

      {sorted.length === 0 ? (
        <EmptyState
          title="Belum ada kegiatan yang ditugaskan"
          description="Penugasan dilakukan admin/manajemen kegiatan; termohon menunggu atau hubungi koordinator."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sorted.map(({ assignment, activity }) => {
            const isUpcoming = activity
              ? new Date(activity.endsAt).getTime() > now.getTime()
              : false;
            return (
              <Card key={assignment.id} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-ink">
                    {activity?.title ?? assignment.activityId}
                  </p>
                  <Badge tone={isUpcoming ? "success" : "neutral"}>
                    {isUpcoming ? "Terjadwal" : "Selesai"}
                  </Badge>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                  {activity
                    ? formatActivityWindow(activity.startsAt, activity.endsAt)
                    : "-"}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {activity?.location ?? "-"}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <UserCog className="h-3.5 w-3.5" aria-hidden />
                  Koordinator: {activity?.organizer ?? "-"}
                </p>
                <p className="text-sm text-ink">
                  <span className="font-semibold">Tanggung jawab:</span>{" "}
                  {assignment.responsibilities}
                </p>
                {activity ? (
                  <Link
                    href={`/kegiatan/${activity.id}`}
                    className="inline-flex items-center text-sm font-semibold text-primary-deep underline-offset-4 hover:underline"
                  >
                    Detail kegiatan
                  </Link>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
