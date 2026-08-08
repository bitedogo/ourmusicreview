/** Masterpiece 읽기 전용 앨범 그리드 */

import Image from "next/image";
import Link from "next/link";
import type { ProfileMasterpieceItem } from "@/src/components/profile/profile-types";
import { MASTERPIECE_GRID } from "@/src/components/profile/profile-section-styles";
import { MasterpieceAlbumMeta } from "./MasterpieceAlbumMeta";
import { yearFromRelease } from "./masterpiece-utils";

export function MasterpiecesReadOnlyGrid({
  albums,
}: {
  albums: ProfileMasterpieceItem[];
}) {
  if (albums.length === 0) {
    return <p className="py-16 text-center text-sm text-[var(--color-text-secondary)]">등록된 앨범이 없습니다.</p>;
  }

  return (
    <div className={MASTERPIECE_GRID}>
      {albums.map((album) => {
        const year = yearFromRelease(album.releaseDate);
        const genre = album.genre?.trim() || "—";

        return (
          <div key={album.id} className="relative w-full shrink-0">
            <Link
              href={`/review/album/${encodeURIComponent(album.collectionId)}`}
              className="flex w-full flex-col overflow-hidden rounded-[10px] bg-[#FEFEFE] shadow-[0px_2px_4px_rgba(0,0,0,0.25)]"
            >
              <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-t-[10px] bg-[#464646]">
                {album.imageUrl ? (
                  <Image
                    src={album.imageUrl}
                    alt={album.title}
                    width={200}
                    height={200}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <MasterpieceAlbumMeta
                title={album.title}
                artist={album.artist}
                genre={genre}
                year={year}
                footer={
                  <p className="text-center text-[9px] font-bold leading-snug tracking-[-0.005em] text-[#43A7B2] lg:text-[10px]">
                    Rating : -
                  </p>
                }
              />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
