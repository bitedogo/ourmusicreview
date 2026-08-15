# 03. 핵심 데이터 흐름 및 라이프사이클

> **한 줄 요약:** 사용자의 클릭은 두 갈래로 갑니다.  
> (A) 서버가 페이지를 미리 그려서 보내거나, (B) 브라우저가 `/api`를 다시 부릅니다.  
> 어느 쪽이든 **가드 → 서비스 → DB → JSON/HTML** 순서는 같습니다.

---

## 1. 큰 그림: 요청이 살아 있는 동안

```
  [사용자]  링크 클릭 / 새로고침 / 버튼
      │
      ▼
  ┌─────────────────────────────────────┐
  │ Next.js 서버 (Vercel 또는 localhost) │
  │                                     │
  │  페이지인가?  ──yes──► page.tsx     │
  │       │                (RSC 가능)   │
  │       no                            │
  │       ▼                             │
  │  /api/* 인가? ──yes──► route.ts     │
  │                        GET/POST     │
  └──────────────┬──────────────────────┘
                 │
                 ▼
         initializeDatabase()
                 │
                 ▼
         PostgreSQL (TypeORM)
```

**RSC(React Server Component)** 는 “브라우저에 JS 번들을 안 내리고, 서버에서 HTML에 가까운 결과를 만드는 컴포넌트”입니다.  
식당으로 치면 **주방에서 접시를 완성해서 내는 것**이고, 클라이언트 컴포넌트는 **손님 앞에서 불을 붙이는 요리**입니다.

파일 맨 위 `"use client"`가 있으면 클라이언트, 없으면 기본은 서버입니다.

---

## 2. 흐름 A — 서버가 데이터를 가져와서 그리는 페이지

대표: **게시판 목록** `app/boards/[board]/page.tsx`

로그인 여부만 세션에서 읽고, 글 목록은 **서버에서 DB를 바로** 조회합니다. 브라우저가 `/api/community`를 한 번 더 치지 않습니다.

```
사용자: /boards/domestic 입력
        │
        ▼
┌─ BoardPage (서버 컴포넌트, async function) ─┐
│  1. params.board → BOARD_CONFIG 에서 카테고리 K │
│  2. getServerSession(authOptions)  → 로그인?   │
│  3. initializeDatabase()                       │
│  4. listBoardPosts(dataSource, { category })   │
│  5. <BoardPostTable posts={...} /> 렌더        │
└────────────────────────────────────────────────┘
        │
        ▼
   HTML이 브라우저에 도착 (이미 글 목록이 들어 있음)
```

핵심 코드가 하는 일:

```ts
// app/boards/[board]/page.tsx (발췌, 설명용 주석)

// Next.js 16: params / searchParams 가 Promise
const { board } = await props.params;

const config = BOARD_CONFIG[board]; // domestic → category "K"
if (!config) notFound();            // 없는 게시판이면 404

const session = await getServerSession(authOptions);
const dataSource = await initializeDatabase(); // DB 연결 (싱글톤)

const list = await listBoardPosts(dataSource, {
  category: config.category, // 실제 SELECT 는 service 안에서
  page,
  pageSize: PAGE_SIZE_BOARD,
  searchField,
  searchQuery,
});
```

**Why 게시판은 서버에서 가져오나?**  
목록은 SEO와 첫 페인트가 중요하고, 인터랙션(검색 폼 정도)이 적습니다.  
서버에서 그리면 로딩 스피너 없이 “글이 있는 HTML”이 바로 옵니다.

---

## 3. 흐름 B — 페이지는 껍데기, 데이터가 클라이언트로 fetch

대표: **홈의 오늘의 앨범**, **리뷰 목록**, **리뷰 상세**

홈 `app/page.tsx`는 서버 컴포넌트이지만, `TodayAlbumCard` 등은 `dynamic()`으로 클라이언트에서 불러옵니다.

