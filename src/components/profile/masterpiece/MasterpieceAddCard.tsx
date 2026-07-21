/** Masterpiece 명반 추가 카드 */

import { MasterpiecePlusBadge } from "@/src/components/profile/MasterpiecePlusBadge";
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
      className="relative flex w-full flex-col overflow-hidden rounded-[10px] border-2 border-dashed border-[#43A7B2] bg-[#FEFEFE] shadow-[0px_2px_4px_rgba(0,0,0,0.25)] transition hover:bg-[#F7FCFD] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="relative aspect-square w-full">
        <p className="absolute left-0 right-0 top-3 z-10 px-2 text-center text-[12px] font-normal leading-[14px] text-[#43A7B2]">
          나의 명반을 등록해주세요.
        </p>
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <MasterpiecePlusBadge size="md" />
        </div>
      </div>

      <div className="flex min-h-[78px] items-end justify-center px-2 pb-2 pt-1.5">
        <p className="text-center text-[13px] font-bold leading-4 text-[#43A7B2]">
          {count}/{MASTERPIECE_MAX_COUNT}
        </p>
      </div>
    </button>
  );
}
