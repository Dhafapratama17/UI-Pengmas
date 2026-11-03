import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarClock,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getSessionFromServer } from "@/lib/auth/server-session";
import {
  getActivity,
  getProfileById,
  listAssignmentsForVolunteer,
} from "@/lib/services";
import {
  formatActivityWindow,
  formatEventDateJakarta,
  formatTimeJakarta,
} from "@/lib/util/format";

export const metadata: Metadata = { title: "Jadwal dan Tugas" };

export default async function VolunteerSchedulePage() {
  const session = await getSessionFromServer();
  if (!session || session.role !== "volunteer") {
    return (
      <ErrorState
        title="Sesi Relawan tidak ditemukan"
        description="Masuk kembali sebagai relawan untuk melihat jadwal Anda."
      />
    );
  }

  const profile = await getProfileById(session.userId);
  const now = new Date();
  const assignments = await listAssignmentsForVolunteer(session.userId);
  const rows = await Promise.all(
    assignments.map(async (assignment) => ({
      assignment,
      activity: await getActivity(assignment.activityId),
    }))
  );
  const upcoming = rows
    .filter(
      (r) => r.activity && new Date(r.activity.endsAt).getTime() > now.getTime()
    )
    .sort((a, b) =>
      (a.activity?.startsAt ?? "").localeCompare(b.activity?.startsAt ?? "")
    );
  const past = rows
    .filter(
      (r) => r.activity && new Date(r.activity.endsAt).getTime() <= now.getTime()
    )
    .sort((a, b) =>
      (b.activity?.startsAt ?? "").localeCompare(a.activity?.startsAt ?? "")
    );

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Jadwal dan Tugas"
        description={`Penugasan relawan untuk ${profile?.fullName ?? session.fullName}.`}
      />

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-ink">
          <CalendarClock className="h-5 w-5" aria-hidden />
          Akan Berlangsung
        </h2>
        {upcoming.length === 0 ? (
          <EmptyState title="Tidak ada jadwal mendatang" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map(({ assignment, activity }) => (
              <Card key={assignment.id} className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-ink">
                    {activity?.title ?? assignment.activityId}
                  </p>
                  <Badge tone="success">Terjadwal</Badge>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                  {activity
                    ? `${formatEventDateJakarta(activity.startsAt)} • ${formatTimeJakarta(activity.startsAt)}–${formatTimeJakarta(activity.endsAt)} WIB`
                    : "-"}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {activity?.location ?? "-"}
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
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold text-ink">
          Sudah Berlalu
        </h2>
        {past.length === 0 ? (
          <EmptyState title="Belum ada penugasan selesai" />
        ) : (
          <Table>
            <THead>
              <TH>Kegiatan</TH>
              <TH>Jadwal</TH>
              <TH>Lokasi</TH>
              <TH>Tanggung Jawab</TH>
            </THead>
            <TBody>
              {past.map(({ assignment, activity }) => (
                <TR key={assignment.id}>
                  <TD>
                    {activity ? (
                      <Link
                        href={`/kegiatan/${activity.id}`}
                        className="font-semibold text-primary-deep underline-offset-4 hover:underline"
                      >
                        {activity.title}
                      </Link>
                    ) : (
                      assignment.activityId
                    )}
                  </TD>
                  <TD>
                    {activity
                      ? formatActivityWindow(activity.startsAt, activity.endsAt)
                      : "-"}
                  </TD>
                  <TD>{activity?.location ?? "-"}</TD>
                  <TD>{assignment.responsibilities}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </section>
    </div>
  );
}
