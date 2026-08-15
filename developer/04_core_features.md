# 04. 주요 기능별 코드 딥다이브

> 서비스의 심장 세 가지: **앨범 리뷰**, **커뮤니티 게시판**, **플레이리스트**.  
> 각 절은 “왜 이 코드가 있는지” → “파일이 어떻게 이어지는지” → “초보자가 빠지는 함정” 순입니다.

---

## 기능 1. 앨범 리뷰

### Why 이 기능이 핵심인가

ORU의 정체성은 “곡이 아니라 **앨범**에 글을 남긴다”입니다.  
그래서 리뷰는 (1) iTunes 앨범 ID에 묶이고, (2) **같은 사람이 같은 앨범에 1개만** 쓸 수 있으며, (3) 0.0~10.0 평점을 가집니다.

### 관련 파일 지도

```
화면
  app/review/write/page.tsx          로그인 가드 + 에디터 로드
  app/review/write/write-client.tsx  폼, POST
  app/reviews/page.tsx               전체 목록
  app/review/[id]/page.tsx           상세 껍데기
  app/review/[id]/review-detail-client.tsx
  src/components/reviews/*           카드, 뱃지, 앨범 카드

API
  POST/GET  /api/reviews             작성 / 내 리뷰
  GET       /api/reviews/list        공개 피드 (캐시, data 래핑 예외)
  GET       /api/reviews/[id]
  GET       /api/reviews/check       이미 썼는지
  POST      /api/reviews/[id]/view   조회수

규칙
  src/lib/reviews/review-service.ts       상세·작성·수정·삭제
  src/lib/reviews/review-list-service.ts  정렬·검색·페이지
  src/lib/reviews/client-api.ts
  src/lib/db/entities/Review.ts
  src/lib/album-lookup.ts                 숫자 ID → iTunes 상세
```

### 작성 흐름 (코드가 지키는 규칙)

```
write-client
  albumId, title, artist, imageUrl  ← URL 쿼리에서 읽음
       │
       │  Editor HTML + rating(0~10)
       ▼
POST /api/reviews
       │
createReview()
  ① albumId·content·rating 필수
  ② rating 을 소수 1자리로 반올림, 범위 0~10
  ③ (userId, albumId) 기존 행 → 409 Conflict
  ④ albums 테이블에 없으면 INSERT (카테고리 기본 "I")
  ⑤ reviews INSERT, isApproved = "Y"
```

```ts
// src/lib/reviews/review-service.ts — createReview 핵심

// 같은 유저 + 같은 앨범이면 두 번째 리뷰 금지 (서비스의 핵심 불변조건)
const existingReview = await reviewRepository.findOne({
  where: { userId, albumId },
  select: ["id"],
});
if (existingReview) {
  throw new ServiceError("동일한 앨범에는 리뷰를 1개만 작성할 수 있습니다.", 409);
}

// 리뷰만 있고 앨범 행이 없으면 나중에 JOIN 이 깨짐 → 없으면 여기서 만든다
let album = await albumRepository.findOne({ where: { albumId } });
if (!album) {
  // body.albumTitle / albumArtist 는 작성 페이지가 쿼리로 넘겨 준 iTunes 메타
  const newAlbum = albumRepository.create({ albumId, title, artist, ... });
  await albumRepository.save(newAlbum);
}

const review = reviewRepository.create({
  id: randomUUID().replace(/-/g, "").slice(0, 255),
  albumId,
  userId,
  content,
  rating,
  isApproved: "Y", // 현재 작성 직후 공개. 관리자 거부는 별도 워크플로
  rejectReason: null,
});
```

작성 페이지가 409를 받으면 `router.back()` 합니다. “이미 쓴 앨범”을 다시 제출한 경우입니다.

```ts
// app/review/write/write-client.tsx
try {
  const data = await fetchJson("/api/reviews", { method: "POST", body: JSON.stringify({...}) });
  router.push(`/review/${encodeURIComponent(data.data.id)}`);
} catch (error) {
  if (error instanceof ApiClientError && error.status === 409) {
    router.back(); // 중복 — 새 에러 문구 대신 이전 화면
    return;
  }
  setErrorMessage(getApiErrorMessage(error, "리뷰 작성에 실패했습니다."));
}
```

### 목록과 상세

