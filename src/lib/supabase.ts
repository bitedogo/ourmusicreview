/** Supabase 스토리지 클라이언트 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { getServerEnv, getClientEnv } from "@/src/lib/env";

const { nextPublicSupabaseUrl, nextPublicSupabaseAnonKey } = getClientEnv();
export function getSupabaseClient() {
  return createClient(nextPublicSupabaseUrl, nextPublicSupabaseAnonKey);
}

export function getSupabaseAdmin() {
  const { supabaseUrl, supabaseServiceRoleKey } = getServerEnv();
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
}

const BUCKET_PROFILES = "profiles";
const PROFILE_MAX_SIZE = 400;
const PROFILE_WEBP_QUALITY = 85;

async function compressProfileImageBytes(bytes: ArrayBuffer): Promise<Buffer> {
  return sharp(Buffer.from(bytes))
    .rotate()
    .resize(PROFILE_MAX_SIZE, PROFILE_MAX_SIZE, {
      fit: "cover",
      withoutEnlargement: true,
    })
    .webp({ quality: PROFILE_WEBP_QUALITY })
    .toBuffer();
}

export async function uploadProfileImage(
  file: File,
  prefix: string
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const path = `${prefix}/${Date.now()}_${Math.random().toString(36).slice(2)}.webp`;

  const bytes = await file.arrayBuffer();
  const compressed = await compressProfileImageBytes(bytes);
  const { error } = await supabase.storage
    .from(BUCKET_PROFILES)
    .upload(path, compressed, {
      contentType: "image/webp",
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

export async function uploadPlaylistCoverImage(file: File): Promise<string> {
  const supabase = getSupabaseAdmin();
  const path = `playlists/${Date.now()}_${Math.random().toString(36).slice(2)}.webp`;

  const bytes = await file.arrayBuffer();
  const compressed = await compressProfileImageBytes(bytes);
  const { error } = await supabase.storage
    .from(BUCKET_PROFILES)
    .upload(path, compressed, {
      contentType: "image/webp",
      upsert: true,
    });

  if (error) {
    throw new Error(`플레이리스트 대표사진 업로드 실패: ${error.message}`);
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
