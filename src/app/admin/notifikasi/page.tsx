import { BellRing, Megaphone } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { NotificationsInbox } from "@/components/notifications/notifications-inbox";
import { BroadcastForm } from "@/components/admin/broadcast-form";
import { getSessionFromServer } from "@/lib/auth/server-session";

export const metadata = { title: "Notifikasi (Admin)" };

export default async function AdminNotifikasiPage() {
  const session = await getSessionFromServer();
  if (!session || session.role !== "admin") {
    return (
      <ErrorState
        title="Sesi Admin tidak ditemukan"
        description="Masuk kembali sebagai admin untuk mengelola notifikasi."
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Notifikasi"
        description="Kotak masuk admin: pendaftaran baru, donasi masuk, absensi, dan verifikasi pembayaran."
      />
      <NotificationsInbox />

      <section className="space-y-3">
        <SectionTitle
          title="Kirim Pengumuman"
          description="Broadcast ke member dan/atau relawan yang memiliki akun. Pesan hanya terkirim ke pengguna berakun; pengumuman publik sebaiknya dibuat sebagai kegiatan (design §12.1)."
        />
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary-deep" aria-hidden />
            <h3 className="text-sm font-bold text-ink">Formulir Broadcast</h3>
          </div>
          <Card className="mb-3 flex items-start gap-3 border-dashed">
            <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <p className="text-xs text-ink-soft">
              Pengumuman hanya dikirim ke akun member/relawan/admin. Data tidak
              digunakan untuk daftar email fisik; setiap terkirim tercatat pada
              inbox masing-masing pengguna.
            </p>
          </Card>
          <BroadcastForm />
        </Card>
      </section>
    </div>
  );
}