| 화면 | 데이터 소스 | 메모 |
|------|-------------|------|
| `/reviews` | `GET /api/reviews/list?sort=&page=&q=` | 최신/좋아요/댓글 수 정렬. 페이지 크기 6 |
| `/review/[id]` | 클라이언트가 `fetchReviewDetail` | 앨범 카드 + 본문 + 댓글/좋아요 |
| `/review/album/[albumId]` | 앨범 단위 리뷰들 | 검색에서 “이 앨범 리뷰 보기” |

상세의 “다음 리뷰”는 **시간상 바로 이전(더 오래된) 승인 리뷰**입니다. 피드의 스크롤을 글 단위로 이어 주는 장치입니다.

### 조회수

`use-review-view-increment`가 상세 마운트 시 `POST /api/reviews/[id]/view`를 한 번 호출합니다.  
새로고침할 때마다 오를 수 있으므로, 서비스 쪽에서 스킵 로직이 있으면 응답에 `skipped: true`가 올 수 있습니다.

### 초보자가 헷갈리기 쉬운 부분

1. **`/review` vs `/reviews` vs `/api/reviews`**  
   페이지 상세는 단수, 목록 페이지와 API는 복수. 새 API를 `/api/review`에 만들지 마세요.

2. **`isApproved`가 `"Y"`/`"N"` 문자열**  
   `true`/`false`가 아닙니다. 관리자 UI(`src/components/admin/reviews`)가 거부 사유(`rejectReason`)를 붙입니다.  
   **현재 `createReview`는 바로 `"Y"`로 넣습니다.** 목록 쿼리(`review-list-service`)도 `isApproved` 필터 없이 전체를 가져옵니다. “승인 대기만 공개”로 바꾸려면 서비스와 목록 쿼리를 함께 고쳐야 합니다.

3. **앨범 ID는 우리 DB의 자체 시퀀스가 아님**  
   대개 iTunes `collectionId` 숫자 문자열. `getAlbumById`는 `/^\d+$/`가 아니면 iTunes 조회를 포기하고 `null`입니다.

4. **평점 색**  
   `globals.css` — 9 이상 빨강, 6 이상 주황, 3 이상 노랑, 그 아래 청록. `formatRating` / `review-rating-badge`가 표시를 담당.

5. **목록 API 응답 모양**  
   `fetchReviewList`는 `data.reviews`가 아니라 **루트 `reviews`** 를 기대합니다. `fetchJson` 제네릭과 실제 JSON을 같이 보세요.

---

## 기능 2. 커뮤니티 게시판

### Why

리뷰가 “한 앨범에 대한 평론”이라면, 게시판은 **주제별 광장**입니다.  
국내/해외 음악 이야기, LP 장터, 창작 워크룸, 운영 공지가 한 `posts` 테이블에 카테고리로 구분됩니다.

### 카테고리 코드표

| URL 슬러그 (`/boards/...`) | DB `category` | 누가 쓰나 |
|----------------------------|---------------|-----------|
| `domestic` | `K` | 로그인 유저 |
| `overseas` | `I` | 로그인 유저 |
| `market` | `M` | 로그인 유저 |
| `workroom` | `W` | 로그인 유저 |
| `notice` | `N` | **관리자만** (`adminOnlyWrite`) |

설정이 **두 곳**에 있습니다.

- 페이지용: `app/boards/[board]/board-config.ts` (제목, 설명, 쓰기 권한)
- 라벨용: `src/lib/community/board-config.ts` (`BOARD_CATEGORY_LABEL`)

슬러그를 추가할 때는 둘 다, 그리고 `src/lib/navigation/nav-config.ts`의 `BOARD_LINKS`를 맞추세요.

### 파일 지도

```
app/boards/[board]/page.tsx          RSC: listBoardPosts 직접 호출
app/community/write/page.tsx         글쓰기
app/community/[id]/page.tsx          상세
src/lib/community/community-post-service.ts   CRUD
src/lib/community/board-post-service.ts       목록+고정글
src/lib/community/client-api.ts
src/lib/db/entities/Post.ts
```

### 목록이 서버에서 바로 DB를 치는 이유

게시판은 검색 쿼리(`?q=&page=`)가 URL에 있고, HTML에 글 제목이 들어가야 검색엔진과 공유에 유리합니다.  
그래서 `BoardPage`는 API를 경유하지 않고 `listBoardPosts`를 import합니다.

