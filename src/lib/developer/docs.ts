/** 개발자 가이드 마크다운 카탈로그·파일 로더 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { rewriteGuideHref } from "@/src/lib/guides/links";

export interface DeveloperDocMeta {
  slug: string;
  file: string;
  number: string;
  title: string;
  summary: string;
}

export const DEVELOPER_DOCS: DeveloperDocMeta[] = [
  {
    slug: "01_overview",
    file: "01_overview.md",
    number: "01",
    title: "프로젝트 개요 & 기술 스택",
    summary: "ORU가 무엇을 하는지, 왜 이 기술을 쓰는지",
  },
  {
    slug: "02_structure",
    file: "02_structure.md",
    number: "02",
    title: "디렉토리 구조 및 역할",
    summary: "폴더가 식당의 어느 구역인지",
  },
  {
    slug: "03_data_flow",
    file: "03_data_flow.md",
    number: "03",
    title: "핵심 데이터 흐름",
    summary: "클릭부터 화면까지의 여정",
  },
  {
    slug: "04_core_features",
    file: "04_core_features.md",
    number: "04",
    title: "주요 기능 딥다이브",
    summary: "리뷰 · 커뮤니티 · 플레이리스트",
  },
  {
    slug: "05_getting_started",
    file: "05_getting_started.md",
    number: "05",
    title: "로컬 실행 가이드",
    summary: ".env부터 npm run dev까지",
  },
  {
    slug: "06_portfolio",
    file: "06_portfolio.md",
    number: "06",
    title: "포트폴리오용 프로젝트 소개",
    summary: "이력서·면접에 옮겨 쓰는 문장",
  },
  {
    slug: "07_feedback",
    file: "07_feedback.md",
    number: "07",
    title: "피드백 & 아이디어",
    summary: "사이트를 보며 이러면 좋겠다",
  },
];

function docsDir() {
  return path.join(process.cwd(), "developer");
}

export function getDeveloperDoc(slug: string): DeveloperDocMeta | undefined {
  return DEVELOPER_DOCS.find((doc) => doc.slug === slug);
}

export async function readDeveloperMarkdown(fileName: string): Promise<string> {
  return readFile(path.join(docsDir(), fileName), "utf8");
}

export function getAdjacentDocs(slug: string): {
  prev: DeveloperDocMeta | null;
  next: DeveloperDocMeta | null;
} {
  const index = DEVELOPER_DOCS.findIndex((doc) => doc.slug === slug);
  if (index < 0) {
    return { prev: null, next: null };
  }
  return {
    prev: DEVELOPER_DOCS[index - 1] ?? null,
    next: DEVELOPER_DOCS[index + 1] ?? null,
  };
}

/** 문서 안의 ./01_overview.md 링크를 사이트 경로로 바꿉니다. */
export function rewriteDeveloperHref(href: string | undefined): string {
  return rewriteGuideHref(href, "/developer");
}
