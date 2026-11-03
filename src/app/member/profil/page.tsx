import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, SectionTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { ProfileEditForm } from "@/components/members/profile-edit-form";
import { getSessionFromServer } from "@/lib/auth/server-session";
import { getProfileById } from "@/lib/services";

export const metadata: Metadata = { title: "Profil Saya" };

export default async function MemberProfilePage() {
  const session = await getSessionFromServer();
  if (!session || session.role !== "member") {
    return (
      <ErrorState
        title="Sesi Member tidak ditemukan"
        description="Masuk kembali sebagai member untuk membuka profil."
      />
    );
  }
  const profile = await getProfileById(session.userId);
  if (!profile) {
    return (
      <ErrorState
        title="Profil tidak ditemukan"
        description="Akun Anda tidak memiliki profil member pada aplikasi."
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <SectionTitle
        title="Profil Saya"
        description="Data diri member ReteMali; perubahan tersimpan langsung ke data profil."
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
            <Badge tone="info">Member ReteMali · {profile.memberNo}</Badge>
            <Badge tone={profile.membershipStatus === "active" ? "success" : "warning"}>
              {profile.membershipStatus === "active"
                ? "Keanggotaan aktif"
                : "Menunggu verifikasi admin"}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-ink-soft">
            Member sejak {profile.createdAt}
          </p>
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-bold text-ink">Ubah Data Profil</h2>
        <p className="mb-3 mt-0.5 text-xs text-ink-soft">
          Nama &amp; nomor WhatsApp dipakai untuk administrasi peminjaman dan
          kegiatan.
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
