import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { Post, PostCategory } from "@/src/lib/db/entities/Post";
import { Comment } from "@/src/lib/db/entities/Comment";
import Link from "next/link";

type BoardType = "domestic" | "overseas" | "market" | "workroom";

interface BoardMeta {
  title: string;
  description: string;
  category: PostCategory;
}

const BOARD_CONFIG: Record<BoardType, BoardMeta> = {
  domestic: {
    title: "국내게시판",
    description: "국내 음악에 대한 이야기와 정보를 자유롭게 나눠보세요.",
    category: "K",
  },
  overseas: {
    title: "해외게시판",
    description: "해외 음악에 대한 이야기와 정보를 자유롭게 나눠보세요.",
    category: "I",
  },
  market: {
    title: "장터게시판",
    description: "음반, 굿즈, 공연 티켓 등 음악 관련 물품을 자유롭게 거래해보세요.",
    category: "M",
  },
  workroom: {
    title: "워크룸",
    description: "작업 중인 음악, 가사, 아이디어를 공유하고 피드백을 받아보세요.",
    category: "W",
  },
};

export default async function BoardPage(props: {
  params: Promise<{ board: BoardType }>;
}) {
  const { board } = await props.params;

  const config = BOARD_CONFIG[board];
  if (!config) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const isSignedIn = Boolean(session?.user?.id);

  const dataSource = await initializeDatabase();
  const postRepository = dataSource.getRepository(Post);
  const commentRepository = dataSource.getRepository(Comment);

  // 해당 카테고리의 일반 게시글 + 모든 카테고리의 전체 공지사항(IS_GLOBAL = 'Y') 조회
  const posts = await postRepository.find({
    where: [
      { category: config.category },
      { isGlobal: "Y" }
    ],
    relations: ["user"],
    order: { createdAt: "DESC" },
  });

  // 각 포스트의 댓글 수 가져오기 및 공지사항(ADMIN) 처리
  const postsWithMeta = await Promise.all(
    posts.map(async (post) => {
      const count = await commentRepository.count({
        where: { postId: post.id },
      });
      return { 
        ...post, 
        commentCount: count,
        isAdmin: post.user?.role === "ADMIN" || post.isGlobal === "Y"
      };
    })
  );

  // 전체 공지사항(isGlobal) -> 일반 공지사항(isAdmin) -> 일반 게시물 순으로 정렬
  const sortedPosts = postsWithMeta.sort((a, b) => {
    // 1순위: 전체 공지사항
    if (a.isGlobal === "Y" && b.isGlobal !== "Y") return -1;
    if (a.isGlobal !== "Y" && b.isGlobal === "Y") return 1;
    
    // 2순위: 일반 공지사항 (해당 카테고리 관리자 글)
    if (a.isAdmin && !b.isAdmin) return -1;
    if (!a.isAdmin && b.isAdmin) return 1;
    
    return 0;
  });

  const writeHref = isSignedIn
    ? `/community/write?category=${encodeURIComponent(config.category)}`
    : `/auth/signin?callbackUrl=${encodeURIComponent(
        `/community/write?category=${config.category}`
      )}`;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-10">
      <section className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {config.title}
          </h1>
          <p className="mt-1 text-xs text-zinc-500">{config.description}</p>
        </div>
        <Link
          href={writeHref}
          className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
        >
          글쓰기
        </Link>
      </section>

      <section>
        {posts.length === 0 ? (
          <div className="border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
            아직 등록된 게시글이 없습니다.{" "}
            <span className="font-semibold text-zinc-700">
              첫 번째 글
            </span>
            을 남겨보세요.
          </div>
        ) : (
          <div className="overflow-hidden border border-zinc-200 bg-white text-xs shadow-sm">
            <table className="min-w-full table-fixed border-collapse">
              <thead className="bg-zinc-50">
                <tr className="border-b border-zinc-200 text-zinc-700">
                  <th className="w-[60px] px-3 py-2 text-center font-semibold">
                    번호
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">제목</th>
                  <th className="w-[100px] px-3 py-2 text-center font-semibold">
                    글쓴이
                  </th>
                  <th className="w-[80px] px-3 py-2 text-center font-semibold">
                    날짜
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {sortedPosts.map((post) => (
                  <tr
                    key={post.id}
                    className={`hover:bg-zinc-50 ${post.isAdmin ? 'bg-zinc-50/50' : ''}`}
                  >
                    <td className="px-3 py-2 text-center text-[11px] text-zinc-400">
                      {post.isAdmin ? (
                        <span className="text-base" title="공지사항">📢</span>
                      ) : (
                        posts.length - posts.findIndex(p => p.id === post.id)
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm text-zinc-900">
                      <Link
                        href={`/community/${encodeURIComponent(post.id)}`}
                        className={`flex items-center gap-1.5 hover:underline ${post.isAdmin ? 'text-red-600 font-bold' : ''}`}
                      >
                        <span className="line-clamp-1">{post.title}</span>
                        {post.commentCount > 0 && (
                          <span className="text-[10px] font-bold text-red-500">
                            [{post.commentCount}]
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-center text-[11px] text-zinc-700">
                      <span className={`line-clamp-1 ${post.isAdmin ? 'font-black' : ''}`}>{post.nickname}</span>
                    </td>
                    <td className="px-3 py-2 text-center text-[11px] text-zinc-500">
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleDateString("ko-KR", {
                            month: "2-digit",
                            day: "2-digit",
                          })
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
