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
import { PostAuthorRow } from "./post-author-row";

function getTimeAgo(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  return `${days}일 전`;
}

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

  post.views = currentViews + 1;
  await postRepository.save(post);

  const commentCount = await commentRepository.count({
    where: { postId: id },
  });

  const categoryName = {
    K: "국내게시판",
    I: "해외게시판",
    M: "장터게시판",
    W: "워크룸",
    N: "공지사항",
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
          className="text-xs text-zinc-400 hover:text-[var(--color-brand-primary)] transition-colors"
        >
          ← 목록으로 돌아가기
        </Link>
      </div>

      <article className="space-y-8">
        <header className="space-y-4">
          <div className="text-xs font-medium text-zinc-400">
            {categoryName}
          </div>
          
          <h1 className="text-[30px] font-bold tracking-tight text-black">
            {noticeLabel && noticeColor && (
              <span className={`mr-2 text-[30px] font-semibold ${noticeColor}`}>
                [{noticeLabel}]
              </span>
            )}
            {post.title}
          </h1>

          <PostAuthorRow
            userId={post.userId}
            nickname={post.nickname}
            profileImage={post.user?.profileImage ?? null}
            timeAgo={getTimeAgo(new Date(post.createdAt))}
            views={post.views}
            commentCount={commentCount}
          />
        </header>

        <PostContentClient 
          content={post.content} 
          postId={post.id} 
          userId={post.userId} 
          category={post.category} 
          isNotice={post.category === "N" || post.isGlobal === "Y"}
        />
      </article>
    </div>
  );
}
