import { BellRing } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { NotificationsInbox } from "@/components/notifications/notifications-inbox";
import { getSessionFromServer } from "@/lib/auth/server-session";

export const metadata = { title: "Notifikasi (Relawan)" };

export default async function VolunteerNotifikasiPage() {
  const session = await getSessionFromServer();
  if (!session || session.role !== "volunteer") {
    return (
      <ErrorState
        title="Sesi Relawan tidak ditemukan"
        description="Masuk kembali sebagai relawan untuk membuka kotak notifikasi Anda."
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Notifikasi"
        description="Status aplikasi relawan, jadwal penugasan, pengumuman, dan pengingat kegiatan."
      />
      <Card className="flex items-start gap-3 bg-surface-blue/50">
        <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-primary-deep" aria-hidden />
        <p className="text-sm text-primary-deep">
          Pengingat penugasan hanya muncul untuk relawan yang disetujui dan
          tercatat pada penugasan kegiatan terpublikasi.
        </p>
      </Card>
      <NotificationsInbox />
    </div>
  );
}
