"use client";
/** 장르 태그 칩 표시 */

export interface GenreTagItem {
  id: string;
  nameKo: string;
}

interface GenreTagsProps {
  genres: GenreTagItem[];
  className?: string;
  size?: "sm" | "md";
}

export function GenreTags({
  genres,
  className = "",
  size = "sm",
}: GenreTagsProps) {
  if (!genres.length) return null;

  const chipClass =
    size === "md"
      ? "rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700"
      : "rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600";

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`.trim()}>
      {genres.map((genre) => (
        <span key={genre.id} className={chipClass}>
          {genre.nameKo}
        </span>
      ))}
    </div>
  );
}
