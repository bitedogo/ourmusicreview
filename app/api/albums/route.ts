import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { Album } from "@/src/lib/db/entities/Album";

interface CreateAlbumBody {
  albumId?: string;
  title?: string;
  artist?: string;
  imageUrl?: string | null;
  releaseDate?: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreateAlbumBody;
    const albumId =
      typeof body.albumId === "string" ? body.albumId.trim() : undefined;
    const title =
      typeof body.title === "string" ? body.title.trim() : undefined;
    const artist =
      typeof body.artist === "string" ? body.artist.trim() : undefined;
    const imageUrl =
      typeof body.imageUrl === "string" && body.imageUrl.length > 0
        ? body.imageUrl
        : null;

    if (!albumId || !title || !artist) {
      return NextResponse.json(
        { ok: false, error: "앨범 ID, 제목, 아티스트는 필수입니다." },
        { status: 400 }
      );
    }

    let releaseDate: Date | undefined = undefined;
    if (body.releaseDate) {
      const parsed = new Date(body.releaseDate);
      if (!isNaN(parsed.getTime())) {
        releaseDate = parsed;
      }
    }

    const dataSource = await initializeDatabase();
    const albumRepository = dataSource.getRepository(Album);

    const existing = await albumRepository.findOne({
      where: { albumId },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, error: "이미 등록된 앨범입니다." },
        { status: 409 }
      );
    }

    const newAlbum = albumRepository.create({
      albumId,
      title,
      artist,
      imageUrl: imageUrl || undefined,
      releaseDate,
      category: "I", // 기본값으로 "I" 설정 (나중에 제거 예정)
    });

    await albumRepository.save(newAlbum);

    return NextResponse.json(
      { ok: true, album: { id: newAlbum.albumId, title: newAlbum.title } },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "앨범 등록 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
