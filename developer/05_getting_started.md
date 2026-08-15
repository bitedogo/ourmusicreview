# 05. 환경 설정 및 로컬 실행 가이드

> **한 줄 요약:** Node 20+ 설치 → `.env.local` 채우기 → `npm install` → `npm run dev`.  
> DB가 없으면 페이지는 떠도 API가 전부 500이 납니다.

팀 운영 세부는 루트 [`BACKEND_SETUP.md`](../BACKEND_SETUP.md), [`README.md`](../README.md)와 이 문서가 같은 방향을 가리킵니다.

---

## 1. 준비물

| 항목 | 권장 | Why |
|------|------|-----|
| **Node.js** | 20 이상 | Next 16 / 네이티브 모듈(sharp) |
| **npm** | Node에 포함 | `package-lock.json` 기준 |
| **PostgreSQL** | Supabase 프로젝트 또는 로컬 Postgres | `DATABASE_URL` |
| **Git** | — | 저장소 클론 |

선택(기능별로 꺼짐):

- Google Cloud OAuth 클라이언트 — 구글 로그인
- Resend API 키 — 인증 메일
- Cloudflare R2 — 프로필/커버 업로드
- Spotify Client ID/Secret — 스트리밍 링크 보조

---

## 2. 저장소 받고 의존성 설치

```bash
git clone <이 저장소 URL>
cd music_review
npm install
```

`postinstall`이 `patch-package`를 실행합니다. 패치 실패가 나면 `patches/` 폴더와 Node 버전을 확인하세요.

---

## 3. 환경 변수 (`.env.local`)

Git에는 `.env*`가 무시됩니다(`.env.example`만 예외로 커밋 가능).  
프로젝트 루트에 **`.env.local`** 을 만듭니다. Next.js가 개발 서버에서 자동 로드합니다.

`src/lib/env.ts`가 “언제 필요한지”를 나눕니다. **부팅 필수**와 **기능 켤 때 필수**가 다릅니다.

### 3.1 서버 부팅에 필수 (`getServerEnv`)

없으면 `initializeDatabase()` / NextAuth 설정에서 프로세스가 죽습니다.

```bash
# PostgreSQL 연결 문자열 (Supabase: Project Settings → Database)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres

# NextAuth JWT 서명 키 — 아무나 알면 세션을 위조할 수 있음
# 생성 예: openssl rand -base64 32
NEXTAUTH_SECRET=긴_랜덤_문자열

# 로컬은 http://localhost:3000 , 배포는 https://www.comeonoru.com
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (Google Cloud Console → 승인된 리디렉션 URI
#   {NEXTAUTH_URL}/api/auth/callback/google )
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
```

**Why `NEXTAUTH_URL`인가?**  
콜백 URL과 쿠키 `Secure` 플래그가 이 값으로 갈립니다.  
로컬에서 `https://`로 두면 쿠키가 안 붙고 로그인이 무한 루프처럼 보일 수 있습니다.

### 3.2 클라이언트에 노출되는 값 (`getClientEnv`)

