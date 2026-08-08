/** 게시글이 없을 때 표시하는 안내 문구 */

interface BoardEmptyStateProps {
  searchQuery: string;
}

export function BoardEmptyState({ searchQuery }: BoardEmptyStateProps) {
  return (
    <div className="border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-[var(--color-text-secondary)]">
      {searchQuery ? (
        "검색 결과가 없습니다. 다른 키워드로 다시 시도해주세요."
      ) : (
        <>
          아직 등록된 게시글이 없습니다.{" "}
          <span className="font-semibold text-[var(--color-text-primary)]">첫 번째 글</span>을
          남겨보세요.
        </>
      )}
    </div>
  );
}