```
사용자: / 접속
        │
        ▼
  Home (RSC) 가 레이아웃만 렌더
        │
        ▼
  TodayAlbumCard ("use client")
        │  useTodayAlbums()
        │  useEffect → fetchJson("/api/today-album")
        ▼
  GET /api/today-album/route.ts
        │  KST 오늘/어제/그저께 날짜 계산
        │  TodayAlbum 테이블 findOne × 3
        ▼
  { ok: true, albums: { today, yesterday, previous } }
        │
        ▼
  setAlbums(...) → 카드 다시 그림
```

훅의 뼈대:

```ts
// src/hooks/use-today-albums.ts (설명용)

export function useTodayAlbums() {
  const [albums, setAlbums] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false; // 언마운트 후 setState 방지 (경주 조건)

    async function fetchAlbums() {
      try {
        const data = await fetchJson("/api/today-album");
        if (!isCancelled && data.ok) setAlbums(data.albums);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchAlbums();
    return () => { isCancelled = true; }; // cleanup
  }, []);

  return { albums, isLoading, ... };
}
```

**Why 홈은 fetch를 쓰나?**  
카드 컴포넌트가 클라이언트(탭 전환, 이미지 에러)라서, 데이터를 훅 상태로 두는 편이 자연스럽습니다.  
공개 목록 API는 `publicCachedJson`으로 CDN 캐시(수십 초)를 걸어 반복 조회 비용을 줄입니다.

---

## 4. 쓰기 흐름: 리뷰 작성 (클릭 → DB → 리다이렉트)

가장 중요한 **생성(Create)** 파이프라인입니다.

```
[검색] /search?artistId=...
   │  앨범 카드에서 “리뷰 쓰기”
   ▼
[작성 페이지] /review/write?albumId=&title=&artist=&imageUrl=
   │  서버: 세션 없으면 /auth/signin 으로 redirect
   │  클라: Toast UI Editor + 평점 state
   │  Submit → fetchJson POST /api/reviews
   ▼
[API] requireWritableSessionApi()     ← 로그인? 정지 계정?
   │  createReview(dataSource, userId, body)
   │    ├─ 같은 user+album 리뷰 있으면 409
   │    ├─ albums 행이 없으면 iTunes 메타로 INSERT
   │    └─ reviews INSERT (isApproved: "Y")
   ▼
[응답] { ok: true, data: { id } }
   │  router.push(`/review/${id}`)
   ▼
[상세] /review/[id]
```

API 계약 (`src/lib/http/response.ts`):

```
성공  { "ok": true,  "data": { ... }, "message": "선택" }
실패  { "ok": false, "error": "사용자에게 보여줄 문구" }
```

브라우저 `fetchJson`은 `ok !== true`이면 **예외를 던집니다.** 그래서 컴포넌트는 try/catch만 하면 됩니다.

```ts
// src/lib/http/client.ts (핵심만)

export async function fetchJson(input, init) {
  const response = await fetch(input, init);
  const payload = await response.json();

  if (!response.ok || !payload?.ok) {
    throw new ApiClientError(
      payload?.error ?? `요청에 실패했습니다. (status: ${response.status})`,
      response.status,
      payload
    );
  }
  return payload; // 여기서부터는 ok: true 가 보장됨
}
```

**예외:** `/api/reviews/list`, `/api/today-album` 같은 공개 목록은 캐시를 위해 `{ ok: true, reviews, page }`처럼 **필드를 루트에 펼칩니다.** `data` 래핑이 아닙니다. 신규 API는 `data` 래핑이 기본입니다.

---

## 5. 인증 라이프사이클 (출입증)

세션은 **DB 세션 테이블이 아니라 JWT 쿠키**입니다.  
비유: 클럽 스탬프를 손목에 찍어 두고, 문을 열 때마다 스탬프만 확인합니다.

