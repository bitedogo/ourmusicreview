import { ResponsiveLineJoin } from "./responsive-line-join";

export function HomeHeroCopy() {
  return (
    <div className="mt-10 space-y-3 text-center sm:mt-12">
      <h1 className="text-[32px] font-bold leading-tight tracking-tight text-[var(--color-accent)] sm:text-[40px]">
        <ResponsiveLineJoin before="당신의 음악을 기록하고" after="공유하세요" />
      </h1>
      <p className="mx-auto max-w-2xl text-sm leading-7 text-[var(--color-subtitle)] sm:text-base">
        <ResponsiveLineJoin
          before="좋아하는 앨범을 저장하고, 리뷰로 감상을 남기고,"
          after="새로운 음악을 발견하세요."
        />
      </p>
    </div>
  );
}
