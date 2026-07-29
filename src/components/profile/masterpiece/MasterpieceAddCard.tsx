/** Masterpiece 명반 추가 카드 — 앨범 카드와 동일 높이 */

import { MasterpiecePlusBadge } from "@/src/components/profile/MasterpiecePlusBadge";
import { MasterpieceAlbumMeta } from "./MasterpieceAlbumMeta";
import { MASTERPIECE_MAX_COUNT } from "./masterpiece-utils";

interface MasterpieceAddCardProps {
  count: number;
  onClick: () => void;
  disabled?: boolean;
}

export function MasterpieceAddCard({
  count,
  onClick,
  disabled,
}: MasterpieceAddCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="나의 명반 추가"
      className="relative box-border flex w-full shrink-0 flex-col overflow-hidden rounded-[10px] border-2 border-dashed border-[#43A7B2] bg-[#FEFEFE] shadow-[0px_2px_4px_rgba(0,0,0,0.25)] transition hover:bg-[#F7FCFD] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {/* 앨범 카드와 동일 — 정사각형 커버 + 메타 영역 */}
      <div className="aspect-square w-full shrink-0" aria-hidden />
      <div className="relative shrink-0">
        <div className="invisible" aria-hidden>
          <MasterpieceAlbumMeta
            title="placeholder"
            artist="placeholder"
            genre="—"
            year="—"
            linkArtist={false}
            footer={
              <p className="text-center text-[9px] font-bold leading-snug tracking-[-0.005em] text-[#43A7B2] lg:text-[10px]">
                Rating : -
              </p>
            }
          />
        </div>
        <p className="absolute inset-x-0 bottom-2 text-center text-[13px] font-bold leading-4 text-[#43A7B2]">
          {count}/{MASTERPIECE_MAX_COUNT}
        </p>
      </div>

      {/* 상단 문구 · 원형+ — 카드 전체 기준 배치 */}
      <p className="pointer-events-none absolute inset-x-0 top-3 z-10 px-2 text-center text-[12px] font-normal leading-[14px] text-[#43A7B2]">
        나의 명반을 등록해주세요.
      </p>
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <MasterpiecePlusBadge size="md" />
      </div>
    </button>
  );
}
