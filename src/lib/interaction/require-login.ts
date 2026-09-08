/** 댓글·인터랙션 — 로그인 필요 confirm + 이동 */

const LOGIN_MESSAGE = "로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?";

function confirmLoginRedirect(onRedirect: () => void): boolean {
  if (!confirm(LOGIN_MESSAGE)) return false;
  onRedirect();
  return false;
}

export function ensureLoggedIn(
  isLoggedIn: boolean,
  onRedirect: () => void
): boolean {
  if (isLoggedIn) return true;
  return confirmLoginRedirect(onRedirect);
}
