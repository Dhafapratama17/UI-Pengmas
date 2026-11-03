import { listProfiles } from "@/lib/services";
import { Card, SectionTitle } from "@/components/ui/card";
import { MembersAdmin } from "@/components/admin/members-admin";

export const metadata = { title: "Manajemen Anggota" };

export default async function AdminMembersPage() {
  const members = await listProfiles("member");

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Manajemen Anggota"
        description="Status keanggotaan mengatur hak meminjam buku. Perubahan meminta konfirmasi."
      />
      <Card>
        <MembersAdmin members={members} />
      </Card>
    </div>
  );
}
