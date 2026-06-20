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
