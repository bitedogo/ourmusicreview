/** 홈 히어로 카피 문구 */

import { HeroLineJoin } from "./responsive-line-join";

interface HomeHeroCopyProps {
  className?: string;
}

export function HomeHeroCopy({ className = "" }: HomeHeroCopyProps) {
  return (
    <div className={`flex flex-col gap-[var(--hero-title-subtitle-gap)] text-center ${className}`.trim()}>
      <h1 className="whitespace-nowrap text-[length:var(--text-hero-title-mobile)] font-semibold leading-[var(--leading-hero-title)] tracking-[var(--tracking-hero-title)] text-[var(--color-hero-title)] sm:whitespace-normal sm:text-[length:var(--text-hero-title-desktop)]">
        <HeroLineJoin before="당신의 음악을 기록하고" after="공유하세요" />
      </h1>
      <p className="mx-auto max-w-2xl text-[length:var(--text-hero-subtitle-mobile)] font-normal leading-[var(--leading-hero-subtitle)] tracking-[var(--tracking-hero-subtitle)] text-[var(--color-hero-subtitle)] sm:text-[length:var(--text-hero-subtitle-desktop)] sm:font-semibold">
        <HeroLineJoin
          before="좋아하는 앨범을 저장하고, 리뷰로 감상을 남기고,"
          after="새로운 음악을 발견하세요."
          lineBreak
        />
      </p>
    </div>
  );
}
