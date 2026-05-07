import { createClient } from "@supabase/supabase-js";
import { getServerEnv, getClientEnv } from "@/src/lib/env";

// Client-side Supabase instance can be initialized at the top level
const { nextPublicSupabaseUrl, nextPublicSupabaseAnonKey } = getClientEnv();
export function getSupabaseClient() {
  return createClient(nextPublicSupabaseUrl, nextPublicSupabaseAnonKey);
}

// Server-side Supabase Admin instance should be initialized lazily
export function getSupabaseAdmin() {
  // Call getServerEnv() only when getSupabaseAdmin() is actually invoked
  const { supabaseUrl, supabaseServiceRoleKey } = getServerEnv();
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

export async function uploadAudioFile(
  file: File,
  prefix: string
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const ext = (file.name.split(".").pop() || "mp3").toLowerCase();
  const safeExt = ext.replace(/[^a-z0-9]/g, "") || "mp3";
  const path = `audio/${prefix}/${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}.${safeExt}`;

  const bytes = await file.arrayBuffer();
  const { error } = await supabase.storage.from(BUCKET_PROFILES).upload(path, bytes, {
    contentType: file.type || "audio/mpeg",
    upsert: true,
  });

  if (error) {
    throw new Error(`음원 업로드 실패: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_PROFILES).getPublicUrl(path);
  return publicUrl;
}
