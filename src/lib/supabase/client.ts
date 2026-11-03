import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseEnv } from "@/lib/config";

export function createSupabaseBrowserClient() {
  const { url, anonKey } = requireSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
