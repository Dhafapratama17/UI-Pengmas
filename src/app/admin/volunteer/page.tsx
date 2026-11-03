import { listProfiles } from "@/lib/services";
import { Card, SectionTitle } from "@/components/ui/card";
import { VolunteersAdmin } from "@/components/admin/volunteers-admin";

export const metadata = { title: "Manajemen Relawan" };

export default async function AdminVolunteersPage() {
  const profiles = await listProfiles();
  const volunteers = profiles.filter(
    (p) =>
      p.role === "volunteer" ||
      (p.role === "member" && p.volunteerApprovalStatus === "pending")
  );

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Manajemen Relawan"
        description="Fitur relawan hanya aktif setelah persetujuan disetujui (design §3)."
      />
      <Card>
        <VolunteersAdmin volunteers={volunteers} />
      </Card>
    </div>
  );
}
