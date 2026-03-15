import { In } from "typeorm";
import { initializeDatabase } from "@/src/lib/db";
import { FeaturedSlideAlbum } from "@/src/lib/db/entities/FeaturedSlideAlbum";
import { Review } from "@/src/lib/db/entities/Review";
import { noStoreJson, publicCachedJson } from "@/src/lib/http/cache";

export async function GET() {
  try {
    const dataSource = await initializeDatabase();
    const slideRepo = dataSource.getRepository(FeaturedSlideAlbum);
    const reviewRepo = dataSource.getRepository(Review);

    const rows = await slideRepo.find({
      order: { position: "ASC" },
    });

    const collectionIds = rows.map((r) => r.collectionId);
    const ratingsByAlbumId: Record<string, number> = {};

    if (collectionIds.length > 0) {
      const reviews = await reviewRepo.find({
        where: { albumId: In(collectionIds), isApproved: "Y" },
        select: ["albumId", "rating"],
      });
      const byAlbum = new Map<string, number[]>();
      for (const r of reviews) {
        const list = byAlbum.get(r.albumId) ?? [];
        list.push(Number(r.rating));
        byAlbum.set(r.albumId, list);
      }
      byAlbum.forEach((ratings, albumId) => {
        const sum = ratings.reduce((a, b) => a + b, 0);
        ratingsByAlbumId[albumId] = Math.trunc((sum / ratings.length) * 10) / 10;
      });
    }

    const albums = rows.map((row) => ({
      collectionId: parseInt(row.collectionId, 10) || 0,
      title: row.title,
      artist: row.artist,
      imageUrl: row.imageUrl ?? null,
      releaseDate: row.releaseDate ?? "",
      genre: row.genre ?? "",
      averageRating: ratingsByAlbumId[row.collectionId] ?? null,
    }));

    return publicCachedJson({ ok: true, albums }, 60, 300);
  } catch (error) {
    return noStoreJson(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "명반 목록 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
