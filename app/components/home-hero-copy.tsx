import { ResponsiveLineJoin } from "./responsive-line-join";

export function HomeHeroCopy() {
  return (
    <div className="mt-[var(--hero-copy-margin-top-mobile)] space-y-[var(--featured-card-inner-gap)] text-center sm:mt-[var(--hero-copy-margin-top-desktop)]">
      <h1 className="text-[length:var(--text-hero-title-mobile)] font-bold leading-tight tracking-tight text-[var(--color-accent)] sm:text-[length:var(--text-hero-title-desktop)]">
        <ResponsiveLineJoin before="당신의 음악을 기록하고" after="공유하세요" />
      </h1>
      <p className="mx-auto max-w-2xl text-[length:var(--text-hero-subtitle-mobile)] leading-[var(--leading-hero-subtitle)] text-[var(--color-subtitle)] sm:text-[length:var(--text-hero-subtitle-desktop)]">
        <ResponsiveLineJoin
          before="좋아하는 앨범을 저장하고, 리뷰로 감상을 남기고,"
          after="새로운 음악을 발견하세요."
        />
      </p>
    </div>
  );
}
