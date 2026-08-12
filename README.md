# ORU — Music Review & Community

음악을 기록하고, 그 속에 담긴 당신의 가치를 나누는 공간 **ORU**입니다.  
앨범 단위 리뷰, 커뮤니티 게시판, 오늘의 앨범, 슬라이드바 등 음악 감상과 기록을 위한 웹 서비스입니다.

## 🚀 Launch Date

- **Official Launch:** 2026. 03. 16

## ✨ Key Features

- **Album-Unit Criticism:** 싱글이 아닌 앨범 단위의 깊이 있는 평론 지향
- **Community:** 국내/해외 음악 담론 게시판 운영
- **Workroom:** 창작자들을 위한 피드백 및 협업 공간
- **Market:** LP/CD 등 음악 관련 중고 물품 거래 장터

## 🛠 Tech Stack

- **Framework:** Next.js (App Router)
- **Database:** Supabase
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## 👥 Team ORU

- **Created with passion by Team ORU**
- **Contact:** [forsix5020@naver.com](mailto:forsix5020@naver.com)
- **Instagram:** [@comeonoru]

---

# © 2026 ORU. All rights reserved.

- **공식 사이트:** [https://www.comeonoru.com](https://www.comeonoru.com)
- **정식 런칭 :** 2026. 03. 16

---

## 주요 기능

### 홈

- 아티스트 검색 (iTunes API 연동, 자동완성)
- **슬라이드바** — 추천/관리자 선정 앨범 마퀴 카드
- **오늘의 앨범** — Today / Yesterday / Previous 탭

### 리뷰

- 앨범 단위 리뷰 작성·조회 (0~10점 평점)
- 앨범별 리뷰 목록, 중복 리뷰 방지
- 리뷰 승인 워크플로 (관리자)

### 커뮤니티

- **앨범 리뷰** 목록
- **국내 / 해외 / 장터 / 워크룸** 게시판
- 공지, FAQ, 정책 페이지

### 사용자

- 이메일·Google 로그인 (NextAuth)
- 마이페이지 (프로필, 작성 리뷰, 즐겨찾기 앨범 등)
- 앨범 즐겨찾기, 좋아요, 댓글, 신고

### 관리자

- 리뷰 승인, 멤버·신고 관리
- 오늘의 앨범, 슬라이드바, FAQ 편집

---

## 기술 스택


| 영역           | 기술                                             |
| ------------ | ---------------------------------------------- |
| Framework    | [Next.js 16](https://nextjs.org/) (App Router) |
| Language     | TypeScript                                     |
| UI           | React 19, Tailwind CSS 4                       |
| Auth         | NextAuth.js (Credentials, Google)              |
| ORM / DB     | TypeORM, PostgreSQL (Supabase)                 |
| Storage      | Supabase Storage (프로필 이미지)                     |
| Editor       | Toast UI Editor                                |
| External API | iTunes Search API                              |
| Font         | Pretendard (`next/font/local`)                 |
| Deploy       | Vercel (`icn1` 리전)                             |


---

## 시작하기

### 요구 사항

- Node.js 20+
- npm
- PostgreSQL (Supabase 권장)

### 설치 및 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인합니다.

### 빌드

```bash
npm run build
npm start
```

배포 전 TypeScript 검사는 `next build` 단계에 포함됩니다.

```bash
npm run typecheck   # 선택: 별도 타입 검사
```

### 문서

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — API·폴더·레이어 규칙
- [`BACKEND_SETUP.md`](./BACKEND_SETUP.md) — DB·인증·마이그레이션

---

## 문의

- **Email:** [jaewoo1567@gmail.com](mailto:jaewoo1567@gmail.com)
- **Instagram:** [@comeonoru](https://www.instagram.com/comeonoru)

---

© 2026 ORU. All rights reserved.  
Powered by Team ORU

