# 백엔드 설정

## 스택

- **Next.js** App Router + Route Handlers
- **TypeORM** + **pg** (Supabase PostgreSQL, `synchronize: false`)
- **next-auth** (JWT 세션)
- **Cloudflare R2** (미디어: 프로필·플레이리스트 커버)
- **@supabase/supabase-js** (Auth 연동용 클라이언트)
- **bcryptjs**, **resend**, **reflect-metadata**

## 디렉터리 개요

```
app/
  api/                 # 얇은 HTTP 어댑터 (가드 → service → apiOk/apiError)
  admin|auth|boards|…  # UI 라우트 (page/layout만 유지)
src/
  components/
    admin/             # 관리자 UI (`/admin/*` 라우트에서 import)
    reviews/           # 리뷰 목록·카드 UI
  hooks/               # 클라이언트 훅
  lib/
    auth/              # NextAuth·세션 가드
    db/                # DataSource + entities
    http/              # apiOk, apiError, fetchJson, handleRouteError, ServiceError
    storage/           # Cloudflare R2 업로드 (media.ts, r2.ts)
    <domain>/          # *-service.ts, client-api.ts (reviews, playlists, …)
scripts/               # 수동 SQL 마이그레이션 (`npm run db:migrate:*`)
```

## 네이밍 규칙 (브레이킹 체인지 없이 유지)

### `/api/user` vs `/api/users`
| 경로 | 용도 |
|------|------|
| `/api/user/*` | **세션 본인** 작업 (닉네임·프로필 이미지·공개설정·계정·슬라이드) |
| `/api/users/[userId]/*` | **타인/공개** 리소스 (예: 공개 플레이리스트 목록) |

페이지도 동일: `/profile` = 나, `/users/[userId]` = 타인.

### `/review` vs `/reviews` (페이지)
| 경로 | 용도 |
|------|------|
| `/reviews` | 전체 리뷰 목록 |
| `/review/[id]` | 리뷰 상세·수정 |
| `/review/album/[albumId]` | 앨범별 리뷰 목록 |
| `/api/reviews/*` | 리뷰 REST API (단수 폴더 없음) |

### `src/lib/reviews`
도메인 코드는 **`src/lib/reviews`** 한곳 (`rejection-reasons`, `*-service`, `client-api`).  
구 `src/lib/review` 폴더는 제거됨.

## 엔티티 (`src/lib/db/entities`)

User, Album, Review, Post, Comment, Like, Report, UserFavoriteAlbum,  
UserSlideAlbum, FeaturedSlideAlbum, TodayAlbum, Faq,  
Playlist, PlaylistTrack, Genre, PlaylistGenre,  
EmailOtpChallenge, UserSanction, BlockedEmail

## 인증·스토리지

- 로그인: `/auth/signin`, API: `/api/auth/[...nextauth]`
- DB: Supabase PostgreSQL (`public` 스키마)
- 비밀번호: bcrypt 해싱
- **미디어: Cloudflare R2** (`src/lib/storage/media.ts` → `r2.ts`)
  - 프로필 / 플레이리스트 커스텀 커버
  - 플레이리스트 **자동** 커버는 iTunes(mzstatic) URL만 DB에 저장
- 필수 env (미디어 업로드):
  - `R2_ACCOUNT_ID`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_BUCKET`
  - `R2_PUBLIC_BASE_URL` (공개 읽기 URL, trailing slash 없이)
- Auth용: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Vercel에 R2 변수 등록 후 재배포. `next.config`가 `R2_PUBLIC_BASE_URL` 호스트를 `images.remotePatterns`에 넣음.

## API 에러 패턴

서비스는 `ServiceError(message, status)`를 throw하고, 라우트는 `handleRouteError(error, fallbackMessage)`로 `apiError` 응답을 만든다.

성공 응답은 기본적으로 `{ ok: true, data, message? }`, 실패는 `{ ok: false, error }` 형태다.  
프론트는 `src/lib/http/client.ts`의 `fetchJson` / 도메인 `client-api.ts`를 사용한다.

기여·폴더 규칙은 [`CONTRIBUTING.md`](./CONTRIBUTING.md)를 본다.

## 스키마 마이그레이션

### 현재 방침 (유지)

- TypeORM `synchronize: false`
- 스키마 변경은 **수동 SQL + Node 러너** (`scripts/run-*-migration.mjs`)
- 실행: `npm run db:migrate:<name>` (예: `db:migrate:user-sanctions`)
- `DATABASE_URL`은 환경 변수 또는 `.env.local`에서 읽음

이 방식은 배포·로컬에서 “한 번에 적용하는 스크립트”가 명확하고, 기존 운영 이력이 이미 스크립트에 쌓여 있어 **당장 TypeORM Migration으로 옮기지 않는다.**

### 전환 검토 (후순위)

아래가 커지면 TypeORM `MigrationInterface` + `migration:run` 전환을 검토한다.

- 마이그레이션 스크립트가 많아져 적용 순서·중복 실행 추적이 어려울 때
- CI에서 스키마 버전을 강제해야 할 때
- 여러 환경(스테이징/프로덕션) 동시 운영으로 이력 테이블이 필요할 때

전환 시 권장 순서:

1. `migrations` 테이블로 적용 이력 관리
2. 기존 SQL을 초기 baseline migration으로 고정 (이미 적용된 환경은 fake-run)
3. 이후 변경만 TypeORM migration 생성
4. `package.json`의 `db:migrate:*`를 단계적으로 축소

신규 스키마 변경 PR에는 **SQL 파일 + 러너 스크립트 + npm script**를 함께 넣는다.
