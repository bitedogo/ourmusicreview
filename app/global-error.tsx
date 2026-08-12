"use client";
/** 루트 레이아웃 실패 시 전역 에러 바운더리 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          fontFamily:
            "Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
          background: "#fff",
          color: "#505050",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 24,
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 20, margin: 0 }}>문제가 발생했습니다</h1>
          <p style={{ fontSize: 14, color: "#949494", margin: 0 }}>
            페이지를 다시 불러와 주세요.
          </p>
          {process.env.NODE_ENV !== "production" && error?.message ? (
            <p
              style={{
                fontSize: 12,
                color: "#C4C4C4",
                maxWidth: 480,
                wordBreak: "break-word",
              }}
            >
              {error.message}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              border: 0,
              borderRadius: 999,
              background: "#43A7B2",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
