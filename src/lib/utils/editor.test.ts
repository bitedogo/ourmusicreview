import { describe, expect, it } from "vitest";
import {
  htmlContainsEmbeddedAudio,
  normalizeHtml,
  stripEmbeddedAudio,
} from "./editor";

describe("embedded audio HTML", () => {
  it("audio·source 태그를 감지한다", () => {
    expect(
      htmlContainsEmbeddedAudio('<p><audio src="/a.mp3" controls></audio></p>')
    ).toBe(true);
    expect(htmlContainsEmbeddedAudio('<p><source src="/a.mp3"></p>')).toBe(true);
    expect(htmlContainsEmbeddedAudio("<p>가사만</p>")).toBe(false);
  });

  it("본문에서 audio 태그를 제거하고 빈 p를 맞춘다", () => {
    expect(
      stripEmbeddedAudio(
        '<p><audio controls src="https://cdn.example/a.mp3"></audio></p>'
      )
    ).toBe("<p></p>");
    expect(
      normalizeHtml(
        '<p><audio controls src="https://cdn.example/a.mp3"></audio></p>'
      )
    ).toBe("<p><br></p>");
  });
});
