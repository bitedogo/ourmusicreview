/** 프로필 안내 i 아이콘 (아웃라인 원 + i, Figma Group 116) */

export function ProfileInfoIcon({
  size = 22,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 text-[#D9D9D9] ${className}`}
      aria-hidden
    >
      <path
        d="M20.7778 11C20.7778 5.59988 16.4001 1.22222 11 1.22222C5.59988 1.22222 1.22222 5.59988 1.22222 11C1.22222 16.4001 5.59988 20.7778 11 20.7778V22C4.92487 22 0 17.0751 0 11C0 4.92487 4.92487 0 11 0C17.0751 0 22 4.92487 22 11C22 17.0751 17.0751 22 11 22V20.7778C16.4001 20.7778 20.7778 16.4001 20.7778 11Z"
        fill="currentColor"
      />
      <path
        d="M10.2394 18.333V8.61133H11.7791V18.333H10.2394ZM11.0093 7C10.4185 7 9.93506 6.55241 9.93506 5.97949C9.93506 5.40658 10.4185 4.95898 11.0093 4.95898C11.6001 4.95898 12.1014 5.40658 12.1014 5.97949C12.1014 6.55241 11.6001 7 11.0093 7Z"
        fill="currentColor"
      />
    </svg>
  );
}
