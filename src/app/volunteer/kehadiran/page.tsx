import type { Metadata } from "next";
import { History, QrCode } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getSessionFromServer } from "@/lib/auth/server-session";
import {
  getActivity,
  listAttendanceForPerson,
} from "@/lib/services";
import {
  formatEventDateJakarta,
  formatTimeJakarta,
} from "@/lib/util/format";

export const metadata: Metadata = { title: "Riwayat Kehadiran" };

export default async function VolunteerAttendancePage() {
  const session = await getSessionFromServer();
  if (!session || session.role !== "volunteer") {
    return (
      <ErrorState
        title="Sesi Relawan tidak ditemukan"
        description="Masuk kembali sebagai relawan untuk melihat riwayat kehadiran."
      />
    );
  }

  const attendance = await listAttendanceForPerson(session.userId);
  const rows = await Promise.all(
    attendance.map(async (record) => ({
      record,
      activity: await getActivity(record.activityId),
    }))
  );

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Riwayat Kehadiran"
        description="Rekap kehadiran relawan per kegiatan dari attendance_records."
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<History aria-hidden />}
          title="Belum ada catatan kehadiran"
          description="Kehadiran tercatat ketika QR Absensi Anda dipindai petugas pada kegiatan."
        />
      ) : (
        <Table>
          <THead>
            <TH>Kegiatan</TH>
            <TH>Waktu Scan</TH>
            <TH>Status Personel</TH>
          </THead>
          <TBody>
            {rows.map(({ record, activity }) => (
              <TR key={record.id}>
                <TD>
                  {activity?.title ?? record.activityId}
                  <span className="block text-xs text-ink-soft">
                    {formatEventDateJakarta(record.scannedAt)}
                  </span>
                </TD>
                <TD>
                  {formatTimeJakarta(record.scannedAt)} WIB
                  <span className="block font-mono text-xs text-ink-soft">
                    {record.scannedAt}
                  </span>
                </TD>
                <TD className="capitalize">{record.personRole}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <Card className="flex items-start gap-3 bg-surface-blue/50">
        <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-primary-deep" aria-hidden />
        <p className="text-sm text-primary-deep">
          Menu <strong>QR Absensi</strong> dan pencatatan kehadiran otomatis
          aktif pada Fase 9. Saat ini catatan kehadiran hanya dihasilkan dari
          proses yang sudah terjadi.
        </p>
      </Card>
    </div>
  );
}
