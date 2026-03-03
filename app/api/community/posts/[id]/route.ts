import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { Post } from "@/src/lib/db/entities/Post";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { title, content, category, isGlobal } = await request.json();

    const dataSource = await initializeDatabase();
    const postRepository = dataSource.getRepository(Post);
    const post = await postRepository.findOne({ where: { id } });

    if (!post) {
      return NextResponse.json({ ok: false, error: "게시글을 찾을 수 없습니다." }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";

    if (post.userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ ok: false, error: "수정 권한이 없습니다." }, { status: 403 });
    }

    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (isAdmin && typeof isGlobal === "boolean") {
      post.isGlobal = isGlobal ? "Y" : "N";
    }

    await postRepository.save(post);

    return NextResponse.json({ ok: true, post });
  } catch {
    return NextResponse.json({ ok: false, error: "게시글 수정 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });
    }

    const dataSource = await initializeDatabase();
    const postRepository = dataSource.getRepository(Post);
    
    const post = await postRepository.findOne({ where: { id } });

    if (!post) {
      return NextResponse.json({ ok: false, error: "게시글을 찾을 수 없습니다." }, { status: 404 });
    }

    if (post.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "삭제 권한이 없습니다." }, { status: 403 });
    }

    await postRepository.remove(post);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "게시글 삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dataSource = await initializeDatabase();
    const postRepository = dataSource.getRepository(Post);
    const post = await postRepository.findOne({ 
      where: { id },
      relations: ["user"]
    });

    if (!post) {
      return NextResponse.json({ ok: false, error: "게시글을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, post });
  } catch {
    return NextResponse.json({ ok: false, error: "게시글 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
