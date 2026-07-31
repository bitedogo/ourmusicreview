"use client";
/** 회원가입 - 아이디/비밀번호/이메일(+인증) 입력 필드 */

import { USER_ID_MAX } from "@/src/lib/auth/user-id";
import { normalizeOtpInput, OTP_CODE_LENGTH } from "@/src/lib/auth/otp-input";

interface SignupAccountFieldsProps {
  id: string;
  onIdChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  passwordConfirm: string;
  onPasswordConfirmChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  emailCode: string;
  onEmailCodeChange: (value: string) => void;
  isEmailVerified: boolean;
  emailStatusMessage: string | null;
  emailErrorMessage: string | null;
  isSendingEmailCode: boolean;
  isConfirmingEmailCode: boolean;
  onSendEmailCode: () => void;
  onConfirmEmailCode: () => void;
}

const inputClassName =
  "w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500";

export function SignupAccountFields({
  id,
  onIdChange,
  password,
  onPasswordChange,
  passwordConfirm,
  onPasswordConfirmChange,
  email,
  onEmailChange,
  emailCode,
  onEmailCodeChange,
  isEmailVerified,
  emailStatusMessage,
  emailErrorMessage,
  isSendingEmailCode,
  isConfirmingEmailCode,
  onSendEmailCode,
  onConfirmEmailCode,
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
          className={inputClassName}
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
          className={inputClassName}
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
          className={inputClassName}
          placeholder="비밀번호를 다시 입력하세요"
          autoComplete="new-password"
        />
        <p className="text-xs text-red-600">
          비밀번호 확인이 틀릴 경우, 가입이 진행되지 않습니다.
        </p>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-1 text-sm font-medium">
          <span className="text-red-600">*</span>
          <span>이메일 주소</span>
          {isEmailVerified && (
            <span className="ml-2 text-xs font-medium text-emerald-600">
              인증 완료
            </span>
          )}
        </label>
        <div className="flex gap-2">
          <input
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            type="email"
            className={`${inputClassName} min-w-0 flex-1`}
            placeholder="이메일을 입력하세요"
            autoComplete="email"
            disabled={isEmailVerified}
          />
          <button
            type="button"
            onClick={onSendEmailCode}
            disabled={isSendingEmailCode || isEmailVerified || !email.trim()}
            className="shrink-0 rounded-lg bg-[var(--color-brand-primary)] px-3 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-brand-primary-hover)] disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {isSendingEmailCode
              ? "발송 중..."
              : isEmailVerified
                ? "인증됨"
                : "이메일 인증"}
          </button>
        </div>

        {!isEmailVerified && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                value={emailCode}
                onChange={(e) =>
                  onEmailCodeChange(normalizeOtpInput(e.target.value))
                }
                className={`${inputClassName} min-w-0 flex-1 tracking-[0.2em]`}
                placeholder={`인증번호 ${OTP_CODE_LENGTH}자리 (영문·숫자)`}
                autoComplete="one-time-code"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={OTP_CODE_LENGTH}
              />
              <button
                type="button"
                onClick={onConfirmEmailCode}
                disabled={
                  isConfirmingEmailCode ||
                  emailCode.length !== OTP_CODE_LENGTH ||
                  !email.trim()
                }
                className="shrink-0 rounded-lg border border-[var(--color-brand-primary)] px-3 py-2 text-sm font-medium text-[var(--color-brand-primary)] transition hover:bg-[#EAF6F7] disabled:cursor-not-allowed disabled:border-zinc-300 disabled:text-zinc-400"
              >
                {isConfirmingEmailCode ? "확인 중..." : "확인"}
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              이메일 인증을 누르면 인증번호가 발송됩니다. 메일 속 영문·숫자
              코드를 입력한 뒤 확인해 주세요.
            </p>
          </div>
        )}

        {emailStatusMessage && (
          <p className="text-xs text-emerald-600">{emailStatusMessage}</p>
        )}
        {emailErrorMessage && (
          <p className="text-xs text-red-600">{emailErrorMessage}</p>
        )}
      </div>
    </>
  );
}
