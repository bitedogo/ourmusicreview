# 02. 디렉토리 구조 및 역할

> **한 줄 요약:** `app/`은 “주소와 화면”, `src/`는 “부품과 규칙”입니다.  
> 새 기능을 넣을 때 **어디에 파일을 둘지**가 이 문서의 목표입니다.

---

## 1. 프로젝트 루트 지도

```
music_review/
├── app/                 ← Next.js App Router (URL = 폴더)
│   ├── page.tsx         ← 홈 `/`
│   ├── layout.tsx       ← 전 페이지 껍데기 (헤더/푸터)
│   ├── api/             ← HTTP API (`/api/...`)
│   ├── review/          ← 리뷰 상세·작성 (단수)
│   ├── reviews/         ← 리뷰 목록 (복수)
│   ├── boards/          ← 커뮤니티 게시판
│   ├── community/       ← 글 상세·작성
│   ├── playlist/        ← 공개 플레이리스트
│   ├── profile/         ← 내 마이페이지
│   ├── users/           ← 타인 프로필
│   ├── auth/            ← 로그인·회원가입
│   ├── admin/           ← 관리자 (layout에서 권한 검사)
│   ├── search/          ← 아티스트/앨범 검색
│   ├── faq/ · policies/ ← FAQ, 약관
│   ├── designer/        ← 디자이너 가이드 (비밀번호)
│   ├── developer/       ← 개발자 가이드 (비밀번호)
│   └── globals.css      ← 디자인 토큰(CSS 변수)
│
├── src/
│   ├── components/      ← 재사용 UI
│   ├── hooks/           ← 클라이언트 훅 (`useXxx`)
│   ├── lib/             ← 도메인 로직, DB, 인증, HTTP
│   └── types/           ← 모듈 타입 확장 (next-auth.d.ts)
│
├── scripts/             ← DB 마이그레이션 SQL + 러너
├── public/              ← 정적 파일 (아이콘, 장르 이미지, 소셜 SVG)
├── developer/           ← 지금 읽고 있는 개발자 문서
├── package.json
├── next.config.ts       ← 이미지 원격 호스트 허용 등
├── middleware.ts        ← /designer · /developer 비밀번호 게이트
├── tsconfig.json        ← `@/*` = 프로젝트 루트
└── vercel.json          ← 서울 리전, API 타임아웃
```

**비유:** `app/`은 건물 호수(101호, 202호), `src/lib/`은 지하 기계실, `src/components/`는 가구입니다.  
손님이 보는 문은 `app/`이고, 보일러 고치러는 `src/lib/`로 갑니다.

---

## 2. `app/` — URL이 곧 폴더

Next.js App Router는 **폴더 이름 = 주소**입니다.

```
app/review/write/page.tsx     →  https://.../review/write
app/api/reviews/route.ts      →  https://.../api/reviews
app/users/[userId]/page.tsx   →  https://.../users/abc123
```

`[userId]`처럼 대괄호는 **동적 구간**입니다. 실제 요청의 `abc123`이 `params.userId`로 들어옵니다.

### 2.1 특수 파일 이름

| 파일 | 역할 | 비유 |
|------|------|------|
| `page.tsx` | 그 URL의 화면 | 방의 본문 |
| `layout.tsx` | 하위 페이지를 감싸는 껍데기 | 건물 공용 현관 |
| `loading.tsx` | 로딩 중 대체 UI | “잠시만요” 안내판 |
| `not-found.tsx` | 없는 자원 | 404 문패 |
| `error.tsx` / `global-error.tsx` | 렌더 에러 경계 | 비상구 |
| `route.ts` | API 핸들러 (`GET`/`POST` export) | 창구 직원 |
| `robots.ts` / `sitemap.ts` | SEO | 검색엔진 안내 |

### 2.2 페이지 영역별 역할

```
app/
├── page.tsx                 홈: 히어로, 슬라이드, 오늘의 앨범, 차트
├── layout.tsx               루트: Pretendard, Providers, Header/Footer
├── providers.tsx            NextAuth SessionProvider (클라이언트)
│
├── review/
│   ├── write/               리뷰 작성 (로그인 필수)
│   ├── [id]/                리뷰 상세
│   ├── [id]/edit/           리뷰 수정
│   └── album/[albumId]/     그 앨범의 리뷰 목록
├── reviews/                 전체 리뷰 피드
│
├── boards/[board]/          domestic | overseas | market | workroom | notice
├── community/
│   ├── [id]/                게시글 상세
│   └── write/               글쓰기 (쿼리 ?edit= 이면 수정)
│
├── playlist/                공개 플레이리스트 목록
├── playlist/[id]/           공개 상세
│
├── profile/                 나
│   ├── edit/                프로필·비밀번호
│   ├── reviews/ albums/ playlists/ comments/ posts/ liked-posts/
│   └── playlists/[id]/      내 플레이리스트 편집 화면
├── users/[userId]/          타인 공개 프로필
│
├── auth/                    signin, signup, verify-email, reset-password
├── admin/                   reviews, members, reports, albums, featured-slide, faq
├── search/                  iTunes 아티스트 검색 결과
├── designer/ · developer/   내부 가이드 (비밀번호 게이트)
├── guide-access/            가이드 비밀번호 입력
└── api/                     아래 3절
```

### 2.3 초보자가 가장 헷갈리는 URL 규칙

프로젝트는 **의도적으로** 단수/복수를 섞습니다. 바꾸면 북마크가 깨지므로 맞추기만 하세요.

| 구분 | “목록/집합” | “하나/내 것” |
|------|-------------|--------------|
| 리뷰 페이지 | `/reviews` | `/review/[id]`, `/review/write` |
| 리뷰 API | `/api/reviews/*` 만 존재 | 단수 `/api/review` **없음** |
| 프로필 | `/users/[userId]` (타인) | `/profile` (나) |
| 유저 API | `/api/users/[userId]/*` (공개) | `/api/user/*` (세션 본인) |
| 플레이리스트 | `/playlist` (공개 목록) | `/profile/playlists` (내 것) |

경로 문자열을 직접 이어붙이지 말고 `src/lib/navigation/routes.ts`의 함수를 쓰세요.

```ts
// ✅ 인코딩·규칙이 함수 안에 들어 있음
import { reviewDetail, userProfile } from "@/src/lib/navigation/routes";
router.push(reviewDetail(reviewId));

// ❌ 실수하기 쉬움 (한글/특수문자, 단수복수)
router.push(`/review/${reviewId}`);
```

---

## 3. `app/api/` — 얇은 HTTP 어댑터

```
app/api/
├── auth/                    NextAuth + 회원가입/OTP/비번찾기
├── reviews/                 리뷰 CRUD, list, check, view
├── community/posts/         게시글 작성·수정·삭제
├── comments/                댓글 + comments/like
├── playlists/               목록, 상세, tracks, cover-upload
├── actions/like · report    좋아요·신고 (여러 콘텐츠 공통)
├── albums/ · itunes/        앨범 메타, 평점, iTunes 프록시
├── today-album/             홈 “오늘의 앨범”
├── featured-albums/         홈 슬라이드
├── chart/                   차트
├── profile/                 활동 통계, 내가 쓴 글/댓글
├── user/                    닉네임, 프로필 이미지, 공개설정, 계정
├── users/[userId]/          타인 공개 리소스
├── favorites/               앨범 즐겨찾기
├── genres/ · faq/
├── tracks/streaming-links   트랙별 스트리밍 URL
└── admin/                   관리자 전용 (세션 role === ADMIN)
```

라우트 파일의 전형적인 모양:

```ts
// app/api/reviews/route.ts
export async function POST(request: Request) {
  try {
    // 1) 문지기: 로그인 + 정지 계정은 쓰기 금지
    const { session, response } = await requireWritableSessionApi();
    if (response) return response; // 401/403이면 여기서 끝

    const body = await request.json();

    // 2) 창고 열쇠
    const dataSource = await initializeDatabase();

    // 3) 요리사에게 위임 (중복 리뷰, 앨범 upsert 등은 여기 없음)
    const result = await createReview(dataSource, session.user.id, body);

    // 4) 통일된 JSON { ok: true, data }
    return apiOk(result, { status: 201 });
  } catch (error) {
    // ServiceError면 그 status 유지, 그 외 500
    return handleRouteError(error, "리뷰 작성 중 오류가 발생했습니다.");
  }
}
```

**Why 라우트를 얇게 유지하나?**  
같은 “리뷰 생성” 규칙을 다른 URL에서 재사용할 수 있고, 테스트·읽기가 쉬워집니다.  
DB 쿼리를 `route.ts`에 직접 길게 쓰지 않는 것이 이 레포의 약속입니다.

---

## 4. `src/lib/` — 도메인별 기계실

폴더 이름 = **업무 영역(bounded context)** 입니다. 단수 `lib/review`는 쓰지 않고 **`lib/reviews`** 만 씁니다.

```
src/lib/
├── db/
│   ├── data-source.ts       TypeORM DataSource (DATABASE_URL)
│   ├── index.ts             initializeDatabase() — 한 번만 연결
│   └── entities/            User, Review, Album, Post, Playlist, …
│
├── http/
│   ├── response.ts          apiOk / apiError
│   ├── handle-route-error.ts
│   ├── service-error.ts     throw new ServiceError(msg, status)
│   ├── client.ts            브라우저용 fetchJson
│   └── cache.ts             publicCachedJson / noStoreJson
│
├── auth/                    NextAuth 설정, 세션 가드, OTP, 비밀번호
├── reviews/                 review-service, review-list-service, client-api
├── community/               게시글·게시판 설정
├── comments/                댓글 트리, 작성/수정/삭제
├── playlists/               플레이리스트 + 트랙
├── engagement/              좋아요·신고 (콘텐츠 공통)
├── albums/ · album/         평점 집계, 앨범 상세 타입
├── itunes/ · spotify/       외부 API 래퍼
├── streaming/               플랫폼 링크
├── storage/                 R2 업로드 (media.ts, r2.ts)
├── email/                   Resend + 메일 템플릿
├── navigation/              routes.ts, nav-config.ts
├── layout/                  콘텐츠 폭, 패딩 토큰
├── genres/ · faq/ · chart/ · slides/ · today-album/
├── users/                   제재, 차단 이메일, 탈퇴
├── profile/                 공개설정, 프로필 콘텐츠
├── favorites/
└── env.ts                   환경변수 검증 (없으면 throw)
```

### 도메인 폴더 안의 파일 네이밍

| 파일 패턴 | 어디서 쓰이나 | 예시 |
|-----------|---------------|------|
| `*-service.ts` | **서버 전용** 비즈니스 로직 | `review-service.ts` |
| `client-api.ts` | **브라우저**에서 `fetchJson` 호출 | `reviews/client-api.ts` |
| `types.ts` | DTO·유니온 타입 | `streaming/types.ts` |
| 설정 상수 | 라벨, 슬러그 | `community/board-config.ts` |

```
브라우저 컴포넌트  ──fetch──►  /api/reviews
        │                         │
        │  reviews/client-api.ts  │  reviews/review-service.ts
        │  (경로·타입 래퍼)        │  (DB 규칙)
```

**Why `client-api.ts`를 두나?**  
컴포넌트마다 `fetch("/api/reviews/...")`를 복붙하면 URL 오타가 납니다.  
래퍼 한곳에 모으면 “리뷰 조회”를 고칠 때 파일 하나만 보면 됩니다.

---

## 5. `src/components/` — UI 부품

```
src/components/
├── app/           사이트 공통: 헤더, 푸터, 홈 카드, 검색바
│                  TodayAlbumCard + today-album/ (탭·커버·소개글)
├── reviews/       리뷰 카드, 상세 앨범 카드, 평점 뱃지
├── interaction/   댓글, 좋아요, 신고 모달 (리뷰/글/플리 공통)
├── playlist/      커버, 트랙 리스트, 장르 선택, 생성 모달
├── profile/       아바타, 명반(마스터피스), 활동 폴더
├── album/         앨범 상세 패널, 트랙 리스트
├── admin/         관리자 화면 전용 UI
├── itunes/        앨범 고르기 모달
├── streaming/     Apple Music / Spotify 등 버튼
├── faq/
└── common/        에디터, 페이지네이션, 빈 상태, 로딩
```

**규칙:** `app/admin/*` 페이지는 화면 로직을 `src/components/admin/`에서 import합니다.  
페이지 파일은 가급적 **껍데기(RSC)** 로 두고, 클릭·입력은 `"use client"` 컴포넌트에 맡깁니다.

홈 **오늘의 앨범**은 `TodayAlbumCard` + `src/components/app/today-album/` (탭·커버·소개글)입니다.  
탭을 고르면 활성 탭만 흰색이 되고, 고르지 않은 탭은 Today / Yesterday / Previous 종이색을 유지합니다.  
크기·패딩은 `app/globals.css`의 `--today-album-*` 토큰을 따릅니다.

---

## 6. `src/hooks/` — 화면 상태 훅

이름은 모두 `use-kebab-case.ts` 파일이고, export는 `useCamelCase`입니다.

| 훅 | 하는 일 |
|----|---------|
| `use-today-albums` | 홈 오늘의 앨범 fetch |
| `use-featured-albums` | 슬라이드바 |
| `use-chart` | 차트 |
| `use-authenticated-fetch` | 401이면 로그인 페이지로 |
| `use-playlist-detail` / `*-mutations` | 플리 조회·트랙 추가 |
| `use-comment-compose` / `use-comment-edit` | 댓글 작성·수정 |
| `use-artist-autocomplete` | 검색창 디바운스 |
| `use-streaming-links` | 앨범/트랙 스트리밍 URL |
| `use-review-view-increment` | 상세 진입 시 조회수 +1 |

훅은 **UI를 그리지 않고** 데이터와 핸들러만 줍니다. 그리기는 컴포넌트 몫입니다.

---

## 7. 기타 폴더

| 경로 | 역할 |
|------|------|
| `scripts/` | `add-*.sql` + `run-*-migration.mjs`. TypeORM Migration 대신 **수동 SQL** |
| `public/` | `/icons`, `/genres`, `/streaming`, `/social` — URL이 곧 파일 경로 |
| `src/types/next-auth.d.ts` | `session.user.id`, `role`, `profileImage` 타입 확장 |

---

## 8. import 경로 (`@/`)

`tsconfig.json`의 `"@/*": ["./*"]`는 **프로젝트 루트**입니다.

```ts
import { createReview } from "@/src/lib/reviews/review-service";
import { ReviewWriteClient } from "./write-client"; // 같은 폴더만 상대경로
```

`src/`가 아니라 루트가 `@`이므로 `@/src/lib/...`가 맞습니다. `@/lib/...`는 없습니다.

---

## 9. 새 기능을 어디에 넣을까? (체크리스트)

예를 들어 “리뷰에 북마크”를 추가한다면:

```
1. DB 컬럼/테이블     → scripts/add-review-bookmarks.sql + run 스크립트
2. 엔티티             → src/lib/db/entities/  (+ data-source.ts entities 배열)
3. 업무 규칙          → src/lib/reviews/ 또는 src/lib/bookmarks/*-service.ts
4. HTTP               → app/api/reviews/[id]/bookmark/route.ts
5. 브라우저 래퍼      → src/lib/reviews/client-api.ts 에 함수 추가
6. UI                 → src/components/reviews/ 또는 interaction/
7. 페이지가 필요하면  → app/ 아래 page.tsx (가능하면 서버 컴포넌트)
```

레이어를 건너뛰어 `page.tsx`에서 TypeORM을 직접 쓰면, 나중에 API를 앱/외부에서 재사용하기 어려워집니다.
