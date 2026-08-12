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
- **당분간** TypeORM Migration 대신 `scripts/run-*-migration.mjs` + `npm run db:migrate:*` 를 사용합니다.
- 전환 시점·절차는 `BACKEND_SETUP.md`의「스키마 마이그레이션」을 따릅니다.

## UI 로딩·404

- 주요 세그먼트에 `loading.tsx` / 필요 시 `not-found.tsx`를 둡니다.
- 공통 로딩 문구는 `src/components/common/route-loading.tsx`를 재사용합니다.

## 검증

```bash
npm run typecheck
npm run lint
npm run build
```
