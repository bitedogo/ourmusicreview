/** Supabase Auth 클라이언트 (미디어 업로드는 src/lib/storage) */

import { createClient } from "@supabase/supabase-js";
import { getClientEnv } from "@/src/lib/env";

const { nextPublicSupabaseUrl, nextPublicSupabaseAnonKey } = getClientEnv();

export function getSupabaseClient() {
  return createClient(nextPublicSupabaseUrl, nextPublicSupabaseAnonKey);
}
