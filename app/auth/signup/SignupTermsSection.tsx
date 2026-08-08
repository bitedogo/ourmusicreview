"use client";
/** 회원가입 - 이용약관 동의 섹션 */

import dynamic from "next/dynamic";

const TermsContent = dynamic(
  () => import("@/src/components/app/TermsContent").then((module) => module.TermsContent),
  {
    loading: () => <p className="text-xs text-[var(--color-text-secondary)]">약관을 불러오는 중...</p>,
  }
);

interface SignupTermsSectionProps {
  agreed: boolean;
  onAgreedChange: (agreed: boolean) => void;
}

export function SignupTermsSection({ agreed, onAgreedChange }: SignupTermsSectionProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-[var(--color-text-primary)]"><span className="text-red-600">*</span> 이용약관</h2>
      <div className="max-h-64 overflow-y-auto rounded border border-zinc-200 bg-zinc-50 p-4">
        <TermsContent />
      </div>
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onAgreedChange(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300"
        />
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          이용약관에 동의합니다
        </span>
      </label>
    </div>
  );
}
