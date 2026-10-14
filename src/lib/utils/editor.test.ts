import { describe, expect, it } from "vitest";
import {
  getFirstHtmlImageSrc,
  getHtmlExcerpt,
  getHtmlPreview,
  htmlContainsEmbeddedAudio,
  normalizeHtml,
  plainTextToEditorHtml,
  stripEmbeddedAudio,
  titleFromPlainBody,
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

  it("첫 이미지 src와 본문 미리보기를 뽑는다", () => {
    expect(
      getFirstHtmlImageSrc(
        '<p>글</p><img alt="cover" src="https://cdn.example/a.jpg">'
      )
    ).toBe("https://cdn.example/a.jpg");
    expect(getFirstHtmlImageSrc('<img src="data:image/png;base64,abc">')).toBe(
      null
    );
    expect(getHtmlExcerpt("<p>짧은 글</p>")).toBe("짧은 글");
    expect(getHtmlExcerpt(`<p>${"가".repeat(141)}</p>`)).toBe(
      `${"가".repeat(140)}…`
    );
    expect(
      getHtmlPreview(
        '<p>첫 줄</p><p><strong>굵게</strong></p><img src="https://cdn.example/a.jpg">'
      )
    ).toBe("<p>첫 줄</p><p><strong>굵게</strong></p>");
    expect(
      getHtmlPreview('<p>링크는 <a href="/x">텍스트</a>만</p>')
    ).toBe("<p>링크는 텍스트만</p>");
    expect(getHtmlPreview("<p>첫 줄</p><p><br></p><p>둘째</p>")).toBe(
      "<p>첫 줄</p><p><br></p><p>둘째</p>"
    );
    expect(getHtmlPreview("<p></p><p><br></p>")).toBe("");
  });

  it("짧은 작성칸 본문에서 제목과 HTML을 만든다", () => {
    expect(titleFromPlainBody("첫 줄\n둘째")).toBe("첫 줄");
    expect(titleFromPlainBody("\n\n  둘째")).toBe("둘째");
    expect(titleFromPlainBody("가".repeat(70))).toBe("가".repeat(60));
    expect(plainTextToEditorHtml("안녕")).toBe("<p>안녕</p>");
    expect(plainTextToEditorHtml("a\n\nb")).toBe(
      "<p>a</p><p><br></p><p>b</p>"
    );
    expect(plainTextToEditorHtml("  ")).toBe("");
    expect(plainTextToEditorHtml("<hi>")).toBe("<p>&lt;hi&gt;</p>");
  });
});
