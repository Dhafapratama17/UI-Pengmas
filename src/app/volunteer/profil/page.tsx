import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, SectionTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { ProfileEditForm } from "@/components/members/profile-edit-form";
import { getSessionFromServer } from "@/lib/auth/server-session";
import {
  getProfileById,
  listAssignmentsForVolunteer,
} from "@/lib/services";

export const metadata: Metadata = { title: "Profil Saya (Relawan)" };

export default async function VolunteerProfilePage() {
  const session = await getSessionFromServer();
  if (!session || session.role !== "volunteer") {
    return (
      <ErrorState
        title="Sesi Relawan tidak ditemukan"
        description="Masuk kembali sebagai relawan untuk membuka profil."
      />
    );
  }
  const profile = await getProfileById(session.userId);
  if (!profile) {
    return (
      <ErrorState
        title="Profil tidak ditemukan"
        description="Akun Anda tidak memiliki profil relawan pada aplikasi."
      />
    );
  }
  const assignments = await listAssignmentsForVolunteer(profile.id);

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <SectionTitle
        title="Profil Saya (Relawan)"
        description="Data relawan dan status persetujuan; menu fitur relawan aktif untuk akun disetujui."
      />

      <Card className="flex flex-wrap items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
          {profile.fullName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-40 flex-1">
          <p className="font-bold text-ink">{profile.fullName}</p>
          <p className="text-sm text-ink-soft">
            {profile.email} • {profile.phone}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <Badge tone="info">Relawan · {profile.memberNo}</Badge>
            <Badge
              tone={profile.volunteerApprovalStatus === "approved" ? "success" : "warning"}
            >
              {profile.volunteerApprovalStatus === "approved"
                ? "Disetujui admin"
                : `Status: ${profile.volunteerApprovalStatus}`}
            </Badge>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft">
            <ClipboardList className="h-3.5 w-3.5" aria-hidden />
            Total penugasan aktif:{" "}
            {assignments.filter(
              (a) => a.approval === "approved"
            ).length}{" "}
            dari {assignments.length} penugasan tercatat
          </p>
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-bold text-ink">Ubah Data Profil</h2>
        <p className="mb-3 mt-0.5 text-xs text-ink-soft">
          Nama &amp; nomor WhatsApp dipakai koordinator untuk menghubungi Anda
          saat penugasan.
        </p>
        <ProfileEditForm
          fullName={profile.fullName}
          phone={profile.phone ?? ""}
          email={profile.email}
        />
      </Card>
    </div>
  );
}
