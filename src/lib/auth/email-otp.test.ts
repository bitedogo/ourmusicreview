import { describe, expect, it, vi } from "vitest";
import type { DataSource } from "typeorm";
import { hashToken, SIGNUP_VERIFIED_TTL_MS } from "./email-tokens";
import {
  consumeEmailVerificationOtp,
  consumePasswordResetOtp,
  consumeVerifiedSignupEmailChallenge,
} from "./email-otp-consume";

function queryExecutor(rows: unknown[]) {
  const query = vi.fn().mockResolvedValue(rows);
  return {
    executor: { query } as unknown as DataSource,
    query,
  };
}

describe("원자적 OTP 소비", () => {
  it("검증된 가입 challenge를 유효시간 조건과 함께 삭제한다", async () => {
    const { executor, query } = queryExecutor([{ email: "user@example.com" }]);

    await expect(
      consumeVerifiedSignupEmailChallenge(executor, "user@example.com"),
    ).resolves.toBe(true);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM public.email_otp_challenges"),
      ["user@example.com", "signup", SIGNUP_VERIFIED_TTL_MS],
    );
  });

  it("비밀번호 재설정 토큰을 새 비밀번호 저장과 동시에 소비한다", async () => {
    const { executor, query } = queryExecutor([{ user_id: "user" }]);

    await expect(
      consumePasswordResetOtp(executor, {
        id: "user",
        email: "user@example.com",
        rawCode: "ABC123",
        passwordHash: "new-hash",
      }),
    ).resolves.toBe(true);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("password_reset_expires_at > now()"),
      ["new-hash", "user", "user@example.com", hashToken("ABC123")],
    );
  });

  it("이미 소비됐거나 만료된 이메일 인증 토큰은 실패한다", async () => {
    const { executor, query } = queryExecutor([]);

    await expect(
      consumeEmailVerificationOtp(executor, {
        email: "user@example.com",
        rawCode: "ABC123",
      }),
    ).resolves.toBe(false);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("email_verification_expires_at > now()"),
      ["user@example.com", hashToken("ABC123")],
    );
  });
});
