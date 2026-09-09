import type { DataSource, EntityManager } from "typeorm";
import {
  hashToken,
  normalizeOtpInput,
  OTP_CODE_LENGTH,
  SIGNUP_VERIFIED_TTL_MS,
} from "@/src/lib/auth/email-tokens";
import { EMAIL_OTP_PURPOSE_SIGNUP } from "@/src/lib/db/entities/EmailOtpChallenge";

type QueryExecutor = Pick<DataSource | EntityManager, "query">;

export const SIGNUP_EMAIL_NOT_VERIFIED_MESSAGE =
  "이메일 인증을 완료한 뒤 회원가입을 진행해 주세요.";

function parseCode(raw: string): string | null {
  const code = normalizeOtpInput(raw);
  return code.length === OTP_CODE_LENGTH ? code : null;
}

export async function consumeVerifiedSignupEmailChallenge(
  executor: QueryExecutor,
  email: string,
): Promise<boolean> {
  const rows = await executor.query<Array<{ email: string }>>(
    `
      DELETE FROM public.email_otp_challenges
      WHERE email = $1
        AND purpose = $2
        AND verified_at IS NOT NULL
        AND verified_at >= now() - ($3 * interval '1 millisecond')
      RETURNING email
    `,
    [email, EMAIL_OTP_PURPOSE_SIGNUP, SIGNUP_VERIFIED_TTL_MS],
  );
  return rows.length > 0;
}

export async function consumePasswordResetOtp(
  executor: QueryExecutor,
  input: {
    id: string;
    email: string;
    rawCode: string;
    passwordHash: string;
  },
): Promise<boolean> {
  const code = parseCode(input.rawCode);
  if (!code) return false;

  const rows = await executor.query<Array<{ user_id: string }>>(
    `
      UPDATE public.users
      SET password = $1,
          password_reset_token = NULL,
          password_reset_expires_at = NULL
      WHERE user_id = $2
        AND lower(email) = lower($3)
        AND password_reset_token = $4
        AND password_reset_expires_at > now()
      RETURNING user_id
    `,
    [input.passwordHash, input.id, input.email, hashToken(code)],
  );
  return rows.length > 0;
}

export async function consumeEmailVerificationOtp(
  executor: QueryExecutor,
  input: { email: string; rawCode: string },
): Promise<boolean> {
  const code = parseCode(input.rawCode);
  if (!code) return false;

  const rows = await executor.query<Array<{ user_id: string }>>(
    `
      UPDATE public.users
      SET email_verified_at = now(),
          email_verification_token = NULL,
          email_verification_expires_at = NULL
      WHERE lower(email) = lower($1)
        AND email_verified_at IS NULL
        AND email_verification_token = $2
        AND email_verification_expires_at > now()
      RETURNING user_id
    `,
    [input.email, hashToken(code)],
  );
  return rows.length > 0;
}
