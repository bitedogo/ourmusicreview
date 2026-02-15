import Link from "next/link";
import { notFound } from "next/navigation";
import { initializeDatabase } from "@/src/lib/db";
import { Post } from "@/src/lib/db/entities/Post";
import { Comment } from "@/src/lib/db/entities/Comment";
import { PostContentClient } from "./post-content-client";

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
  }[post.category];

  const categoryPath = {
    K: "domestic",
    I: "overseas",
    M: "market",
    W: "workroom",
  }[post.category];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-10 sm:px-10">
      <div className="flex items-center justify-between shrink-0">
        <Link
          href={`/boards/${categoryPath}`}
          className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          ← 목록으로 돌아가기
        </Link>
      </div>

      <article className="space-y-8">
        <header className="space-y-4">
          <div className="text-xs font-medium text-zinc-400">
            {categoryName}
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 pt-2 pb-4 border-b border-zinc-100">
            <div className="h-6 w-6 overflow-hidden rounded-md bg-zinc-100">
              {post.user?.profileImage ? (
                <img
                  src={post.user.profileImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-zinc-400">
                  {post.nickname.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-[13px] text-zinc-500">
              <span className="font-semibold text-zinc-900">{post.nickname}</span>
              <span className="text-zinc-300">|</span>
              <span>{getTimeAgo(new Date(post.createdAt))}</span>
              <span className="text-zinc-300">|</span>
              <span>조회 수 <span className="text-zinc-900">{post.views}</span></span>
              <span className="text-zinc-300">|</span>
              <span>댓글 <span className="text-red-500 font-medium">{commentCount}</span></span>
            </div>
          </div>
        </header>

        <PostContentClient 
          content={post.content} 
          postId={post.id} 
          userId={post.userId} 
          category={post.category} 
          isNotice={post.user?.role === "ADMIN" || post.isGlobal === "Y"}
        />
      </article>
    </div>
  );
}
