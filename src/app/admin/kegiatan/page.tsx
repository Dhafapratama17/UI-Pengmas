import { listActivitiesForAdmin } from "@/lib/services";
import { Card, SectionTitle } from "@/components/ui/card";
import { ActivitiesAdmin } from "@/components/admin/activities-admin";
import type { Activity } from "@/types/db";

export const metadata = { title: "Manajemen Kegiatan" };

export default async function AdminActivitiesPage() {
  const activities: Activity[] = await listActivitiesForAdmin();

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Manajemen Kegiatan"
        description="Tambah, ubah, arsipkan, atau hapus kegiatan; lihat daftar peserta di detail."
      />
      <Card>
        <ActivitiesAdmin activities={activities} />
      </Card>
    </div>
  );
}