```
┌──────────── 로그인 ────────────┐
│ POST /api/auth/callback/credentials
│   credentials.authorize()
│     User 조회 → bcrypt 검증
│     이메일 미인증이면 Error("EMAIL_NOT_VERIFIED")
│     정지면 Error("ACCOUNT_SUSPENDED:...")
│   jwt callback → token.id, role, profileImage
│   session callback → session.user 에 복사
│   Set-Cookie: next-auth.session-token (httpOnly)
└────────────────────────────────┘
                 │
                 ▼
이후 모든 서버 코드
   getServerSession(authOptions)  또는  getAppSession()
                 │
        ┌────────┴────────┐
        ▼                 ▼
  page.tsx 가드      route.ts 가드
  requireAuthPage    requireSessionApi
  requireAdminPage   requireWritableSessionApi
                     requireAdminApi
```

가드 역할 (`src/lib/auth/session.ts`):

| 헬퍼 | 실패 시 | 쓰는 곳 |
|------|---------|---------|
| `requireAuthPage(path)` | `/auth/signin?callbackUrl=` 로 **리다이렉트** | 리뷰 작성 페이지 |
| `requireAdminPage()` | 미로그인→로그인, 일반유저→`/` | `app/admin/layout.tsx` |
| `requireSessionApi()` | JSON 401 | 내 리뷰 목록 GET 등 |
| `requireWritableSessionApi()` | 401 또는 정지 시 403 | 리뷰·댓글·게시글 **쓰기** |
| `requireAdminApi()` | JSON 403 | `/api/admin/*` |

```ts
// 쓰기 API의 첫 네 줄 패턴
const { session, response } = await requireWritableSessionApi();
if (response) return response; // 이미 apiError Response
// 이후 session.user.id 사용
```

클라이언트에서 세션이 필요하면 `useSession()` (NextAuth).  
루트 `app/providers.tsx`가 `SessionProvider`로 감싸고 있습니다.

```
RootLayout
  └── Providers          ← "use client", SessionProvider
        ├── Header       (로그인 시 닉네임/메뉴)
        ├── {children}   각 페이지
        └── Footer
```

---

## 6. 상태 관리 — “데이터가 어디에 살까”

이 프로젝트는 **전역 스토어가 없습니다.** 위치가 곧 수명입니다.

```
┌──────────────────────────────────────────────┐
│ 서버 메모리 (요청이 끝나면 사라짐)            │
│   page.tsx 의 const list = await ...         │
│   → HTML에 구워져서 내려감                    │
├──────────────────────────────────────────────┤
│ JWT 쿠키 (브라우저가 자동으로 첨부)           │
│   id, role, nickname, profileImage           │
│   → useSession() / getServerSession()        │
├──────────────────────────────────────────────┤
│ 컴포넌트 useState (탭을 닫으면 사라짐)         │
│   폼 입력, 모달 open, 목록 fetch 결과         │
├──────────────────────────────────────────────┤
│ PostgreSQL (진짜 소스 오브 트루스)            │
│   리뷰, 댓글, 플리 … 새로고침해도 남음         │
└──────────────────────────────────────────────┘
```

### props로 내리는 경우 vs fetch하는 경우

| 방식 | 언제 | 예 |
|------|------|----|
| 서버에서 조회 → props | SEO·첫 화면, 인터랙션 적음 | 게시판 목록 |
| 클라이언트 fetch → useState | 탭, 모달, 로그인 후 개인화 | 오늘의 앨범, 리뷰 피드 |
| URL searchParams | 공유 가능한 필터 | `?page=2&q=아이유&sort=likes` |

**Why URL에 검색어를 넣나?**  
새로고침·공유 링크가 같은 목록을 보여 줍니다. 상태만 `useState`에 있으면 링크를 보내도 첫 페이지로 돌아갑니다.

### 댓글 트리 상태

댓글은 부모-자식이라 배열을 직접 바꾸기 어렵습니다.  
`src/lib/comments/comment-tree.ts`가 **불변 업데이트** 헬퍼를 제공합니다 (좋아요를 누르면 해당 노드만 새 객체로 교체).

