import { dataMode } from "@/lib/config";
import { store } from "@/lib/mock-store";
import type {
  AttendanceRecord,
  VolunteerApprovalStatus,
  VolunteerAssignment,
} from "@/types/db";

export async function listAssignmentsForVolunteer(
  volunteerId: string
): Promise<(VolunteerAssignment & { approval: string })[]> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk relawan belum tersedia di Fase 1");
  }
  return store.assignments
    .filter((a) => a.volunteerId === volunteerId)
    .map((a) => ({
      ...a,
      approval:
        store.profiles.find((p) => p.id === a.volunteerId)
          ?.volunteerApprovalStatus ?? "pending",
    }));
}

export async function listAttendanceForPerson(
  personId: string
): Promise<AttendanceRecord[]> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk absensi belum tersedia di Fase 1");
  }
  return store.attendance
    .filter((a) => a.personId === personId)
    .slice()
    .sort((a, b) => b.scannedAt.localeCompare(a.scannedAt));
}

export function listVolunteerApplications(): ProfileLike[] {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk relawan belum tersedia di Fase 1");
  }
  return store.profiles
    .filter((p) => p.role === "volunteer" || p.volunteerApprovalStatus === "pending")
    .map((p) => ({
      id: p.id,
      fullName: p.fullName,
      email: p.email,
      approval: p.volunteerApprovalStatus,
      role: p.role,
    }));
}

interface ProfileLike {
  id: string;
  fullName: string;
  email: string;
  approval: string;
  role: string;
}

export async function setVolunteerApproval(
  id: string,
  approval: VolunteerApprovalStatus
): Promise<ProfileLike> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk relawan belum tersedia di Fase 1");
  }
  const profile = store.profiles.find((p) => p.id === id);
  if (!profile) throw new Error("Profil tidak ditemukan.");
  profile.volunteerApprovalStatus = approval;
  if (approval === "approved" && profile.role === "member") {
    profile.role = "volunteer";
  }
  return {
    id: profile.id,
    fullName: profile.fullName,
    email: profile.email,
    approval: profile.volunteerApprovalStatus,
    role: profile.role,
  };
}
