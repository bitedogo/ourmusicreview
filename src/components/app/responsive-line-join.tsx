/** 반응형 줄바꿈 텍스트 조인 */

interface HeroLineJoinProps {
  before: string;
  after: string;
}

export function HeroLineJoin({ before, after }: HeroLineJoinProps) {
  return (
    <>
      {before} {after}
    </>
  );
}
