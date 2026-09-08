import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGuideGateToken,
  isGuideGatePassword,
  isGuideGateTokenValid,
  safeGuideNextPath,
} from "./gate";

describe("guide gate", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("환경변수가 없으면 기본 비밀번호를 허용하지 않는다", () => {
    vi.stubEnv("GUIDE_GATE_PASSWORD", "");
    expect(isGuideGatePassword("123456")).toBe(false);
  });

  it("만료가 포함된 서명 토큰만 허용한다", async () => {
    vi.stubEnv("GUIDE_GATE_PASSWORD", "test-password");
    vi.stubEnv("GUIDE_GATE_SECRET", "test-signing-secret");
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const token = await createGuideGateToken();
    expect(await isGuideGateTokenValid(token)).toBe(true);

    vi.setSystemTime(new Date("2026-02-01T00:00:01Z"));
    expect(await isGuideGateTokenValid(token)).toBe(false);
  });

  it("가이드 내부 경로만 redirect 대상으로 허용한다", () => {
    expect(safeGuideNextPath("/developer/api")).toBe("/developer/api");
    expect(safeGuideNextPath("https://evil.example")).toBe("/designer");
  });
});
