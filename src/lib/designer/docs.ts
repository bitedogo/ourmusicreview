/** 디자이너 가이드 마크다운 카탈로그·파일 로더 */

import { readFile } from "node:fs/promises";
import path from "node:path";

export interface DesignerDocMeta {
  slug: string;
  file: string;
  number: string;
  title: string;
  summary: string;
}

export const DESIGNER_DOCS: DesignerDocMeta[] = [
  {
    slug: "01_brand",
    file: "01_brand.md",
    number: "01",
    title: "브랜드 & 톤앤매너",
    summary: "ORU가 어떻게 보이고, 어떻게 말하는지",
  },
  {
    slug: "02_color",
    file: "02_color.md",
    number: "02",
    title: "컬러 시스템",
    summary: "청록 브랜드와 평점 색의 역할",
  },
  {
    slug: "03_typography",
    file: "03_typography.md",
    number: "03",
    title: "타이포그래피",
    summary: "Pretendard와 화면별 글자 크기",
  },
  {
    slug: "04_layout",
    file: "04_layout.md",
    number: "04",
    title: "레이아웃 & 간격",
    summary: "1100px 캔버스, 패딩, 반응형 끊김",
  },
  {
    slug: "05_components",
    file: "05_components.md",
    number: "05",
    title: "컴포넌트 & 핸드오프",
    summary: "화면 패턴과 개발자에게 넘기는 방법",
  },
  {
    slug: "06_portfolio",
    file: "06_portfolio.md",
    number: "06",
    title: "포트폴리오용 케이스 스터디",
    summary: "노션·PDF에 옮겨 쓰는 디자인 스토리",
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
  return path.join(process.cwd(), "designer");
}

export function getDesignerDoc(slug: string): DesignerDocMeta | undefined {
  return DESIGNER_DOCS.find((doc) => doc.slug === slug);
}

export async function readDesignerMarkdown(fileName: string): Promise<string> {
  return readFile(path.join(docsDir(), fileName), "utf8");
}

export function getAdjacentDesignerDocs(slug: string): {
  prev: DesignerDocMeta | null;
  next: DesignerDocMeta | null;
} {
  const index = DESIGNER_DOCS.findIndex((doc) => doc.slug === slug);
  if (index < 0) {
    return { prev: null, next: null };
  }
  return {
    prev: DESIGNER_DOCS[index - 1] ?? null,
    next: DESIGNER_DOCS[index + 1] ?? null,
  };
}
