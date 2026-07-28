/** 관리자 리뷰 승인 화면 공통 포맷 유틸 */

export function formatReviewDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}
