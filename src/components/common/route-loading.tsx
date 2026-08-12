/** 라우트 세그먼트 공통 로딩 UI */

interface RouteLoadingProps {
  message?: string;
}

export function RouteLoading({
  message = "불러오는 중...",
}: RouteLoadingProps) {
  return (
    <div className="mx-auto flex min-h-[40vh] w-full max-w-3xl items-center justify-center px-6 py-16">
      <p className="text-sm text-[var(--color-text-secondary)]">{message}</p>
    </div>
  );
}