```
listBoardPosts
  WHERE category = K  OR  is_global = 'Y'
       │
       ├─ 일반 글: 최신순 페이지 (15개)
       └─ 핀: is_global, RELEASE_NOTE 등은 테이블 상단
```

`is_global = "Y"` 인 글은 **다른 게시판에도 같이 보입니다.**  
관리자가 “전체 공지처럼 붙이고 싶을 때” 쓰는 깃발입니다.

### 작성 시 관리자 전용 옵션

`createCommunityPost` (`community-post-service.ts`):

- 일반 유저가 `category: "N"`을 내면 **403**.
- 관리자 `isRelease: true` + 국내/해외 글 → **반대편 게시판에 미러 글**을 트랜잭션으로 한 번 더 INSERT (`noticeCategory: RELEASE_NOTE`).  
  “발매 소식을 국내·해외에 동시에 올린다”는 운영 요구입니다.

```ts
const createdPostId = await dataSource.transaction(async (manager) => {
  await postRepository.save(post);
  if (isRelease) {
    const mirroredCategory = category === "K" ? "I" : "K";
    await postRepository.save(mirroredPost); // 다른 id, 같은 제목/본문
  }
  return post.id;
});
```

**Why 트랜잭션?**  
한쪽만 성공하고 다른쪽이 실패하면 “국내에만 발매 공지가 있는” 상태가 됩니다. 둘 다 되거나 둘 다 안 되거나.

### 댓글·좋아요·신고 (공통 인프라)

게시글 상세는 리뷰 상세와 **같은** `CommentSection`, `InteractionButtons`를 씁니다.

```
Comment.  postId | reviewId | playlistId  중 하나
Like.     동일 + commentId (댓글 좋아요일 때)
Report.   postId | reviewId
```

```
POST /api/comments          requireWritableSessionApi
GET  /api/comments?postId=
POST /api/actions/like      { postId }
POST /api/actions/report    { postId, reason }
```

대댓글 제한:

```ts
if (parent.parentId) {
  throw new ServiceError("대댓글에는 답글을 달 수 없습니다.", 400);
}
```

트리는 깊이가 2 (본댓글 → 답글)만 있어서 UI가 단순합니다.

### 초보자가 헷갈리기 쉬운 부분

1. **글쓰기는 `/community/write`, 목록은 `/boards/...`**  
   상세만 `/community/[id]`. 게시판 목록 URL과 글 URL 접두어가 다릅니다.

2. **수정은 별도 페이지가 아니라 `?edit=postId`**  
   `communityEdit()` 헬퍼가 `/community/write?edit=` 를 만듭니다.

3. **`nickname`이 Post에 비정규화되어 있음**  
   작성 시점의 닉네임을 컬럼에 저장합니다. 나중에 닉네임을 바꿔도 **옛 글 작성자 표시는 남을 수 있습니다.** JOIN만 믿으면 안 됩니다.

4. **공지 작성 버튼**  
   비관리자에게는 `writeHref`가 `#`이거나 숨겨집니다. API만 막힌 줄 알고 UI를 열면 403이 납니다.

---

## 기능 3. 플레이리스트

### Why

글(리뷰/게시글)이 부담스러울 때, **곡을 줄 세워 취향을 보여 주는** 기능입니다.  
트랙 메타는 우리 서버가 오디오 파일을 보관하지 않고, iTunes에서 받은 이름·아트워크·미리듣기 URL을 행으로 저장합니다.

### 데이터 모양

```
playlists
  id, user_id, title, description
  is_public  "Y" | "N"
  cover_image_url     ← 커스텀이면 R2, 자동이면 mzstatic(iTunes) URL

playlist_tracks
  track_id, track_name, artist_name, artwork_url_100, preview_url, position …

playlist_genres  ──  genres     (N:N)
```

```
소유자
  GET/POST /api/playlists              내 목록 / 생성
  GET/PATCH/DELETE /api/playlists/[id]
  POST /api/playlists/[id]/tracks
  POST /api/playlists/cover-upload     sharp → R2

공개
  GET /api/playlists/list              /playlist 페이지
  GET /api/playlists/[id]              공개이거나 본인만
  GET /api/users/[userId]/playlists    타인 프로필 (공개설정 준수)
```

### 생성·트랙 추가 흐름

```
CreatePlaylistModal
  → POST /api/playlists { title, isPublic, genreIds }
  → playlist-service.createPlaylist
       genreIds 검증 (assertValidGenreIds)
       INSERT playlists + playlist_genres

AddTrack 모달 (앨범에서 고르기 / 검색)
  → POST /api/playlists/[id]/tracks
  → playlist-track-service
       소유자인지 확인
       position 맨 끝 + 1
```

