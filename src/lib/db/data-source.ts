import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Album } from "./entities/Album";
import { Review } from "./entities/Review";
import { Post } from "./entities/Post";
import { UserFavoriteAlbum } from "./entities/UserFavoriteAlbum";
import { Comment } from "./entities/Comment";
import { Like } from "./entities/Like";
import { Report } from "./entities/Report";
import { TodayAlbum } from "./entities/TodayAlbum";

// Supabase PostgreSQL
// DATABASE_URL 예시 (환경 변수에서만 주입):
// postgresql://postgres.[project-ref]:[password]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
if (!process.env.DATABASE_URL) {
  throw new Error(
    "[DB] DATABASE_URL 환경 변수가 설정되지 않았습니다. Vercel 프로젝트 Settings > Environment Variables 에 설정해주세요."
  );
}

const databaseUrl = process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
  type: "postgres",
  url: databaseUrl,
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [User, Album, Review, Post, UserFavoriteAlbum, Comment, Like, Report, TodayAlbum],
  ssl:
    databaseUrl.includes("localhost") || databaseUrl.includes("placeholder")
      ? false
      : { rejectUnauthorized: false },
  extra: {
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  },
});
