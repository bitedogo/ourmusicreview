import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "user_identities", schema: "public" })
@Unique("uq_user_identity_provider_subject", ["provider", "providerSubject"])
export class UserIdentity {
  @PrimaryColumn({ name: "id", type: "varchar", length: 50 })
  id!: string;

  @Column({ name: "user_id", type: "varchar", length: 50 })
  userId!: string;

  @Column({ name: "provider", type: "varchar", length: 30 })
  provider!: string;

  @Column({ name: "provider_subject", type: "varchar", length: 255 })
  providerSubject!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;
}
