/** TypeORM DataSource 설정 */

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
import { FeaturedSlideAlbum } from "./entities/FeaturedSlideAlbum";
import { UserSlideAlbum } from "./entities/UserSlideAlbum";
import { Faq } from "./entities/Faq";
import { Playlist } from "./entities/Playlist";
import { PlaylistTrack } from "./entities/PlaylistTrack";
import { Genre } from "./entities/Genre";
import { PlaylistGenre } from "./entities/PlaylistGenre";
import { EmailOtpChallenge } from "./entities/EmailOtpChallenge";
import { UserSanction } from "./entities/UserSanction";
import { BlockedEmail } from "./entities/BlockedEmail";
import { Notification } from "./entities/Notification";

const databaseUrl = process.env.DATABASE_URL ?? "";
const nodeEnv = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test"
  ? process.env.NODE_ENV
  : "development";

if (!databaseUrl.trim()) {
  throw new Error("[ENV] DATABASE_URL 환경 변수가 필요합니다.");
}

export const AppDataSource = new DataSource({
  type: "postgres",
  url: databaseUrl,
  synchronize: false,
  logging: nodeEnv === "development",
  entities: [User, Album, Review, Post, UserFavoriteAlbum, Comment, Like, Report, TodayAlbum, FeaturedSlideAlbum, UserSlideAlbum, Faq, Playlist, PlaylistTrack, Genre, PlaylistGenre, EmailOtpChallenge, UserSanction, BlockedEmail, Notification],
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
