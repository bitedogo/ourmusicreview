/** 내 댓글 목록 페이지 */

import Link from "next/link";
import { ProfileListPageLayout } from "@/src/components/profile/profile-list-page-layout";
import { requireAuthPage } from "@/src/lib/auth/session";
import { getBoardCategoryLabel } from "@/src/lib/community/board-config";
import { initializeDatabase } from "@/src/lib/db";
import { listMyProfileComments } from "@/src/lib/profile/profile-content-service";

function getCommentHref(comment: {
  targetType: string;
  post: { id: string } | null;
  review: { id: string } | null;
}): string | null {
  if (comment.targetType === "BOARD" && comment.post) {
    return `/community/${encodeURIComponent(comment.post.id)}`;
  }
  if (comment.targetType === "REVIEW" && comment.review) {
    return `/review/${encodeURIComponent(comment.review.id)}`;
  }
  return null;
}

export default async function MyCommentsPage() {
  const session = await requireAuthPage("/profile/comments");
  const dataSource = await initializeDatabase();
  const comments = await listMyProfileComments(dataSource, session.user.id);

  return (
    <ProfileListPageLayout
      title="내가 작성한 댓글"
      description="게시판 댓글과 리뷰 댓글을 한 번에 확인할 수 있습니다."
      emptyMessage="아직 작성한 댓글이 없습니다."
      isEmpty={comments.length === 0}
    >
      <div className="space-y-3">
        {comments.map((comment) => {
          const href = getCommentHref(comment);

          return (
            <div
              key={comment.id}
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {comment.targetType === "BOARD" && comment.post ? (
                  <>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-text-primary)]">
                      게시판 댓글
                    </span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                      {getBoardCategoryLabel(comment.post.category)}
                    </span>
                  </>
                ) : comment.targetType === "REVIEW" && comment.review ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    리뷰 댓글
                  </span>
                ) : (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-text-primary)]">
                    기타
                  </span>
                )}
                <span className="text-[11px] text-[var(--color-text-secondary)]">
                  {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>

              <p className="line-clamp-2 text-sm text-[var(--color-text-primary)]">
                {comment.content}
              </p>

              <div className="mt-2 text-xs text-[var(--color-text-secondary)]">
                {comment.targetType === "BOARD" && comment.post ? (
                  <span className="line-clamp-1">게시글: {comment.post.title}</span>
                ) : comment.targetType === "REVIEW" && comment.review ? (
                  <span className="line-clamp-1">
                    리뷰: {comment.review.albumArtist ?? "아티스트 정보 없음"} -{" "}
                    {comment.review.albumTitle ?? "앨범 정보 없음"}
                  </span>
                ) : (
                  <span>연결된 원문 정보를 찾을 수 없습니다.</span>
                )}
              </div>

              {href && (
                <Link
                  href={href}
                  className="mt-3 inline-flex text-xs font-medium text-[var(--color-text-primary)] underline underline-offset-4 hover:text-[var(--color-brand-primary)]"
                >
                  원문 보러가기
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </ProfileListPageLayout>
  );
}
