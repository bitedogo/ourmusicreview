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
import { Faq } from "./entities/Faq";
import { getServerEnv } from "@/src/lib/env";

const { databaseUrl, nodeEnv } = getServerEnv();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: databaseUrl,
  synchronize: false,
  logging: nodeEnv === "development",
  entities: [User, Album, Review, Post, UserFavoriteAlbum, Comment, Like, Report, TodayAlbum, FeaturedSlideAlbum, Faq],
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
