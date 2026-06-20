import Image from "next/image";
import Link from "next/link";
import { formatGenreYear } from "@/src/lib/utils/album";
import { RatingDisplay } from "./rating-display";

export interface FeaturedAlbumCardData {
  collectionId: number;
  title: string;
  artist: string;
  imageUrl: string | null;
  releaseDate: string;
  genre: string;
  averageRating: number | null;
}

interface FeaturedAlbumCardProps {
  album: FeaturedAlbumCardData;
}

export function FeaturedAlbumCard({ album }: FeaturedAlbumCardProps) {
  return (
    <Link
      href={`/review/album/${album.collectionId}`}
      className="mx-3 flex w-48 shrink-0 flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-4 shadow-md transition-transform duration-300 hover:scale-105 sm:w-56"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#444444]">
        {album.imageUrl ? (
          <Image
            src={album.imageUrl}
            alt={`${album.title} cover`}
            fill
            unoptimized
            sizes="(max-width: 640px) 192px, 224px"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
            이미지 없음
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="truncate text-left text-base font-bold text-zinc-900">{album.title}</h3>

        <div className="flex items-center justify-between gap-2 text-[10px] text-zinc-500">
          <span className="min-w-0 truncate">{album.artist}</span>
          <span className="shrink-0 text-right">
            {formatGenreYear(album.genre, album.releaseDate)}
          </span>
        </div>

        <div className="border-t border-zinc-500 pt-2 pb-1">
          <RatingDisplay rating={album.averageRating} />
        </div>
      </div>
    </Link>
  );
}
