import { describe, expect, it } from "vitest";
import {
  buildPostLoginHref,
  buildSigninHref,
  resolveAuthCallbackUrl,
  resolveLoginLandingUrl,
} from "./callback-url";

describe("resolveAuthCallbackUrl", () => {
  it("없으면 홈으로 보낸다", () => {
    expect(resolveAuthCallbackUrl(null)).toBe("/");
    expect(resolveAuthCallbackUrl("")).toBe("/");
  });

  it("사이트 안 경로는 그대로 둔다", () => {
    expect(resolveAuthCallbackUrl("/profile")).toBe("/profile");
    expect(resolveAuthCallbackUrl("/community/write?category=K")).toBe(
      "/community/write?category=K"
    );
  });

  it("외부·프로토콜 상대 URL은 막는다", () => {
    expect(resolveAuthCallbackUrl("//evil.example")).toBe("/");
    expect(resolveAuthCallbackUrl("https://evil.example/phish")).toBe("/");
    expect(resolveAuthCallbackUrl("http://evil.example")).toBe("/");
  });

  it("같은 사이트 절대 URL은 경로만 남긴다", () => {
    expect(resolveAuthCallbackUrl("http://localhost:3000/inquiry")).toBe(
      "/inquiry"
    );
  });

  it("로그인·가입·로그인 직후 페이지로 다시 가면 홈으로 보낸다", () => {
    expect(resolveAuthCallbackUrl("/auth/signin")).toBe("/");
    expect(resolveAuthCallbackUrl("/auth/signin?foo=1")).toBe("/");
    expect(resolveAuthCallbackUrl("/auth/signup")).toBe("/");
    expect(resolveAuthCallbackUrl("/auth/post-login")).toBe("/");
  });
});

describe("buildSigninHref", () => {
  it("복귀 주소가 있으면 쿼리에 넣는다", () => {
    expect(buildSigninHref("/profile/edit")).toBe(
      "/auth/signin?callbackUrl=%2Fprofile%2Fedit"
    );
  });

  it("홈이면 쿼리 없이 로그인만 연다", () => {
    expect(buildSigninHref("/")).toBe("/auth/signin");
    expect(buildSigninHref(null)).toBe("/auth/signin");
  });
});

describe("resolveLoginLandingUrl", () => {
  it("관리자는 관리 홈으로 보낸다", () => {
    expect(resolveLoginLandingUrl("ADMIN", "/inquiry")).toBe("/admin");
    expect(resolveLoginLandingUrl("ADMIN", "/")).toBe("/admin");
  });

  it("일반 회원은 복귀 주소를 쓴다", () => {
    expect(resolveLoginLandingUrl("USER", "/inquiry")).toBe("/inquiry");
    expect(resolveLoginLandingUrl(undefined, "/inquiry")).toBe("/inquiry");
  });
});

describe("buildPostLoginHref", () => {
  it("복귀 주소가 있으면 next에 넣는다", () => {
    expect(buildPostLoginHref("/inquiry")).toBe(
      "/auth/post-login?next=%2Finquiry"
    );
  });

  it("홈이면 쿼리 없이 연다", () => {
    expect(buildPostLoginHref("/")).toBe("/auth/post-login");
  });
});
