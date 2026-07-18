/** User 엔티티 */

import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "users", schema: "public" })
export class User {
  @PrimaryColumn({ name: "user_id", type: "varchar", length: 50 })
  id!: string;

  @Column({ name: "password", type: "varchar", length: 100, nullable: true })
  password?: string | null;

  @Column({ name: "nickname", type: "varchar", length: 50 })
  nickname!: string;

  @Column({
    name: "name",
    type: "varchar",
    length: 50,
    nullable: true,
  })
  name?: string | null;

  @Column({ name: "email", type: "varchar", length: 255 })
  email!: string;

  @Column({
    name: "profile_image",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  profileImage?: string | null;

  @Column({
    name: "role",
    type: "varchar",
    length: 20,
    default: () => "'USER'",
  })
  role!: "USER" | "ADMIN";

  @Column({
    name: "gender",
    type: "varchar",
    length: 10,
    nullable: true,
  })
  gender?: "MALE" | "FEMALE" | "NONE" | null;

  @Column({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt!: Date;

  @Column({
    name: "show_reviews_public",
    type: "varchar",
    length: 1,
    default: () => "'Y'",
  })
  showReviewsPublic!: "Y" | "N";

  @Column({
    name: "show_favorites_public",
    type: "varchar",
    length: 1,
    default: () => "'Y'",
  })
  showFavoritesPublic!: "Y" | "N";

  @Column({
    name: "show_masterpieces_public",
    type: "varchar",
    length: 1,
    default: () => "'Y'",
  })
  showMasterpiecesPublic!: "Y" | "N";

  @Column({
    name: "show_rating_public",
    type: "varchar",
    length: 1,
    default: () => "'Y'",
  })
  showRatingPublic!: "Y" | "N";
}
