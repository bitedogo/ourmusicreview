# 백엔드 설정 완료 안내

음반 리뷰 사이트의 백엔드 설정이 완료되었습니다.

## 설치된 라이브러리

- **TypeORM**: PostgreSQL ORM
- **pg**: PostgreSQL 드라이버 (node-postgres)
- **next-auth**: Next.js 인증 라이브러리
- **@supabase/supabase-js**: Supabase Storage (프로필 이미지)
- **bcryptjs**: 비밀번호 해싱
- **reflect-metadata**: TypeORM 데코레이터 지원

## 생성된 파일 구조

```
src/
├── lib/
│   ├── db/
│   │   ├── entities/
│   │   │   ├── User.ts      # USERS 테이블 엔티티
│   │   │   ├── Album.ts     # ALBUMS 테이블 엔티티
│   │   │   └── Review.ts    # REVIEWS 테이블 엔티티
│   │   ├── data-source.ts   # TypeORM 데이터소스 설정
│   │   └── index.ts         # 데이터베이스 초기화 유틸리티
│   └── auth/
│       └── config.ts        # NextAuth 설정
└── app/
    └── api/
        └── auth/
            └── [...nextauth]/
                └── route.ts  # NextAuth API 라우트
```

## 환경 변수 설정

`.env.local` 파일을 프로젝트 루트에 생성하고 다음 변수들을 설정하세요:

```env
# Supabase PostgreSQL
DATABASE_URL=postgresql://postgres.zdggogbgkvgjkjngvxwn:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Supabase Storage (프로필 이미지)
SUPABASE_URL=https://zdggogbgkvgjkjngvxwn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

자세한 내용은 `.env.example` 및 `ENV_SETUP.md` 파일을 참고하세요.

## 데이터베이스 모델

### User (USERS 테이블)
- `id`: String (Primary Key)
- `password`: String
- `nickname`: String
- `role`: "USER" | "ADMIN"

### Album (ALBUMS 테이블)
- `albumId`: String (Primary Key, Spotify ID)
- `title`: String
- `artist`: String
- `imageUrl`: String (optional)
- `releaseDate`: Date (optional)
- `category`: "K" | "I"

### Review (REVIEWS 테이블)
- `id`: String (Primary Key)
- `content`: String (CLOB)
- `rating`: Number (0-10)
- `isApproved`: "Y" | "N"
- `userId`: String (Foreign Key)
- `albumId`: String (Foreign Key)
- `createdAt`: Date
- `updatedAt`: Date

## 다음 단계

1. **환경 변수 설정**: `.env` 파일을 생성하고 필요한 값들을 입력하세요.

2. **데이터베이스 연결 테스트**: 
   ```typescript
   import { initializeDatabase } from "@/lib/db";
   
   // 데이터베이스 초기화
   const dataSource = await initializeDatabase();
   ```

3. **NextAuth 사용**: 
   - 로그인 페이지: `/auth/signin`
   - API 엔드포인트: `/api/auth/[...nextauth]`

4. **Spotify API 연동**: 환경 변수에 Spotify API 키를 설정한 후 API 라우트에서 사용하세요.

## 주의사항

- **데이터베이스**: Supabase PostgreSQL 사용 (public 스키마)
- **비밀번호 해싱**: 사용자 등록 시 bcrypt를 사용하여 비밀번호를 해싱합니다.
- **Storage**: 프로필 이미지는 Supabase Storage `profiles` 버킷에 업로드됩니다.

## 문제 해결

- 데이터베이스 연결 오류: `DATABASE_URL`이 올바른지, Supabase 대시보드에서 연결 문자열을 확인하세요.
- TypeORM 오류: `tsconfig.json`에 `experimentalDecorators`와 `emitDecoratorMetadata`가 설정되어 있는지 확인하세요.
