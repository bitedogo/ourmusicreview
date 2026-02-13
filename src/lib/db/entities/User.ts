import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "users", schema: "public" })
export class User {
  @PrimaryColumn({ name: "user_id", type: "varchar", length: 50 })
  id!: string;

  @Column({ name: "password", type: "varchar", length: 100 })
  password!: string;

  @Column({ name: "nickname", type: "varchar", length: 50 })
  nickname!: string;

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
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt!: Date;
}
