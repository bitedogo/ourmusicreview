import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { FeaturedSlideAlbum } from "@/src/lib/db/entities/FeaturedSlideAlbum";
import { getAlbumById } from "@/src/lib/album-lookup";
import { apiError, apiOk } from "@/src/lib/http/response";

const MIN_COUNT = 10;
const MAX_COUNT = 30;

function requireAdmin() {
  return async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as { role?: string }).role !== "ADMIN") {
      return apiError("관리자 권한이 필요합니다.", { status: 403 });
    }
    return null;
  };
}

export async function GET() {
  const authErr = await requireAdmin()();
  if (authErr) return authErr;

  try {
    const dataSource = await initializeDatabase();
    const repo = dataSource.getRepository(FeaturedSlideAlbum);
    const rows = await repo.find({ order: { position: "ASC" } });

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

    return apiOk({ albums });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "목록 조회 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authErr = await requireAdmin()();
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const collectionId = String(body.collectionId ?? "").trim();

    if (!collectionId) {
      return apiError("유효한 앨범(collectionId)을 선택해 주세요.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const repo = dataSource.getRepository(FeaturedSlideAlbum);
    const currentCount = await repo.count();
    if (currentCount >= MAX_COUNT) {
      return apiError(`최대 ${MAX_COUNT}개까지 등록할 수 있습니다.`, { status: 400 });
    }

    const existing = await repo.findOne({
      where: { collectionId },
    });
    if (existing) {
      return apiError("이미 슬라이드바에 등록된 앨범입니다.", { status: 400 });
    }

    const albumInfo = await getAlbumById(collectionId);
    if (!albumInfo) {
      return apiError("앨범 정보를 가져올 수 없습니다.", { status: 400 });
    }

    const position = currentCount + 1;
    const id = crypto.randomUUID();
    const entity = repo.create({
      id,
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
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "추가 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const authErr = await requireAdmin()();
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id?.trim()) {
      return apiError("삭제할 항목 id가 필요합니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const repo = dataSource.getRepository(FeaturedSlideAlbum);
    const currentCount = await repo.count();
    if (currentCount <= MIN_COUNT) {
      return apiError(`최소 ${MIN_COUNT}개는 유지해야 합니다.`, { status: 400 });
    }

    const entity = await repo.findOne({ where: { id: id.trim() } });
    if (!entity) {
      return apiError("해당 항목을 찾을 수 없습니다.", { status: 404 });
    }

    await repo.remove(entity);

    const remaining = await repo.find({ order: { position: "ASC" } });
    for (let i = 0; i < remaining.length; i++) {
      remaining[i].position = i + 1;
    }
    await repo.save(remaining);

    return apiOk({}, { message: "삭제되었습니다." });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "삭제 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const authErr = await requireAdmin()();
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const order = body.order;
    if (!Array.isArray(order) || order.some((x: unknown) => typeof x !== "string")) {
      return apiError("order는 id 문자열 배열이어야 합니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const repo = dataSource.getRepository(FeaturedSlideAlbum);
    const all = await repo.find();
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
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "순서 저장 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