```
listComments API
   → 평평한 행 (parent_id 포함)
   → buildCommentTree()
   → [ { id, replies: [ { id, replies: [] } ] } ]
   → CommentSection 의 useState
```

대댓글은 **1단만** 허용합니다 (`parent.parentId`가 있으면 400).

---

## 7. DB 연결 라이프사이클

```ts
// src/lib/db/index.ts
let isInitialized = false;

export async function initializeDatabase() {
  getServerEnv(); // DATABASE_URL 등 없으면 여기서 죽음

  if (!isInitialized) {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize(); // 실제 TCP 연결
    }
    isInitialized = true;
  }
  return AppDataSource;
}
```

**Why 싱글톤인가?**  
서버리스에서 요청마다 `new DataSource()`를 만들면 연결이 폭발합니다.  
모듈 변수 `isInitialized`로 “이미 붙었으면 재사용”합니다.

`synchronize: false` — 엔티티를 고친다고 테이블이 자동 변경되지 않습니다.  
스키마 변경은 `scripts/` 마이그레이션으로만 (→ [05_getting_started.md](./05_getting_started.md)).

---

## 8. 에러가 화면까지 오는 길

```
service 에서  throw new ServiceError("리뷰를 찾을 수 없습니다.", 404)
        │
        ▼
route catch → handleRouteError(error, "fallback 500 문구")
        │  ServiceError 이면 status/message 유지
        │  그 외 Error 는 500 + fallback (프로덕션에선 스택 숨김)
        ▼
{ ok: false, error: "리뷰를 찾을 수 없습니다." }  + HTTP 404
        │
        ▼
fetchJson 이 ApiClientError 를 throw
        │
        ▼
컴포넌트 catch → setErrorMessage(...) 또는 router.push(로그인)
```

`useAuthenticatedFetch`는 status 401이면 로그인 페이지로 보냅니다.  
권한 없음(403)과 없음(404)을 같은 “실패”로 뭉개지 않는 것이 중요합니다.

---

## 9. 캐시가 끼어드는 지점

| 종류 | 어디서 | 효과 |
|------|--------|------|
| `publicCachedJson(body, maxAge, swr)` | 공개 GET API | CDN/브라우저가 잠깐 재사용. 오늘의 앨범 60초 등 |
| `noStoreJson` / `apiOk` | 개인·쓰기 응답 | 캐시 금지 |
| Next.js `dynamic()` | 홈 무거운 카드 | 초기 JS를 나중으로 미룸 |
| R2 `Cache-Control: max-age=31536000` | 이미지 URL | 파일명이 유니크해서 1년 캐시 가능 |
| `next.config` `images.minimumCacheTTL` | next/image | Vercel 이미지 최적화 캐시 |

공개 피드가 “방금 쓴 글이 안 보여요”라면, 캐시 TTL을 의심하세요.

---

## 10. 한 장으로 정리: “좋아요” 버튼

리뷰·게시글·플레이리스트가 **같은** `/api/actions/like`를 씁니다.

```
클릭 하트
  → POST /api/actions/like  { reviewId }  (또는 postId / playlistId 중 하나)
  → requireSessionApi()
  → resolveContentLikeTarget()  // 세 개 중 정확히 1개인지 검사
  → toggleContentLike()
       이미 likes 행 있음 → DELETE → { liked: false }
       없음             → INSERT → { liked: true }
  → 클라이언트 setState 로 하트 색·카운트 갱신
```

댓글 좋아요는 엔드포인트가 다릅니다: `/api/comments/like`.  
`likes` 테이블은 `comment_id`와 `review_id` 등을 nullable로 두고, “이 행이 무엇을 가리키는지”로 종류를 구분합니다. (다형성 — 한 서랍에 여러 종류의 쪽지를 넣는 것과 비슷합니다.)
