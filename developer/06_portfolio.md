# 06. 포트폴리오용 프로젝트 소개

> 이력서, 노션, 깃허브 README, 면접 1분 소개에 **그대로 옮겨 쓸 수 있는** 문장입니다.  
> 숫자는 과장하지 않았습니다. 본인 역할(기획/풀스택/일부 기능)에 맞게 주어만 바꾸세요.

라이브: [https://www.comeonoru.com](https://www.comeonoru.com)  
런칭: 2026. 03. 16 · Team ORU

---

## 30초 엘리베이터 피치

ORU는 **싱글이 아니라 앨범 단위**로 음악을 기록하고 나누는 웹 커뮤니티입니다.  
스트리밍 앱이 “지금 무엇을 듣나”를 보여 준다면, ORU는 **한 장을 어떻게 들었는가**를 남깁니다.  
리뷰(0–10점), 게시판, 플레이리스트, 오늘의 앨범 큐레이션을 한 제품으로 묶었고,  
Next.js App Router 위에서 프론트·API·인증을 한 코드베이스로 운영합니다.

---

## 이력서에 넣는 한 덩어리 (복붙)

### 한국어 · 상세형

**ORU — 앨범 리뷰 & 음악 커뮤니티 웹 서비스** (Live: comeonoru.com)

- 앨범 단위 평론(0.0–10.0), 커뮤니티 게시판, 플레이리스트, 홈 큐레이션을 제공하는 풀스택 웹 애플리케이션
- Next.js 16 App Router + TypeScript + Tailwind. API는 Route Handler, 도메인 로직은 서비스 계층으로 분리
- PostgreSQL(TypeORM) · NextAuth(JWT, Credentials/Google) · Cloudflare R2 미디어 · iTunes Search API
- 앨범당 리뷰 1개, 정지 계정 쓰기 차단, 공개/비공개 프로필 등 제품 규칙을 서버에서 강제
- 레이어 규칙(가드 → service → 통일 JSON)으로 라우트를 얇게 유지해 기능 추가 비용을 낮춤

### 한국어 · 한 줄

앨범 단위 리뷰·커뮤니티·플레이리스트를 갖춘 음악 기록 웹 서비스. Next.js 풀스택, 실서비스 운영(comeonoru.com).

### English · resume bullet

**ORU** — Full-stack web app for **album-level** music criticism and community (comeonoru.com).  
Next.js App Router, TypeScript, PostgreSQL/TypeORM, NextAuth. Reviews, boards, playlists, editorial home, admin tools. Domain rules live in a service layer; route handlers stay thin HTTP adapters.

### English · one-liner

ORU is a live music-review community focused on **albums, not singles**—ratings, writing, playlists, and editorial discovery on a Next.js full-stack app.

---

## 문제 → 해결 (케이스 스터디 뼈대)

| | 내용 |
|--|------|
| **문제** | 스트리밍 차트와 SNS 한줄평은 많지만, 앨범을 **한 편의 작품**으로 읽고 남기는 한국어 공간이 드물다. |
| **사용자** | 앨범을 통째로 듣는 리스너, 글을 쓰는 리스너, LP/작업물을 나누고 싶은 사람. |
| **해결** | 앨범 검색(iTunes) → 리뷰 작성 → 피드/상세 → 게시판·플리로 확장. 홈은 에디토리얼(슬라이드, 오늘의 앨범). |
| **제약** | 소규모 팀, 서버리스 배포(Vercel), 음원을 직접 호스팅하지 않음. |
| **결정** | 프론트/백 분리 대신 **BFF가 내장된 Next.js**. 메타데이터는 iTunes, 파일은 R2, 관계는 Postgres. |

면접에서 말할 때: “왜 마이크로서비스가 아니냐” → 팀 규모와 도메인 응집. “왜 앨범 ID가 UUID가 아니냐” → 외부 카탈로그(collectionId)가 이미 식별자다.

---

## 기술적으로 자랑할 포인트 (3개만 골라도 충분)

1. **레이어드 아키텍처**  
   `app/api`는 세션 가드와 JSON만, `src/lib/<도메인>/*-service.ts`가 불변조건(앨범당 리뷰 1개, 공지 권한, 플리 소유권)을 지킨다.

2. **서버 컴포넌트와 클라이언트 fetch를 섞음**  
   게시판 목록은 RSC가 DB를 바로 읽어 SEO·첫 페인트. 홈 카드·리뷰 피드는 클라이언트 훅 + 짧은 CDN 캐시.

3. **운영을 제품에 넣음**  
   이메일 OTP, 계정 제재, 신고, 관리자 큐레이션, 미디어를 R2로 옮겨 egress를 줄인 점. “만든 뒤 방치”가 아니라 **돌아가는 서비스**다.

그다음 고를 거리: JWT 세션과 서버리스, `synchronize: false` + 수동 SQL 마이그레이션, 다형 댓글/좋아요 한 테이블, 스트리밍 링크 매칭.

---

## 화면 캡처 추천 (포트폴리오 그리드)

채용 담당자는 코드보다 **화면 3–5장**을 먼저 봅니다.

1. 홈 — 히어로 검색 + 흘러가는 앨범 슬라이드 + 오늘의 앨범  
2. 리뷰 상세 — 커버, 0–10 색 점수, 본문, 좋아요/댓글  
3. 리뷰 작성 — 앨범이 선택된 에디터  
4. 게시판 또는 플레이리스트 상세  
5. (선택) 마이페이지 명반 슬라이드 / 관리자 오늘의 앨범

캡션 예시: “홈은 피드가 아니라 진열장. 72초 마퀴는 ‘오늘의 가게 창’.”

---

## 면접 예상 질문과 짧은 답

**Q. 왜 Redux가 없나?**  
전역 상태가 세션(NextAuth)과 페이지 로컬 state로 충분해서. 스토어를 넣으면 배보다 배꼽.

**Q. 리뷰 중복을 프론트에서만 막지 않은 이유?**  
`POST /api/reviews`에서 `(userId, albumId)`를 검사하고 409. UI는 우회할 수 있다.

**Q. iTunes를 DB에 미러하지 않나?**  
리뷰가 생기는 순간 `albums` 행을 upsert. 카탈로그 전체를 미러하면 동기화 비용만 커진다.

**Q. 가장 어려운 트레이드오프?**  
공개 목록 캐시(방금 쓴 글이 안 보일 수 있음) vs 개인 API no-store. 피드 신선도와 비용의 균형.

---

## 쓰지 말 것 (신뢰)

- 허위 MAU, “AI 추천 엔진”, “자체 음원 스트리밍”
- 혼자 만든 것처럼 단정 — Team ORU. 본인 기여 범위를 한 줄로 밝힌다
- 스택 나열만 하고 **왜**가 없는 문장

기여 범위 템플릿:  
“인증·리뷰 API·마이그레이션을 담당 / 홈 UI와 디자인 토큰을 담당 / 전 구간을 함께 구현” 중 사실에 맞는 것만.
