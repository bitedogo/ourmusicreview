"use client";
/** 회원가입 - 닉네임/이름/성별 입력 필드 */

type Gender = "MALE" | "FEMALE" | "NONE";

interface SignupProfileFieldsProps {
  nickname: string;
  onNicknameChange: (value: string) => void;
  name: string;
  onNameChange: (value: string) => void;
  gender: Gender | "";
  onGenderChange: (value: Gender) => void;
}

export function SignupProfileFields({
  nickname,
  onNicknameChange,
  name,
  onNameChange,
  gender,
  onGenderChange,
}: SignupProfileFieldsProps) {
  return (
    <>
      <div className="space-y-1">
        <label className="flex items-center gap-1 text-sm font-medium">
          <span className="text-red-600">*</span>
          <span>닉네임</span>
        </label>
        <input
          value={nickname}
          onChange={(e) => onNicknameChange(e.target.value)}
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          placeholder="닉네임을 입력하세요"
          autoComplete="nickname"
        />
        <div className="space-y-0.5 text-xs text-zinc-500">
          <p>* 특수문자 및 공백 사용불가</p>
          <p>* 최대 글자 수: 영문 12자 또는 한글 6자</p>
        </div>
      </div>

      <div className="space-y-1">
        <label className="flex items-center gap-1 text-sm font-medium">
          <span className="text-red-600">*</span>
          <span>이름</span>
        </label>
        <input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          placeholder="이름을 입력하세요"
          autoComplete="name"
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-1 text-sm font-medium">
          <span className="text-red-600">*</span>
          <span>성별</span>
        </label>
        <div className="flex flex-wrap gap-4">
          {(["MALE", "FEMALE", "NONE"] as const).map((value) => (
            <label key={value} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="gender"
                value={value}
                checked={gender === value}
                onChange={() => onGenderChange(value)}
                className="h-4 w-4 border-zinc-300"
              />
              <span className="text-sm text-zinc-700">
                {value === "MALE" ? "남성" : value === "FEMALE" ? "여성" : "무응답"}
              </span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
