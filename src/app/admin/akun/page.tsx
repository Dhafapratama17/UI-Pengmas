import { CreditCard, Lock, ShieldCheck } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui/card";
import { PasswordChangeForm } from "@/components/members/password-change-form";
import { getSessionFromServer } from "@/lib/auth/server-session";

export const metadata = { title: "Pengaturan Akun Admin" };

export default async function AdminAccountSettingsPage() {
  const session = await getSessionFromServer();

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <SectionTitle
        title="Pengaturan Akun"
        description="Kelola kata sandi akun administrator Anda."
      />

      <Card>
        <h2 className="text-base font-bold text-ink">Ganti Kata Sandi</h2>
        <p className="mb-3 mt-0.5 text-xs text-ink-soft">
          Setiap perubahan kata sandi diverifikasi dari kata sandi saat ini.
        </p>
        {session ? (
          <PasswordChangeForm />
        ) : (
          <p className="text-sm text-ink-soft">
            Sesi tidak ditemukan. Masuk kembali sebagai admin.
          </p>
        )}
      </Card>

      <Card className="space-y-2">
        <h2 className="text-base font-bold text-ink">Data Akun</h2>
        <dl className="space-y-1.5 text-sm text-ink-soft">
          <div className="flex items-start gap-2">
            <CreditCard className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <div>
              Email{" "}
              <span className="font-mono text-ink">
                {session?.email ?? "—"}
              </span>{" "}
              adalah identitas masuk dan tidak dapat diubah dari aplikasi.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <div>
              Hak akses admin mengontrol seluruh menu manajemen dan verifikasi.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <div>
              Keluar akun tersedia di menu sisi/kotak menu atas — tidak berada
              di formulir ini.
            </div>
          </div>
        </dl>
      </Card>
    </div>
  );
}
