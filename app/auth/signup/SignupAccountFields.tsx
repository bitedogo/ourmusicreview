"use client";
/** 회원가입 - 아이디/비밀번호/이메일 입력 필드 */

import { USER_ID_MAX } from "@/src/lib/auth/user-id";

interface SignupAccountFieldsProps {
  id: string;
  onIdChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  passwordConfirm: string;
  onPasswordConfirmChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
}

export function SignupAccountFields({
  id,
  onIdChange,
  password,
  onPasswordChange,
  passwordConfirm,
  onPasswordConfirmChange,
  email,
  onEmailChange,
}: SignupAccountFieldsProps) {
  return (
    <>
      <div className="space-y-1">
        <label className="flex items-center gap-1 text-sm font-medium">
          <span className="text-red-600">*</span>
          <span>아이디</span>
        </label>
        <input
          value={id}
          onChange={(e) => onIdChange(e.target.value)}
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          placeholder="영문·숫자만 (4~50자)"
          autoComplete="username"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={USER_ID_MAX}
        />
        <p className="text-xs text-zinc-500">
          영문과 숫자만 사용 가능합니다. 4자 이상 50자 이하입니다.
        </p>
      </div>

      <div className="space-y-1">
        <label className="flex items-center gap-1 text-sm font-medium">
          <span className="text-red-600">*</span>
          <span>비밀번호</span>
        </label>
        <input
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          type="password"
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          placeholder="비밀번호를 입력하세요"
          autoComplete="new-password"
        />
        <p className="text-xs text-zinc-500">
          비밀번호는 6자리 이상이어야 하며 영문과 숫자를 반드시 포함해야 합니다.
        </p>
      </div>

      <div className="space-y-1">
        <label className="flex items-center gap-1 text-sm font-medium">
          <span className="text-red-600">*</span>
          <span>비밀번호 확인</span>
        </label>
        <input
          value={passwordConfirm}
          onChange={(e) => onPasswordConfirmChange(e.target.value)}
          type="password"
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          placeholder="비밀번호를 다시 입력하세요"
          autoComplete="new-password"
        />
        <p className="text-xs text-red-600">
          비밀번호 확인이 틀릴 경우, 가입이 진행되지 않습니다.
        </p>
      </div>

      <div className="space-y-1">
        <label className="flex items-center gap-1 text-sm font-medium">
          <span className="text-red-600">*</span>
          <span>이메일 주소</span>
        </label>
        <input
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          type="email"
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          placeholder="이메일을 입력하세요"
          autoComplete="email"
        />
      </div>
    </>
  );
}
