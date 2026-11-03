import { Info } from "lucide-react";
import { getSiteSettings } from "@/lib/services";
import { Card, SectionTitle } from "@/components/ui/card";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";

export const metadata = { title: "Pengaturan Website" };

export default async function AdminSiteSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <SectionTitle
        title="Pengaturan Website"
        description="Alamat, kontak, tautan Instagram, peta, QRIS, rekening resmi, dan instruksi donasi untuk halaman publik."
      />
      <Card>
        <p className="mb-4 flex items-start gap-2 rounded-field border border-surface-soft bg-surface-blue/60 px-3 py-2.5 text-xs text-ink-soft">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span>
            Isi hanya dengan data resmi organisasi. Kosongkan (biarkan null)
            bila belum tersedia — data ini dipakai halaman dokasi publik dan
            tidak boleh diisi fiktif.
          </span>
        </p>
        <SiteSettingsForm settings={settings} />
      </Card>
    </div>
  );
}
