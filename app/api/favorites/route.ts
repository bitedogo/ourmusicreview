import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { UserFavoriteAlbum } from "@/src/lib/db/entities/UserFavoriteAlbum";
import { Album } from "@/src/lib/db/entities/Album";
import { randomUUID } from "crypto";

interface ToggleFavoriteBody {
  albumId?: string;
  // 앨범 자동 등록을 위한 정보 (앨범이 없을 경우)
  albumTitle?: string;
  albumArtist?: string;
  albumImageUrl?: string | null;
  albumReleaseDate?: string;
}

// 좋아요 추가
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as ToggleFavoriteBody;
    const albumId =
      typeof body.albumId === "string" ? body.albumId.trim() : undefined;

    if (!albumId) {
      return NextResponse.json(
        { ok: false, error: "앨범 ID는 필수입니다." },
        { status: 400 }
      );
    }

    const dataSource = await initializeDatabase();
    const albumRepository = dataSource.getRepository(Album);
    const favoriteRepository = dataSource.getRepository(UserFavoriteAlbum);

    // 앨범이 DB에 없으면 자동 등록 (리뷰 작성 로직과 동일한 패턴)
    let album = await albumRepository.findOne({ where: { albumId } });

    if (!album) {
      const albumTitle =
        typeof body.albumTitle === "string" ? body.albumTitle.trim() : undefined;
      const albumArtist =
        typeof body.albumArtist === "string" ? body.albumArtist.trim() : undefined;
      const albumImageUrl =
        typeof body.albumImageUrl === "string" && body.albumImageUrl.length > 0
          ? body.albumImageUrl
          : null;

      if (!albumTitle || !albumArtist) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "앨범 정보가 부족합니다. 앨범 제목과 아티스트 정보가 필요합니다.",
          },
          { status: 400 }
        );
      }

      // 날짜 파싱
      let releaseDate: Date | undefined = undefined;
      if (body.albumReleaseDate) {
        const parsed = new Date(body.albumReleaseDate);
        if (!isNaN(parsed.getTime())) {
          releaseDate = parsed;
        }
      }

      const newAlbum = albumRepository.create({
        albumId,
        title: albumTitle,
        artist: albumArtist,
        imageUrl: albumImageUrl || undefined,
        releaseDate,
        category: "I", // 기본값: 국외
      });

      await albumRepository.save(newAlbum);
      album = newAlbum;
    }

    // 이미 좋아요 되어 있는지 확인 (USER_FAVORITE_ALBUMS에 UNIQUE 제약을 추가해두는 것이 좋음)
    const existing = await favoriteRepository.findOne({
      where: { userId: session.user.id, albumId },
    });

    if (existing) {
      // 이미 좋아요한 경우 그냥 성공 응답
      return NextResponse.json({ ok: true, favoriteId: existing.id }, { status: 200 });
    }

    const favoriteId = randomUUID().replace(/-/g, "").slice(0, 255);

    const favorite = favoriteRepository.create({
      id: favoriteId,
      userId: session.user.id,
      albumId,
    });

    await favoriteRepository.save(favorite);

    return NextResponse.json(
      { ok: true, favoriteId: favorite.id },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "좋아요 추가 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// 좋아요 취소
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as { albumId?: string };
    const albumId =
      typeof body.albumId === "string" ? body.albumId.trim() : undefined;

    if (!albumId) {
      return NextResponse.json(
        { ok: false, error: "앨범 ID는 필수입니다." },
        { status: 400 }
      );
    }

    const dataSource = await initializeDatabase();
    const favoriteRepository = dataSource.getRepository(UserFavoriteAlbum);

    const existing = await favoriteRepository.findOne({
      where: { userId: session.user.id, albumId },
    });

    if (!existing) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    await favoriteRepository.delete({ id: existing.id });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "좋아요 취소 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// 내가 좋아요한 앨범 목록 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const dataSource = await initializeDatabase();
    const favoriteRepository = dataSource.getRepository(UserFavoriteAlbum);

    const favorites = await favoriteRepository.find({
      where: { userId: session.user.id },
      relations: ["album"],
      order: { createdAt: "DESC" },
    });

    return NextResponse.json(
      {
        ok: true,
        favorites: favorites.map((fav) => ({
          id: fav.id,
          albumId: fav.albumId,
          createdAt: fav.createdAt,
          album: fav.album
            ? {
                albumId: fav.album.albumId,
                title: fav.album.title,
                artist: fav.album.artist,
                imageUrl: fav.album.imageUrl,
                releaseDate: fav.album.releaseDate ?? null,
              }
            : null,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "좋아요한 앨범 목록 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

