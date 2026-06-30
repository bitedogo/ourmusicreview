import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { UserSlideAlbum } from "@/src/lib/db/entities/UserSlideAlbum";
import { getAlbumById } from "@/src/lib/album-lookup";
import { apiError, apiOk } from "@/src/lib/http/response";

const MIN_FOR_SLIDE = 15;
const MAX_COUNT = 30;

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { session: null, error: apiError("로그인이 필요합니다.", { status: 401 }) };
  }
  return { session, error: null };
}

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;
  const userId = session!.user!.id!;

  try {
    const dataSource = await initializeDatabase();
    const repo = dataSource.getRepository(UserSlideAlbum);
    const rows = await repo.find({
      where: { userId },
      order: { position: "ASC" },
    });

    const albums = rows.map((r) => ({
      id: r.id,
      position: r.position,
      collectionId: r.collectionId,
      title: r.title,
      artist: r.artist,
      imageUrl: r.imageUrl ?? null,
      releaseDate: r.releaseDate ?? "",
      genre: r.genre ?? "",
    }));

    return apiOk({
      albums,
      count: albums.length,
      minForSlide: MIN_FOR_SLIDE,
      maxCount: MAX_COUNT,
    });
  } catch (err) {
    return apiError(
      err instanceof Error ? err.message : "목록 조회 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const userId = session!.user!.id!;

  try {
    const body = await request.json();
    const collectionId = String(body.collectionId ?? "").trim();

    if (!collectionId) {
      return apiError("유효한 앨범을 선택해 주세요.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const repo = dataSource.getRepository(UserSlideAlbum);

    const currentCount = await repo.count({ where: { userId } });
    if (currentCount >= MAX_COUNT) {
      return apiError(`최대 ${MAX_COUNT}개까지 등록할 수 있습니다.`, { status: 400 });
    }

    const existing = await repo.findOne({
      where: { userId, collectionId },
    });
    if (existing) {
      return apiError("이미 등록된 앨범입니다.", { status: 400 });
    }

    const albumInfo = await getAlbumById(collectionId);
    if (!albumInfo) {
      return apiError("앨범 정보를 가져올 수 없습니다.", { status: 400 });
    }

    const position = currentCount + 1;
    const id = crypto.randomUUID();
    const entity = repo.create({
      id,
      userId,
      position,
      collectionId: albumInfo.collectionId,
      title: albumInfo.title,
      artist: albumInfo.artist,
      imageUrl: albumInfo.imageUrl ?? undefined,
      releaseDate: albumInfo.releaseDate || undefined,
      genre: albumInfo.genre || undefined,
    });
    await repo.save(entity);

    return apiOk(
      {
        album: {
          id: entity.id,
          position: entity.position,
          collectionId: entity.collectionId,
          title: entity.title,
          artist: entity.artist,
          imageUrl: entity.imageUrl ?? null,
          releaseDate: entity.releaseDate ?? "",
          genre: entity.genre ?? "",
        },
      },
      { status: 201, message: "추가되었습니다." }
    );
  } catch (err) {
    return apiError(
      err instanceof Error ? err.message : "추가 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const userId = session!.user!.id!;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id?.trim()) {
      return apiError("삭제할 항목 id가 필요합니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const repo = dataSource.getRepository(UserSlideAlbum);

    const entity = await repo.findOne({ where: { id: id.trim(), userId } });
    if (!entity) {
      return apiError("해당 항목을 찾을 수 없습니다.", { status: 404 });
    }

    await repo.remove(entity);

    const remaining = await repo.find({
      where: { userId },
      order: { position: "ASC" },
    });
    for (let i = 0; i < remaining.length; i++) {
      remaining[i].position = i + 1;
    }
    await repo.save(remaining);

    return apiOk({}, { message: "삭제되었습니다." });
  } catch (err) {
    return apiError(
      err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const userId = session!.user!.id!;

  try {
    const body = await request.json();
    const order = body.order;
    if (!Array.isArray(order) || order.some((x: unknown) => typeof x !== "string")) {
      return apiError("order는 id 문자열 배열이어야 합니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const repo = dataSource.getRepository(UserSlideAlbum);
    const all = await repo.find({ where: { userId } });
    const byId = new Map(all.map((a) => [a.id, a]));

    for (let i = 0; i < order.length; i++) {
      const id = String(order[i]);
      const entity = byId.get(id);
      if (entity) {
        entity.position = i + 1;
        await repo.save(entity);
      }
    }

    return apiOk({}, { message: "순서가 저장되었습니다." });
  } catch (err) {
    return apiError(
      err instanceof Error ? err.message : "순서 저장 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
