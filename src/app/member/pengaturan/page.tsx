import type { Metadata } from "next";
import { CreditCard, Hourglass, Info, Lock } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { PasswordChangeForm } from "@/components/members/password-change-form";
import { getSessionFromServer } from "@/lib/auth/server-session";
import { getProfileById } from "@/lib/services";

export const metadata: Metadata = { title: "Pengaturan Akun" };

export default async function MemberAccountSettingsPage() {
  const session = await getSessionFromServer();
  if (!session || session.role !== "member") {
    return (
      <ErrorState
        title="Sesi Member tidak ditemukan"
        description="Masuk kembali sebagai member untuk membuka pengaturan akun."
      />
    );
  }
  const profile = await getProfileById(session.userId);

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <SectionTitle
        title="Pengaturan Akun"
        description="Kelola kata sandi dan data akun Anda."
      />

      <Card>
        <h2 className="text-base font-bold text-ink">Ganti Kata Sandi</h2>
        <p className="mb-3 mt-0.5 text-xs text-ink-soft">
          Setiap perubahan kata sandi diverifikasi dari kata sandi saat ini.
        </p>
        <PasswordChangeForm />
      </Card>

      <Card className="space-y-2">
        <h2 className="text-base font-bold text-ink">Data Akun</h2>
        <dl className="space-y-1.5 text-sm text-ink-soft">
          <div className="flex items-start gap-2">
            <CreditCard className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <div>
              ID Member:{" "}
              <span className="font-mono text-ink">{profile?.memberNo}</span>
              {" • "}
              Status:{" "}
              {profile?.membershipStatus === "active"
                ? "aktif"
                : "menunggu verifikasi admin"}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <div>
              Email {session.email} adalah identitas masuk dan tidak dapat
              diubah dari aplikasi — hubungi pengelola bila perlu.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Hourglass className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <div>
              Notifikasi (pengingat tenggat &amp; status pembayaran) dibuka
              pada Fase 9.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <div>
              Keluar akun tersedia di menu sisi/kotak menu atas — tidak
              berada di formulir ini.
            </div>
          </div>
        </dl>
      </Card>
    </div>
  );
}
