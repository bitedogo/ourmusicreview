import { NextResponse } from "next/server";
import { searchArtists } from "@/src/lib/itunes";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get("term");

    if (!term || term.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: "검색어를 입력해주세요." },
        { status: 400 }
      );
    }

    const artists = await searchArtists(term, 20);

    return NextResponse.json({ ok: true, artists }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "아티스트 검색 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