`NEXT_PUBLIC_` 접두어는 **브라우저 번들에 들어갑니다.** 비밀키를 넣지 마세요.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...   # anon public 키 (service_role 금지)
```

레거시 Supabase Auth 클라이언트(`src/lib/supabase.ts`)와 `next.config.ts`의 이미지 호스트 허용에 쓰입니다.

### 3.3 메일 (`getEmailEnv`) — 회원가입 OTP 때 필요

```bash
RESEND_API_KEY=re_xxxxx
# 없으면 기본값: ORU <onboarding@resend.dev>  (Resend 테스트 도메인)
RESEND_FROM=ORU <noreply@your-domain.com>
```

로컬에서 메일이 안 가도 DB·로그인은 됩니다. 회원가입 인증 단계만 실패합니다.

### 3.4 이미지 업로드 (`getR2Env`) — 프로필/플리 커버

```bash
R2_ACCOUNT_ID=클라우드플레어_계정_ID
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=버킷이름
# 공개 읽기 베이스 URL, 끝 슬래시 없이
R2_PUBLIC_BASE_URL=https://img.example.com
```

`next.config.ts`가 이 호스트를 `images.remotePatterns`에 넣습니다. **바꾸고 나면 개발 서버를 재시작**하세요.

### 3.5 선택: Spotify

```bash
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
```

없으면 `getSpotifyAccessToken()`이 `null`을 주고 스트리밍 보조만 조용히 빠집니다. 앱 전체가 죽지는 않습니다.

### 3.6 변수 한눈에 보기

| 변수 | 필수 시점 | 비밀? |
|------|-----------|--------|
| `DATABASE_URL` | DB 쓰는 모든 요청 | Yes |
| `NEXTAUTH_SECRET` | 로그인 | Yes |
| `NEXTAUTH_URL` | 로그인 콜백/쿠키 | 보통 No |
| `GOOGLE_CLIENT_ID` / `SECRET` | Auth 설정 로드 시 | Secret만 Yes |
| `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` | `getClientEnv()` | Anon은 공개 가정 |
| `RESEND_API_KEY` | 메일 발송 | Yes |
| `RESEND_FROM` | 선택 | No |
| `R2_*` | 이미지 업로드 | Secret/Access Yes |
| `SPOTIFY_*` | 스트리밍 링크 | Yes |

---

## 4. 데이터베이스

### 4.1 연결 확인

`DATABASE_URL`이 `localhost` 또는 `placeholder`를 포함하면 SSL을 끕니다.  
Supabase 클라우드 URL이면 `ssl: { rejectUnauthorized: false }` 로 붙습니다 (`src/lib/db/data-source.ts`).

TypeORM **`synchronize: false`** — 엔티티를 고쳐도 테이블이 자동 생성/삭제되지 않습니다.

### 4.2 스키마를 맞추는 방법

이 레포는 TypeORM Migration 대신 **SQL 파일 + Node 러너**를 씁니다.

```
scripts/add-플레이리스트.sql
scripts/run-playlist-migration.mjs   → package.json 의 db:migrate:playlists
```

```bash
# 예시 (필요한 것만, 이미 운영에 적용된 것은 다시 돌리면 에러가 날 수 있음)
npm run db:migrate:playlists
npm run db:migrate:email-auth
npm run db:migrate:email-otp
npm run db:migrate:genres
npm run db:migrate:comments
npm run db:migrate:review-views
npm run db:migrate:playlist-likes-comments
npm run db:migrate:user-sanctions
npm run db:migrate:blocked-emails

# 장르 마스터 데이터
npm run db:seed:genres
```

러너는 `.env.local`의 `DATABASE_URL`을 읽습니다.

**신규 컬럼을 추가하는 PR 체크리스트**

1. `scripts/add-xxx.sql`  
2. `scripts/run-xxx-migration.mjs`  
3. `package.json`에 `"db:migrate:xxx": "node scripts/run-xxx-migration.mjs"`  
4. `src/lib/db/entities/` 수정 + `data-source.ts`의 `entities` 배열

### 4.3 로컬에 데이터가 없을 때

빈 DB여도 앱은 뜹니다. 다만:

- 홈 슬라이드/오늘의 앨범이 비어 있음 → 관리자 `/admin/albums`, `/admin/featured-slide`에서 채움
- 리뷰·게시글이 없음 → 회원가입 후 직접 작성
- 관리자 페이지는 `users.role = 'ADMIN'` 인 계정만. Supabase Table Editor에서 해당 유저 role을 바꾸면 됩니다.

---

## 5. 로컬 실행

```bash
npm run dev
```

브라우저: [http://localhost:3000](http://localhost:3000)

| 명령 | 하는 일 |
|------|---------|
| `npm run dev` | 개발 서버 (핫 리로드) |
| `npm run build` | 프로덕션 빌드 (타입 검사 포함) |
| `npm start` | `build` 결과 실행 (`NODE_ENV=production`) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` (빌드 없이 타입만) |

### 로컬에서 먼저 눌러볼 화면

