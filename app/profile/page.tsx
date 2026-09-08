/** 마이페이지 서버 진입(세션 가드) */

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { withDatabaseRead } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";
import { getUserFavoriteAlbums } from "@/src/lib/favorites/favorites-service";
import { listMyPlaylists } from "@/src/lib/playlists/playlist-service";
import { getProfileActivityStats } from "@/src/lib/profile/profile-content-service";
import { toPrivacySettings } from "@/src/lib/profile/privacy";
import { getUserReviews } from "@/src/lib/reviews/review-service";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/profile");
  }
  const userId = session.user.id;

  const initial = await withDatabaseRead(async (dataSource) => {
    const user = await dataSource.getRepository(User).findOne({
      where: { id: userId },
    });
    if (!user) return null;

    const [reviews, favorites, playlists, activityStats] = await Promise.all([
      getUserReviews(dataSource, user.id),
      getUserFavoriteAlbums(dataSource, user.id),
      listMyPlaylists(dataSource, user.id),
      getProfileActivityStats(dataSource, user.id),
    ]);
    return { user, reviews, favorites, playlists, activityStats };
  });

  if (!initial) {
    redirect("/auth/signin?callbackUrl=/profile");
  }
  const { user } = initial;

  const createdAtText = user.createdAt
    ? new Date(user.createdAt).toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  return (
    <ProfileClient
      id={user.id}
      nickname={user.nickname}
      name={user.name ?? null}
      gender={user.gender ?? null}
      role={user.role}
      createdAtText={createdAtText}
      profileImage={user.profileImage ?? null}
      initialPrivacy={toPrivacySettings(user)}
      initialReviews={JSON.parse(JSON.stringify(initial.reviews))}
      initialFavorites={JSON.parse(JSON.stringify(initial.favorites))}
      initialPlaylists={JSON.parse(JSON.stringify(initial.playlists))}
      initialActivityStats={initial.activityStats}
    />
  );
}
