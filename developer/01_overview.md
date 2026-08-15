# 01. 프로젝트 개요 & 기술 스택

> **한 줄 요약:** ORU는 “앨범 단위로 음악을 기록하고, 그 기록을 사람들과 나누는” 웹 서비스입니다.  
> Next.js(프론트+백엔드 한 지붕) + PostgreSQL + NextAuth 조합으로 동작합니다.

---

## 1. 이 서비스는 무엇을 하나요?

ORU(오루)는 싱글 한 곡이 아니라 **앨범 전체**를 듣고 평점·글을 남기는 공간입니다.  
비유하면, 영화 한 장면이 아니라 **영화 한 편**에 별점을 매기는 것과 같습니다.

공식 사이트: [https://www.comeonoru.com](https://www.comeonoru.com)

### 핵심 기능 (사용자 관점)

| 기능 | 하는 일 | 왜 중요한가 |
|------|---------|-------------|
| **앨범 리뷰** | 0.0~10.0점 + 본문 작성, 목록·상세 조회 | 서비스의 심장. “이 앨범을 어떻게 들었는가”를 남긴다 |
| **아티스트 검색** | iTunes API로 아티스트·앨범 찾기 | 리뷰를 쓰려면 먼저 앨범을 골라야 한다 |
| **커뮤니티** | 국내/해외/장터/워크룸/공지 게시판 | 리뷰 바깥의 담론·거래·창작 피드백 |
| **플레이리스트** | 트랙을 모아 공개/비공개로 공유 | 글이 아닌 “곡의 나열”로 취향을 표현 |
| **홈 큐레이션** | 슬라이드바, 오늘의 앨범, 차트 | 방문자가 바로 음악을 발견하게 한다 |
| **마이페이지** | 프로필, 명반(슬라이드), 즐겨찾기, 공개설정 | “나”와 “타인 프로필”이 URL로 분리된다 |
| **관리자** | 리뷰·멤버·신고·오늘의 앨범·FAQ | 운영자가 콘텐츠와 계정을 관리한다 |

### 핵심 기능 (시스템 관점)

```
  사용자 브라우저
        │
        ▼
  Next.js (페이지 + API가 같은 프로젝트)
        │
        ├── PostgreSQL (Supabase)  ← 회원, 리뷰, 게시글, 플레이리스트 …
        ├── Cloudflare R2          ← 프로필/커버 이미지
        ├── iTunes Search API      ← 앨범·아티스트 메타데이터
        ├── Spotify API (선택)     ← 스트리밍 링크 보조
        └── Resend                 ← 인증메일, 비밀번호 찾기
```

---

## 2. 기술 스택 — “왜 이걸 골랐나”

스택을 외우기보다 **역할을 식당에 비유**하면 기억하기 쉽습니다.

```
┌─────────────────────────────────────────────────────────┐
│  손님 (브라우저)                                          │
│    React 19 화면 + Tailwind CSS 옷차림                    │
├─────────────────────────────────────────────────────────┤
│  홀 + 주방 (Next.js 16 App Router)                       │
│    page.tsx = 홀 서빙                                     │
│    app/api/**/route.ts = 주문서 창구                      │
├─────────────────────────────────────────────────────────┤
│  레시피 책 (src/lib/<도메인>/*-service.ts)                │
│    “리뷰는 앨범당 1개” 같은 규칙을 여기서 지킨다            │
├─────────────────────────────────────────────────────────┤
│  창고 (PostgreSQL + TypeORM)                              │
│    엔티티 = 선반 라벨, DataSource = 창고 열쇠              │
├─────────────────────────────────────────────────────────┤
│  출입증 (NextAuth JWT)                                    │
│    쿠키에 담긴 토큰으로 “누구인지”를 확인                   │
└─────────────────────────────────────────────────────────┘
```

### 2.1 프론트엔드

| 기술 | 버전대 | 역할 | 선택한 이유 (Why) |
|------|--------|------|-------------------|
| **Next.js** | 16 (App Router) | 페이지 라우팅, SSR/RSC, API | 프론트와 백엔드를 **한 레포**에서 운영. Vercel 배포와 궁합이 좋음 |
| **React** | 19 | UI 컴포넌트 | Next.js의 기본 UI 엔진. 서버 컴포넌트(RSC)와 클라이언트 컴포넌트를 섞어 씀 |
| **TypeScript** | 5 | 타입 안전성 | `userId`와 `albumId`를 헷갈리지 않게. 리뷰/게시글처럼 비슷한 엔티티가 많음 |
| **Tailwind CSS** | 4 | 스타일 | 디자인 토큰(`--color-brand-primary` 등)을 CSS 변수로 두고 클래스에서 참조 |
| **Toast UI Editor** | 3 | 리뷰·게시글 본문 | 마크다운/위지윅. HTML로 저장하고 화면에서 렌더 |
| **Headless UI** | 2 | 모달·접근성 | 직접 모달을 짜지 않고 키보드/포커스를 맡김 |
| **next/font (Pretendard)** | local | 한글 본문 폰트 | 외부 CDN 없이 `src/lib/fonts`에서 로드 |

**왜 Redux/Zustand가 없나요?**  
전역 상태가 많지 않습니다. “지금 로그인한 사람”은 NextAuth `SessionProvider`가 들고, 목록·폼은 각 페이지의 `useState`/`useEffect`로 충분합니다. 무거운 전역 스토어를 넣으면 배보다 배꼽이 커집니다.

### 2.2 백엔드 (같은 Next.js 안)

| 기술 | 역할 | 선택한 이유 (Why) |
|------|------|-------------------|
| **Route Handlers** (`app/api/**/route.ts`) | HTTP 창구 | 별도 Express 서버 없이 `GET`/`POST` 파일을 두면 API가 됨 |
| **TypeORM** | ORM (객체 ↔ DB 행) | 엔티티 클래스로 테이블을 표현. `synchronize: false`로 **자동 스키마 변경을 끔** (실수로 컬럼이 날아가는 사고 방지) |
| **pg** | PostgreSQL 드라이버 | TypeORM이 실제로 DB에 말할 때 사용 |
| **Service 계층** (`*-service.ts`) | 비즈니스 규칙 | 라우트는 얇게, “앨범당 리뷰 1개” 같은 규칙은 서비스에 |

### 2.3 데이터베이스 & 저장소

| 기술 | 역할 | 선택한 이유 (Why) |
|------|------|-------------------|
| **PostgreSQL (Supabase)** | 메인 DB | 관계형 데이터가 많음 (유저–리뷰–앨범, 댓글 트리). Supabase가 호스팅·대시보드를 제공 |
| **Cloudflare R2** | 이미지 파일 | 프로필·플레이리스트 커버. S3 호환이라 `@aws-sdk/client-s3`로 업로드 |
| **sharp** | 이미지 압축 | 업로드 전 400px WebP로 줄여 트래픽·용량을 아낌 |
| **Supabase JS** | Auth 보조 클라이언트 | 미디어는 R2로 이전됨. `@supabase/supabase-js`는 레거시 Auth 연동용으로 남아 있음 |

### 2.4 인증·메일

| 기술 | 역할 | 선택한 이유 (Why) |
|------|------|-------------------|
| **NextAuth.js** | 로그인 세션 | Credentials(아이디/비번) + Google OAuth를 한 설정(`authOptions`)에서 처리 |
| **JWT 세션** | 서버에 세션 테이블을 안 둠 | 쿠키에 서명된 토큰. 서버리스(Vercel)와 잘 맞음 |
| **bcryptjs** | 비밀번호 해시 | DB에 평문 비밀번호를 저장하지 않음 |
| **Resend** | 이메일 | 회원가입 OTP, 아이디 찾기, 비밀번호 재설정 |

### 2.5 외부 음악 API

| 기술 | 역할 | 선택한 이유 (Why) |
|------|------|-------------------|
| **iTunes Search API** | 아티스트 검색, 앨범/트랙 메타, 커버 URL | 키 없이 호출 가능. `albumId`는 보통 iTunes `collectionId`(숫자) |
| **Spotify Web API** | 앨범/트랙 매칭, 스트리밍 링크 보조 | env가 없으면 조용히 건너뜀 (`null` 반환) |
| **기타 스트리밍** | Apple Music, YouTube Music, Deezer 링크 | `src/lib/streaming`에서 플랫폼별 URL을 모음 |

### 2.6 배포·품질

| 기술 | 역할 |
|------|------|
| **Vercel** (`icn1` 서울 리전) | 빌드·호스팅. `vercel.json`에서 API `maxDuration: 30초` |
| **ESLint + `tsc --noEmit`** | 린트·타입 검사. 배포 전 `npm run build`에 타입 검사가 포함됨 |
| **patch-package** | 의존성 패치를 `postinstall`에 적용 |

---

## 3. 한 장의 아키텍처

```
                    ┌──────────────┐
                    │   Vercel     │
                    │  (Next.js)   │
                    └──────┬───────┘
           ┌───────────────┼───────────────┐
           │               │               │
     ┌─────▼─────┐  ┌──────▼──────┐  ┌─────▼──────┐
     │ PostgreSQL│  │ Cloudflare  │  │  iTunes /  │
     │ (Supabase)│  │     R2      │  │  Spotify   │
     └───────────┘  └─────────────┘  └────────────┘
           ▲
           │ TypeORM (synchronize: false)
           │
     src/lib/db/entities/*   ← 테이블 설계도
     src/lib/<domain>/*-service.ts  ← 업무 규칙
     app/api/**/route.ts     ← HTTP만 담당
```

**Why 레이어를 나누나?**  
주방에 주문서(route)와 레시피(service)를 섞으면, “로그인 체크”와 “리뷰 중복 검사”가 한 파일에 뒤섞입니다.  
라우트는 **문지기**, 서비스는 **요리사**, 엔티티는 **재료 라벨**이라고 생각하면 됩니다.

---

## 4. 데이터 모델 한눈에 보기

테이블은 `src/lib/db/entities/`에 TypeORM 클래스로 정의됩니다.  
실제 PostgreSQL 테이블 이름은 스네이크 케이스(`users`, `reviews` …)입니다.

```
  users ─────────┬──────── reviews ──────── albums
                 │              │
                 │              ├── comments (review_id)
                 │              └── likes    (review_id)
                 │
                 ├── posts ──── comments / likes / reports
                 ├── playlists ─┬── playlist_tracks
                 │              ├── playlist_genres ── genres
                 │              └── comments / likes
                 ├── user_favorite_albums
                 ├── user_slide_albums      (마이페이지 “명반”)
                 └── user_sanctions / blocked_emails

  today_albums              (날짜가 PK — 하루에 앨범 하나)
  featured_slide_albums     (홈 슬라이드바)
  faqs
  email_otp_challenges      (회원가입·비번재설정 인증번호)
```

### 자주 나오는 컬럼 습관

| 습관 | 예시 | 초보자가 헷갈리는 이유 |
|------|------|------------------------|
| `"Y"` / `"N"` 문자열 | `isApproved`, `isPublic`, `showReviewsPublic` | boolean이 아니라 `varchar(1)`. `"Y"`만 참 |
| 문자열 PK | `reviews.id`, `users.user_id` | auto-increment 숫자가 아님. UUID를 잘라 쓰거나 아이디 문자열 |
| 다형성 FK | `comments.post_id` / `review_id` / `playlist_id` | 댓글 한 테이블이 세 종류의 부모를 가리킴. **셋 중 하나만** 채움 |

---

## 5. 이 프로젝트를 읽을 때 기억할 세 가지

1. **페이지 URL과 API URL의 단수/복수가 다릅니다.**  
   `/reviews`(목록) vs `/review/[id]`(상세). API는 전부 `/api/reviews/*`.
2. **“나”와 “남”이 경로로 갈립니다.**  
   `/profile` = 로그인한 나, `/users/[userId]` = 다른 사람.
3. **라우트에 DB 로직을 길게 쓰지 않습니다.**  
   `가드 → service → apiOk / handleRouteError` 패턴이 기본입니다. 자세한 규칙은 [02_structure.md](./02_structure.md)와 루트 [`CONTRIBUTING.md`](../CONTRIBUTING.md)를 보세요.
