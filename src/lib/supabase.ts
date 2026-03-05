import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/src/lib/env";

const { supabaseUrl, supabaseServiceRoleKey } = getServerEnv();

export function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
}

const BUCKET_PROFILES = "profiles";

export async function uploadProfileImage(
  file: File,
  prefix: string
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${prefix}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const bytes = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(BUCKET_PROFILES)
    .upload(path, bytes, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    throw new Error(`프로필 이미지 업로드 실패: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_PROFILES).getPublicUrl(path);
  return publicUrl;
}
