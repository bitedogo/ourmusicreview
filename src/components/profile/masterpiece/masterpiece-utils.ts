export const MASTERPIECE_MAX_COUNT = 30;

export function yearFromRelease(releaseDate: string) {
  const y = releaseDate?.slice(0, 4);
  return y && /^\d{4}$/.test(y) ? y : "";
}