커버 두 종류:

| 종류 | 저장 값 | Why |
|------|---------|-----|
| 자동 | 트랙/앨범의 iTunes 이미지 URL | 업로드 비용 0. URL만 DB에 |
| 커스텀 | `uploadPlaylistCoverImage` → R2 WebP | 유저가 자른 대표 이미지 |

`src/lib/storage/media.ts`는 긴 변 400px, quality 85 WebP로 맞춥니다. **원본 PNG를 그대로 올리지 않습니다.**

### 공개/비공개와 프로필 프라이버시

겹치는 스위치가 두 개입니다.

1. **플레이리스트 `isPublic`** — 이 플리 자체
2. **유저 `showPlaylistsPublic`** — 프로필에서 플리 섹션을 보여줄지

타인 `/users/[id]/playlists`는 둘 다 통과해야 목록이 열립니다.  
“플리만 공개, 프로필 섹션은 비공개” 같은 조합이 가능해서 QA 때 자주 헷갈립니다.

### 초보자가 헷갈리기 쉬운 부분

1. **`/playlist` (공개 탐색) vs `/profile/playlists` (내 보관함)**  
   관리·삭제는 프로필 쪽 화면을 쓰는 경우가 많습니다.

2. **트랙 PK와 iTunes trackId**  
   `playlist_tracks.id`는 우리 UUID, `track_id`는 외부 ID. 둘을 같은 변수명으로 넘기면 삭제 API가 404가 납니다.  
   삭제: `/api/playlists/[id]/tracks/[trackId]` 의 `trackId`가 어느 쪽인지 라우트 구현을 확인하세요.

3. **좋아요/댓글은 리뷰와 동일 테이블**  
   `likes.playlist_id`, `comments.playlist_id`. UI는 `playlist-engagement-counts`.

4. **장르 필터 “전체” 이미지**  
   `public/genres/*.png` + `genre-covers.ts`. DB 장르 시드는 `npm run db:seed:genres`.

---

## 보너스: 세 기능이 공유하는 “인터랙션 키트”

리뷰·게시글·플리를 고칠 때 아래를 먼저 보세요. 버튼이 세 배로 늘어나지 않은 이유입니다.

```
src/components/interaction/
  CommentSection.tsx      목록+작성 폼
  InteractionButtons.tsx  좋아요/댓글/신고
  ReportModal.tsx

src/lib/engagement/content-like-service.ts
src/lib/engagement/report-service.ts
src/lib/comments/comment-service.ts
```

새 콘텐츠 타입(예: “매거진”)을 추가한다면:

1. `comments` / `likes` / `reports`에 nullable FK 컬럼 + 마이그레이션  
2. `resolveContentLikeTarget`에 필드 하나 추가 (**정확히 1개** 규칙 유지)  
3. `CommentSection`에 `magazineId` prop  
4. 전용 페이지에서 기존 섹션을 재사용  

비즈니스 규칙(중복 리뷰, 게시판 카테고리, 플리 소유권)만 각 `*-service.ts`에 남깁니다.

---

## 파일 → 책임 치트시트

| 궁금한 것 | 열어볼 파일 |
|-----------|-------------|
| 리뷰 중복이 어디서 막히나 | `src/lib/reviews/review-service.ts` → `createReview` |
| 게시판 핀/공지 조건 | `src/lib/community/board-post-service.ts` |
| 로그인해야 하는 API인가 | `src/lib/auth/session.ts` |
| JSON 응답 형식 | `src/lib/http/response.ts`, `client.ts` |
| 헤더 메뉴 항목 | `src/lib/navigation/nav-config.ts` |
| 경로 문자열 | `src/lib/navigation/routes.ts` |
| 이미지 업로드 | `src/lib/storage/media.ts` |
| 오늘의 앨범 날짜(KST) | `app/api/today-album/route.ts` |
| 오늘의 앨범 UI 토큰 | `app/globals.css` (`--today-album-*`), `src/components/app/TodayAlbumCard.tsx` |
| 내부 가이드 비밀번호 | `middleware.ts`, `src/lib/guides/gate.ts` |
| 관리자 진입 | `app/admin/layout.tsx` → `requireAdminPage()` |
