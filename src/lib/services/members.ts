import { dataMode } from "@/lib/config";
import { store } from "@/lib/mock-store";
import type { MembershipStatus, Profile, UserRole } from "@/types/db";

export async function getProfileById(id: string): Promise<Profile | null> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk profil belum tersedia di Fase 1");
  }
  return store.profiles.find((p) => p.id === id) ?? null;
}

export async function getProfileByEmail(email: string): Promise<Profile | null> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk profil belum tersedia di Fase 1");
  }
  const needle = email.toLowerCase();
  return store.profiles.find((p) => p.email.toLowerCase() === needle) ?? null;
}

export async function listProfiles(role?: UserRole): Promise<Profile[]> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk profil belum tersedia di Fase 1");
  }
  return role
    ? store.profiles.filter((p) => p.role === role)
    : store.profiles.slice();
}

export async function updateMemberProfile(
  id: string,
  input: { fullName: string; phone: string }
): Promise<Profile | null> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk profil belum tersedia di Fase 1");
  }
  const profile = store.profiles.find((p) => p.id === id);
  if (!profile) return null;
  profile.fullName = input.fullName;
  profile.phone = input.phone;
  return { ...profile };
}

export async function setMembershipStatus(
  id: string,
  status: MembershipStatus
): Promise<Profile> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk profil belum tersedia di Fase 1");
  }
  const profile = store.profiles.find((p) => p.id === id);
  if (!profile) throw new Error("Profil tidak ditemukan.");
  if (profile.membershipStatus === status) {
    return { ...profile };
  }
  profile.membershipStatus = status;
  return { ...profile };
}
