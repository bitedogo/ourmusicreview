import type { MetadataRoute } from "next";
import { BOARD_CONFIG } from "@/src/lib/community/board-config";
import { initializeDatabase } from "@/src/lib/db";
import { Playlist } from "@/src/lib/db/entities/Playlist";
import { Post } from "@/src/lib/db/entities/Post";
import { Review } from "@/src/lib/db/entities/Review";
import { absoluteUrl } from "@/src/lib/site/branding";
import { boardPath } from "@/src/lib/navigation/routes";

const STATIC_LAST_MODIFIED = new Date("2026-03-16T00:00:00.000Z");

function staticRoutes(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/search"),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/reviews"),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/playlist"),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...Object.values(BOARD_CONFIG).map((board) => ({
      url: absoluteUrl(boardPath(board.slug)),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency:
        board.slug === "domestic" || board.slug === "overseas"
          ? ("daily" as const)
          : ("weekly" as const),
      priority: board.slug === "market" || board.slug === "workroom" ? 0.7 : 0.8,
    })),
    {
      url: absoluteUrl("/faq"),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/policies/terms"),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/policies/privacy"),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/policies/community-guidelines"),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fallback = staticRoutes();

  try {
    const dataSource = await initializeDatabase();
    const [reviews, posts, playlists] = await Promise.all([
      dataSource.getRepository(Review).find({
        where: { isApproved: "Y" },
        select: ["id", "updatedAt"],
      }),
      dataSource.getRepository(Post).find({
        select: ["id", "updatedAt"],
      }),
      dataSource
        .getRepository(Playlist)
        .createQueryBuilder("playlist")
        .innerJoin("playlist.user", "user")
        .select(["playlist.id", "playlist.updatedAt"])
        .where("playlist.is_public = :isPublic", { isPublic: "Y" })
        .andWhere("user.show_playlists_public = :showPublic", {
          showPublic: "Y",
        })
        .getMany(),
    ]);

    return [
      ...fallback,
      ...reviews.map((review) => ({
        url: absoluteUrl(`/review/${encodeURIComponent(review.id)}`),
        lastModified: review.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...posts.map((post) => ({
        url: absoluteUrl(`/community/${encodeURIComponent(post.id)}`),
        lastModified: post.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...playlists.map((playlist) => ({
        url: absoluteUrl(`/playlist/${encodeURIComponent(playlist.id)}`),
        lastModified: playlist.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch (error) {
    console.error("[sitemap] 동적 URL 조회 실패, 정적 sitemap을 반환합니다.", error);
    return fallback;
  }
}
