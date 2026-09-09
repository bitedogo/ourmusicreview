import { describe, expect, it } from "vitest";
import { isAbortError } from "./search";

describe("isAbortError", () => {
  it("AbortError만 중단으로 본다", () => {
    const abort = new Error("Aborted");
    abort.name = "AbortError";
    expect(isAbortError(abort)).toBe(true);
    expect(isAbortError(new Error("network"))).toBe(false);
    expect(isAbortError("AbortError")).toBe(false);
  });
});
