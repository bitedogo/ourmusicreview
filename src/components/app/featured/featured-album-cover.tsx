/** Featured 앨범 커버 이미지 */

import Image from "next/image";
import { AlbumCoverPlaceholder } from "@/src/components/common/album-cover-placeholder";

interface FeaturedAlbumCoverProps {
  title: string;
  imageUrl: string | null;
}

export function FeaturedAlbumCover({ title, imageUrl }: FeaturedAlbumCoverProps) {
  return (
    <div className="relative aspect-square w-full shrink-0">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${title} cover`}
          fill
          sizes="224px"
          className="h-full w-full object-cover"
        />
      ) : (
        <AlbumCoverPlaceholder label={`${title} cover`} />
      )}
    </div>
  );
}