```
1. /                     홈이 깨지지 않는지 (API 500이면 .env/DB)
2. /auth/signup          메일 키가 있으면 OTP까지
3. /auth/signin          Credentials 로그인
4. /search               아티스트 검색 (iTunes, 키 불필요)
5. /review/write         미로그인 시 로그인으로 보내지는지
6. /boards/domestic      게시판 RSC
7. /admin                일반 유저는 홈으로 쫓기는지
```

---

## 6. 빌드와 배포

```
로컬 검증                 Vercel
─────────                 ──────
npm run typecheck         git push → 자동 빌드
npm run lint              vercel.json:
npm run build               framework: nextjs
                            regions: ["icn1"]   ← 서울
                            API maxDuration 30s
```

배포 환경(Vercel Project → Environment Variables)에도 `.env.local`과 **같은 이름**을 넣습니다.

| 배포 시 자주 빠뜨리는 것 | 증상 |
|--------------------------|------|
| `NEXTAUTH_URL`이 프로덕션 도메인이 아님 | 로그인 후 리다이렉트 실패, 쿠키 도메인 불일치 |
| `NEXTAUTH_SECRET`이 프리뷰/프로덕션이 다름 | 세션이 갑자기 풀림 |
| `R2_PUBLIC_BASE_URL` 미등록 | `next/image`가 외부 호스트 거부 (깨진 이미지) |
| Google 리디렉션 URI에 프로덕션 URL 없음 | 구글 로그인 400 |
| `DATABASE_URL`이 개발 DB | 운영에 글이 안 보임 |

미디어 URL을 예전 Supabase Storage에서 R2로 바꿀 때:

```bash
npm run media:rewrite-r2-urls
```

(`scripts/rewrite-storage-urls-to-r2.mjs` — 실행 전 스크립트 주석과 백업을 확인하세요.)

앱 아이콘 재생성:

```bash
npm run icons:oru
```

---

## 7. 개발 중 흔한 문제

```
증상                         원인 후보
───────────────────────────  ────────────────────────────────
[ENV] DATABASE_URL 필요      .env.local 없음 / 변수명 오타 / 서버 미재시작
로그인 버튼이 아무 일도 안 함  NEXTAUTH_URL, Google 콜백, 이메일 미인증
EMAIL_NOT_VERIFIED           회원가입 OTP 미완료
403 정지 계정                user_sanctions / account_status
이미지 깨짐                  remotePatterns (R2 호스트), next/image
리뷰 POST 409                그 앨범에 이미 리뷰가 있음
관리자 404/홈으로            role 이 ADMIN 이 아님
포트 3000 사용 중            다른 next dev — 끄거나 포트 변경
sharp 설치 실패              Node 버전, Windows 빌드 도구
```

에러 메시지를 읽을 때:

- `[ENV] ... 필요합니다` → `src/lib/env.ts`의 `requireEnv`
- `{ ok: false, error: "..." }` → 서비스가 던진 `ServiceError` 또는 가드
- 터미널 TypeORM 쿼리 로그 → `data-source.ts`의 `logging: development`

---

## 8. 코드 고친 뒤 최소 검증

```bash
npm run typecheck
npm run lint
npm run build
```

기능 추가 시 스스로 물어볼 것:

1. 라우트는 얇은가? 규칙은 `*-service.ts`에 있는가?  
2. 쓰기는 `requireWritableSessionApi`인가?  
3. 프론트는 raw `fetch` 대신 `fetchJson` / `client-api`인가?  
4. 스키마 변경이면 SQL + 러너 + npm script가 있는가?  
5. 경로는 `src/lib/navigation/routes.ts`를 쓰는가?

더 짧은 레이어 약속은 [`CONTRIBUTING.md`](../CONTRIBUTING.md)에 있습니다.

---

## 9. 다음 문서

로컬이 뜨면 [03_data_flow.md](./03_data_flow.md)로 요청의 길을 따라가 보고,  
리뷰 한 편을 직접 쓴 뒤 [04_core_features.md](./04_core_features.md)를 읽으면 파일이 연결됩니다.
