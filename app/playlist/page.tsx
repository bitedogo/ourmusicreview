/** 공개 플레이리스트 목록 페이지 (내비 미노출 · URL 직접 진입) */

import { Suspense } from "react";
import { PlaylistListClient } from "./PlaylistListClient";

export default function PlaylistPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-screen w-full max-w-[860px] flex-col bg-[#F7F7F8] px-4 pb-14 pt-[72px] sm:px-6">
          <h1 className="text-[28px] font-semibold tracking-tight text-zinc-900">
            플레이리스트
          </h1>
          <div className="mt-6 flex min-h-[168px] items-center justify-center rounded-[28px] bg-gradient-to-br from-[#C45C2A] to-[#7A2E12] text-sm text-white/80 sm:min-h-[200px]">
            불러오는 중...
          </div>
        </div>
      }
    >
      <PlaylistListClient />
    </Suspense>
  );
}
