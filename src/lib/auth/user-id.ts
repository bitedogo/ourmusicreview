/** 세션에서 유저 ID 추출 유틸 */

export const USER_ID_MIN = 4;
export const USER_ID_MAX = 50;

export function validateUserId(userId: string): string | null {
  if (!userId) return "아이디를 입력해주세요.";
  if (userId.length < USER_ID_MIN || userId.length > USER_ID_MAX) {
    return `아이디는 ${USER_ID_MIN}자 이상 ${USER_ID_MAX}자 이하여야 합니다.`;
  }
  if (!/^[a-zA-Z0-9]+$/.test(userId)) {
    return "아이디는 영문과 숫자만 사용할 수 있습니다.";
  }
  return null;
}
