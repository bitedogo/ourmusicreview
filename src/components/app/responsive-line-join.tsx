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
