# 새 PC/노트북 초기 설정 가이드

이 문서는 새 노트북이나 PC에서 프로젝트를 처음 설정할 때 참고하는 가이드입니다.

## 1. Node.js 설치

Node.js가 설치되어 있지 않다면 먼저 설치하세요.

- **다운로드**: https://nodejs.org/ (LTS 버전 권장)
- 설치 후 터미널에서 확인: `node -v`, `npm -v`

## 2. 의존성 설치

```bash
cd c:\music_review
npm install
```

`postinstall` 스크립트가 자동으로 `patch-package`를 실행하여 next-auth 패치를 적용합니다.

## 3. 환경 변수 설정

`.env.local` 파일이 이미 생성되어 있습니다. 아래 값들을 **실제 값**으로 교체해주세요.

### 3.1 Supabase PostgreSQL (DATABASE_URL)

1. [Supabase Dashboard](https://supabase.com/dashboard) 로그인
2. 프로젝트 선택 (zdggogbgkvgjkjngvxwn)
3. **Project Settings** > **Database** > **Connection string** > **URI** 복사
4. `[YOUR_PASSWORD]` 부분을 실제 DB 비밀번호로 교체

### 3.2 NextAuth Secret (NEXTAUTH_SECRET)

터미널에서 실행하여 랜덤 시크릿 생성:

```bash
openssl rand -base64 32
```

생성된 문자열을 `NEXTAUTH_SECRET` 값으로 사용하세요.

> Windows에서 openssl이 없다면: Git Bash 사용 또는 [온라인 생성기](https://generate-secret.vercel.app/32) 활용

### 3.3 Supabase API 키 (SUPABASE_SERVICE_ROLE_KEY)

1. Supabase Dashboard > **Project Settings** > **API**
2. **Project API keys** > **service_role** (secret) 복사
3. `.env.local`의 `SUPABASE_SERVICE_ROLE_KEY`에 붙여넣기

## 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 5. VSCode/Cursor 확장 프로그램 (권장)

프로젝트를 열면 다음 확장 프로그램 설치를 권장합니다:

- **ESLint** - 코드 린팅
- **Tailwind CSS IntelliSense** - Tailwind 클래스 자동완성

## 문제 해결

### npm을 찾을 수 없음
→ Node.js가 설치되지 않았거나 PATH에 등록되지 않음. Node.js 재설치 후 터미널 재시작

### DATABASE_URL 연결 오류
→ Supabase 비밀번호 확인, 연결 문자열 형식 확인

### NEXTAUTH_SECRET 관련 오류
→ 반드시 32자 이상의 랜덤 문자열 사용
