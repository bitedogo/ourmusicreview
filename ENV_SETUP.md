# 환경 변수 설정 가이드

`.env.local` 파일을 프로젝트 루트에 생성하고 아래 환경 변수들을 설정해주세요.

## Supabase PostgreSQL 연결 정보

```env
# Supabase Connection String (프로젝트: zdggogbgkvgjkjngvxwn)
# Host: aws-0-ap-northeast-2.pooler.supabase.com
# Database / User: postgres
DATABASE_URL=postgresql://postgres.zdggogbgkvgjkjngvxwn:[YOUR_PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres
```

## NextAuth 설정

```env
# NextAuth Secret (랜덤 문자열 생성)
# 생성 방법: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

## Supabase API (Storage - 프로필 이미지)

```env
# Supabase Dashboard > Settings > API
SUPABASE_URL=https://zdggogbgkvgjkjngvxwn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 전체 예시

```env
# Supabase PostgreSQL
DATABASE_URL=postgresql://postgres.zdggogbgkvgjkjngvxwn:YOUR_PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres

# NextAuth
NEXTAUTH_SECRET=your-generated-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Supabase Storage
SUPABASE_URL=https://zdggogbgkvgjkjngvxwn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 참고사항

- `.env.local` 파일은 절대 Git에 커밋하지 마세요.
- `.gitignore`에 `.env*`가 포함되어 있는지 확인하세요.
- NextAuth Secret은 반드시 안전한 랜덤 문자열을 사용하세요.
- Vercel 배포 시 프로젝트 설정 > Environment Variables에서 위 변수들을 추가하세요.