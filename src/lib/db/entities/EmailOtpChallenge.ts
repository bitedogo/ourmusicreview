/** 가입 전 이메일 OTP 챌린지 */

import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({ name: "email_otp_challenges", schema: "public" })
export class EmailOtpChallenge {
  @PrimaryColumn({ name: "email", type: "varchar", length: 255 })
  email!: string;

  @PrimaryColumn({ name: "purpose", type: "varchar", length: 32 })
  purpose!: string;

  @Column({ name: "code_hash", type: "varchar", length: 128 })
  codeHash!: string;

  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt!: Date;

  @Column({
    name: "verified_at",
    type: "timestamptz",
    nullable: true,
  })
  verifiedAt?: Date | null;

  @Column({
    name: "updated_at",
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;
}

export const EMAIL_OTP_PURPOSE_SIGNUP = "signup";
