# 백엔드 설정

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


## 데이터베이스 모델

### User (USERS 테이블)
- `id`: String (Primary Key)
- `password`: String
- `nickname`: String
- `role`: "USER" | "ADMIN"

### Album (ALBUMS 테이블)
- `albumId`: String (Primary Key, iTunes Collection ID)
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



- **NextAuth 사용**: 
   - 로그인 페이지: `/auth/signin`
   - API 엔드포인트: `/api/auth/[...nextauth]


- **데이터베이스**: Supabase PostgreSQL 사용 (public 스키마)
- **비밀번호 해싱**: 사용자 등록 시 bcrypt를 사용하여 비밀번호를 해싱.
- **Storage**: 프로필 이미지는 Supabase Storage `profiles` 버킷에 업로드.