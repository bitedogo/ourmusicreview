import { HeroLineJoin } from "./responsive-line-join";

interface HomeHeroCopyProps {
  className?: string;
}

export function HomeHeroCopy({ className = "" }: HomeHeroCopyProps) {
  return (
    <div className={`flex flex-col gap-[var(--hero-title-subtitle-gap)] text-center ${className}`.trim()}>
      <h1 className="whitespace-nowrap text-[length:var(--text-hero-title-mobile)] font-normal leading-tight tracking-tight text-[#35909A] sm:whitespace-normal sm:text-[length:var(--text-hero-title-desktop)]">
        <HeroLineJoin before="당신의 음악을 기록하고" after="공유하세요" />
      </h1>
      <p className="mx-auto max-w-2xl whitespace-nowrap text-[length:var(--text-hero-subtitle-mobile)] font-normal leading-[var(--leading-hero-subtitle)] text-[#43A7B2]/55 sm:whitespace-normal sm:text-[length:var(--text-hero-subtitle-desktop)]">
        <HeroLineJoin
          before="좋아하는 앨범을 저장하고, 리뷰로 감상을 남기고,"
          after="새로운 음악을 발견하세요."
        />
      </p>
    </div>
  );
}
