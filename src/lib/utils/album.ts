export function getReleaseYear(releaseDate: string): string {
  if (!releaseDate) return "";
  try {
    return new Date(releaseDate).getFullYear().toString();
  } catch {
    return "";
  }
}

export function formatGenreYear(genre: string, releaseDate: string): string {
  const year = getReleaseYear(releaseDate);
  if (genre && year) return `${genre} ${year}`;
  return genre || year;
}

export function buildAlbumReviewPath(albumId: string | number): string {
  return `/review/album/${encodeURIComponent(String(albumId))}`;
}

interface ReviewWriteParams {
  albumId: string | number;
  title: string;
  artist: string;
  imageUrl?: string | null;
}

export function buildReviewWritePath({
  albumId,
  title,
  artist,
  imageUrl,
}: ReviewWriteParams): string {
  const params = new URLSearchParams({
    albumId: String(albumId),
    title,
    artist,
  });

  if (imageUrl) {
    params.append("imageUrl", imageUrl);
  }

  return `/review/write?${params.toString()}`;
}
