/** 커�??�티 게시글 ?�세 ?�버 ?�이지 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { initializeDatabase } from "@/src/lib/db";
import { Post } from "@/src/lib/db/entities/Post";
import type { NoticeCategory } from "@/src/lib/community/types";
import { Comment } from "@/src/lib/db/entities/Comment";
import {
  NOTICE_CATEGORY_COLOR,
  NOTICE_CATEGORY_LABEL,
} from "@/src/lib/community/notice-category";
import { PostContentClient } from "./post-content-client";

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const dataSource = await initializeDatabase();
  const postRepository = dataSource.getRepository(Post);
  const commentRepository = dataSource.getRepository(Comment);

  const post = await postRepository.findOne({
    where: { id },
    relations: ["user"],
  });

  if (!post) {
    notFound();
  }

  const currentViews =
    typeof post.views === "number"
      ? post.views
      : Number(post.views ?? 0);


  const commentCount = await commentRepository.count({
    where: { postId: id },
  });

  const categoryName = {
    K: "�?��게시??,
    I: "?�외게시??,
    M: "?�터게시??,
    W: "?�크�?,
    N: "공�??�항",
  }[post.category];

  const categoryPath = {
    K: "domestic",
    I: "overseas",
    M: "market",
    W: "workroom",
    N: "notice",
  }[post.category];

  const noticeLabel =
    post.category === "N" && post.noticeCategory && post.noticeCategory in NOTICE_CATEGORY_LABEL
      ? NOTICE_CATEGORY_LABEL[post.noticeCategory as NoticeCategory]
      : null;
  const noticeColor =
    post.category === "N" && post.noticeCategory && post.noticeCategory in NOTICE_CATEGORY_COLOR
      ? NOTICE_CATEGORY_COLOR[post.noticeCategory as NoticeCategory]
      : null;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-10 sm:px-10">
      <div className="flex items-center justify-between shrink-0">
        <Link
          href={`/boards/${categoryPath}`}
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] transition-colors"
        >
          ??목록?�로 ?�아가�?        </Link>
      </div>

      <article className="space-y-8">
        <header className="space-y-4">
          <div className="text-xs font-medium text-[var(--color-text-muted)]">
            {categoryName}
          </div>
          
          <h1 className="text-[30px] font-bold tracking-tight text-[#505050]">
            {noticeLabel && noticeColor && (
              <span className={`mr-2 text-[30px] font-semibold ${noticeColor}`}>
                [{noticeLabel}]
              </span>
            )}
            {post.title}
          </h1>

        </header>

        <PostContentClient 
          content={post.content} 
          postId={post.id} 
          userId={post.userId} 
          category={post.category} 
          isNotice={post.category === "N" || post.isGlobal === "Y"}
          initialViews={currentViews}
          initialCommentCount={commentCount}
          postAuthorNickname={post.nickname}
          postAuthorProfileImage={post.user?.profileImage ?? null}
          postCreatedAt={post.createdAt.toISOString()}
        />
      </article>
    </div>
  );
}
