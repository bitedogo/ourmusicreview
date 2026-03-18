export const MAX_AUDIO_SIZE_BYTES = 20 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [".mp3", ".wav"];

export function isAllowedAudioFile(file: { name: string; type: string }): boolean {
  const name = file.name.toLowerCase();
  const byExt = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  const byMime = file.type === "audio/mpeg" || file.type === "audio/wav";
  return byExt || byMime;
}
