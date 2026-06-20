interface ResponsiveLineJoinProps {
  before: string;
  after: string;
}

export function ResponsiveLineJoin({ before, after }: ResponsiveLineJoinProps) {
  return (
    <>
      {before}
      <br className="sm:hidden" />
      <span className="hidden sm:inline"> </span>
      {after}
    </>
  );
}
