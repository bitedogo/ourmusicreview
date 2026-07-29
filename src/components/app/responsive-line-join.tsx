/** 반응형 줄바꿈 텍스트 조인 */

interface HeroLineJoinProps {
  before: string;
  after: string;
  /** true면 모바일에서만 줄바꿈, 데스크톱은 한 줄 */
  lineBreak?: boolean;
}

export function HeroLineJoin({ before, after, lineBreak = false }: HeroLineJoinProps) {
  if (lineBreak) {
    return (
      <>
        {before}
        <br className="sm:hidden" />
        <span className="hidden sm:inline"> </span>
        {after}
      </>
    );
  }

  return (
    <>
      {before} {after}
    </>
  );
}
