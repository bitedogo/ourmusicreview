/** 회원가입·비밀번호 등 인증 입력 검증 */

export function sanitizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) {
    return "비밀번호는 6자리 이상이어야 합니다.";
  }
  if (!/.*[a-zA-Z].*/.test(password) || !/.*[0-9].*/.test(password)) {
    return "비밀번호는 영문과 숫자를 반드시 포함해야 합니다.";
  }
  return null;
}

export function validateNickname(nickname: string): string | null {
  if (!nickname) return "닉네임을 입력해주세요.";
  if (/[^a-zA-Z0-9가-힣]/.test(nickname)) {
    return "특수문자 및 공백 사용불가";
  }
  const koreanCount = (nickname.match(/[가-힣]/g) || []).length;
  const englishCount = (nickname.match(/[a-zA-Z]/g) || []).length;
  const otherCount = nickname.length - koreanCount - englishCount;
  if (koreanCount > 0 && koreanCount > 6) {
    return "최대 글자 수: 한글 6자";
  }
  if (englishCount + otherCount > 12) {
    return "최대 글자 수: 영문 12자";
  }
  return null;
}

export function validateName(name: string): string | null {
  if (!name) return "이름을 입력해주세요.";
  if (name.length > 30) return "이름은 30자 이하로 입력해주세요.";
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email) return "이메일을 입력해주세요.";
  if (email.length > 255) return "이메일은 255자 이하로 입력해주세요.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "올바른 이메일 형식이 아닙니다.";
  }
  return null;
}

export function isBcryptHash(value: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}
