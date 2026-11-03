export type DataMode = "mock" | "supabase";

export function resolveDataMode(): DataMode {
  return process.env.NEXT_PUBLIC_DATA_MODE === "supabase"
    ? "supabase"
    : "mock";
}

export const dataMode = resolveDataMode();

export function requireSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Data mode 'supabase' aktif tetapi NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY belum diisi di .env.local"
    );
  }
  return { url, anonKey };
}
