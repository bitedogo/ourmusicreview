# 기여·코드 규칙

ORU 코드베이스에서 API·폴더·레이어를 맞추기 위한 짧은 가이드입니다.  
백엔드/DB 세부 설정은 [`BACKEND_SETUP.md`](./BACKEND_SETUP.md)를 참고하세요.

## 레이어

```
app/api/**/route.ts     → 얇은 HTTP (세션 가드 → service → apiOk / handleRouteError)
src/lib/<domain>/*-service.ts  → 도메인 로직·DB
src/lib/<domain>/client-api.ts → 브라우저 fetchJson 래퍼
src/components/**       → UI (admin UI는 src/components/admin)
app/**/page.tsx         → 라우트 셸 (가능하면 RSC, 인터랙션만 클라)
```

- 라우트에서 TypeORM/`DataSource` 비즈니스 로직을 직접 길게 쓰지 않습니다.
- 서비스는 `ServiceError(message, status)`를 throw하고, 라우트는 `handleRouteError`로 응답합니다.
- 프론트는 raw `fetch` 대신 `fetchJson` / 도메인 `client-api`를 우선합니다.

## API 응답 계약

성공:

```json
{ "ok": true, "data": { ... }, "message": "선택" }
```

실패:

```json
{ "ok": false, "error": "사용자용 메시지" }
```

예외: 일부 공개 목록(예: `/api/reviews/list`)은 캐시 응답을 위해 `ok`와 함께 필드를 루트에 펼칩니다. 신규 API는 `data` 래핑을 기본으로 합니다.

## 세션 가드

| 헬퍼 | 용도 |
|------|------|
| `requireSessionApi` | 로그인 필요 API |
| `requireWritableSessionApi` | 리뷰·댓글·게시글 쓰기 (정지 계정 차단) |
| `requireAdminApi` | 관리자 API |
| `requireAuthPage` / `requireAdminPage` | 페이지 리다이렉트 가드 |

## 폴더·URL 네이밍

- `/api/user/*` = 세션 **본인**, `/api/users/[userId]/*` = **타인/공개**
- `/profile` = 나, `/users/[userId]` = 타인 프로필
- `/reviews` = 전체 목록, `/review/[id]` = 상세·수정 (경로 통합은 별도 승인)
- 도메인 lib는 `src/lib/reviews` (단수 `lib/review` 사용 금지)

경로 빌더는 `src/lib/navigation/routes.ts`를 사용합니다.

## DB 스키마 변경

- `synchronize: false` 유지.
- SQL은 `scripts/`에 두고 공통 `scripts/run-migration.mjs`로 실행합니다.
- 새 SQL은 `scripts/migration-manifest.json` 끝에 의존 순서대로 추가하고, 필요한 `db:migrate:<name>` 스크립트도 등록합니다.
- 전체 적용은 `npm run db:migrate`, 단일 적용은 `npm run db:migrate:<name>`을 사용합니다. `schema_migrations`의 체크섬이 적용된 SQL 변경을 차단합니다.
- 전환 시점·절차는 `BACKEND_SETUP.md`의「스키마 마이그레이션」을 따릅니다.

## UI 로딩·404

- 주요 세그먼트에 `loading.tsx` / 필요 시 `not-found.tsx`를 둡니다.
- 공통 로딩 문구는 `src/components/common/route-loading.tsx`를 재사용합니다.

## 머지

`main`에 바로 푸시하지 않습니다. 브랜치에서 PR을 열고 GitHub Actions **Quality**(`npm run check:build`)가 통과한 뒤에 머지합니다. 리뷰어는 필수가 아닙니다.

로컬 `npm run build`는 Postgres가 있으면 CI와 다르게 통과할 수 있습니다. 배포 전 게이트는 GitHub Quality입니다. Vercel 프리뷰가 있으면 그 주소로 화면을 확인합니다.

`main` 보호는 저장소 Settings → Rules → Rulesets에서 한 번 켭니다. Target은 `main`, Require a pull request(승인자 **0명**), Require status checks to pass는 워크플로 Quality의 `check`입니다. 코드 리뷰 필수는 끄고, force push는 막습니다.

## 검증

```bash
npm run check         # typecheck + lint + test
npm run check:build   # check + production build
```
