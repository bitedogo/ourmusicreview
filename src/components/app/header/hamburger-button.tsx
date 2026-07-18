/** 모바일 햄버거 메뉴 버튼 */

interface HamburgerButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function HamburgerButton({ isOpen, onToggle }: HamburgerButtonProps) {
  return (
    <button
      type="button"
      aria-label="메뉴 열기"
      aria-expanded={isOpen}
      onClick={onToggle}
      className="flex flex-col justify-center gap-1.5 rounded p-2 text-zinc-700 hover:bg-zinc-100"
    >
      <span className="block h-0.5 w-5 rounded-full bg-current" />
      <span className="block h-0.5 w-5 rounded-full bg-current" />
      <span className="block h-0.5 w-5 rounded-full bg-current" />
    </button>
  );
}
