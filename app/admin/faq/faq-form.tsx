"use client";
/** FAQ 등록/수정 폼 컴포넌트 */

interface FaqFormValue {
  question: string;
  answer: string;
}

interface FaqAddFormProps {
  value: FaqFormValue;
  onChange: (value: FaqFormValue) => void;
  onSubmit: (event: React.FormEvent) => void;
  isSubmitting: boolean;
}

export function FaqAddForm({ value, onChange, onSubmit, isSubmitting }: FaqAddFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">질문</label>
          <input
            value={value.question}
            onChange={(e) => onChange({ ...value, question: e.target.value })}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            placeholder="질문을 입력하세요"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">답변</label>
          <textarea
            value={value.answer}
            onChange={(e) => onChange({ ...value, answer: e.target.value })}
            rows={4}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            placeholder="답변을 입력하세요"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {isSubmitting ? "등록 중..." : "등록"}
        </button>
      </div>
    </form>
  );
}

interface FaqEditFormProps {
  value: FaqFormValue;
  onChange: (value: FaqFormValue) => void;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function FaqEditForm({ value, onChange, onSubmit, onCancel, isSubmitting }: FaqEditFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        value={value.question}
        onChange={(e) => onChange({ ...value, question: e.target.value })}
        className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
        placeholder="질문"
      />
      <textarea
        value={value.answer}
        onChange={(e) => onChange({ ...value, answer: e.target.value })}
        rows={4}
        className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
        placeholder="답변"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          저장
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] hover:bg-zinc-50"
        >
          취소
        </button>
      </div>
    </form>
  );
}
