import { dataMode } from "@/lib/config";
import { store } from "@/lib/mock-store";
import type { SiteSettings } from "@/types/db";

export type SiteSettingsPatch = Partial<
  Omit<SiteSettings, "address" | "mapsUrl" | "instagramUrl" | "qrisImageUrl" | "bankAccountNumber">
> & {
  address?: string | null;
  mapsUrl?: string | null;
  instagramUrl?: string | null;
  qrisImageUrl?: string | null;
  bankAccountNumber?: string | null;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk pengaturan belum tersedia di Fase 1");
  }
  return { ...store.settings };
}

export async function updateSiteSettings(
  patch: SiteSettingsPatch
): Promise<SiteSettings> {
  if (dataMode === "supabase") {
    throw new Error("Adapter Supabase untuk pengaturan belum tersedia di Fase 1");
  }
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    store.settings[key as keyof SiteSettings] = (value === "" ? null : value);
  }
  return { ...store.settings };
}
