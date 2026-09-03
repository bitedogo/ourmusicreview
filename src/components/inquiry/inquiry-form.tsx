"use client";
/** 문의 작성 폼 */

import { useEffect, useRef, useState } from "react";
import {
  INQUIRY_BODY_MAX,
  INQUIRY_BODY_MIN,
  INQUIRY_CATEGORIES,
  INQUIRY_TITLE_MAX,
  type InquiryAttachment,
  type InquiryCategory,
} from "@/src/lib/inquiries/types";
import { createInquiryApi } from "@/src/lib/inquiries/client-api";
import { getApiErrorMessage } from "@/src/lib/http/client";
import { InquiryCategoryIcon } from "./inquiry-category-icon";
import { InquiryFileUpload } from "./inquiry-file-upload";

const DRAFT_KEY = "oru-inquiry-draft-v1";

interface InquiryDraft {
  category: InquiryCategory | null;
  email: string;
  contact: string;
  title: string;
  body: string;
}

interface InquiryFormProps {
  defaultEmail: string;
  onSubmitted: () => void;
  onOpenFaq?: () => void;
}

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-accent)]";

export function InquiryForm({ defaultEmail, onSubmitted, onOpenFaq }: InquiryFormProps) {
  const [category, setCategory] = useState<InquiryCategory | null>(null);
  const [email, setEmail] = useState(defaultEmail);
  const emailInitialized = useRef(false);
  const [contact, setContact] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<InquiryAttachment[]>([]);
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (emailInitialized.current) return;
    emailInitialized.current = true;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as InquiryDraft;
      if (draft.category) setCategory(draft.category);
      // draft 이메일 우선, 없으면 defaultEmail 유지
      if (draft.email) setEmail(draft.email);
      if (draft.contact) setContact(draft.contact);
      if (draft.title) setTitle(draft.title);
      if (draft.body) setBody(draft.body);
    } catch {
      /* ignore */
    }
  }, []);

  function saveDraft() {
    const draft: InquiryDraft = { category, email, contact, title, body };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    setDraftSavedAt(new Date().toLocaleTimeString("ko-KR"));
  }

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    setDraftSavedAt(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!category) {
      setError("문의 유형을 선택해 주세요.");
      return;
    }
    if (!consent) {
      setError("문의 처리에 동의해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createInquiryApi({
        category,
        email: email.trim(),
        contact: contact.trim() || undefined,
        title: title.trim(),
        body: body.trim(),
        attachments,
        consent: true,
      });
      clearDraft();
      setCategory(null);
      setContact("");
      setTitle("");
      setBody("");
      setAttachments([]);
      setConsent(false);
      onSubmitted();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "문의 접수에 실패했습니다."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
      <div className="rounded-xl border border-[#E8F3F1] bg-[#F4FBFA] px-4 py-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
        문의 전에{" "}
        {onOpenFaq ? (
          <button
            type="button"
            onClick={onOpenFaq}
            className="font-medium text-[var(--color-accent)] underline"
          >
            자주 묻는 질문
          </button>
        ) : (
          <a href="/faq" className="font-medium text-[var(--color-accent)] underline">
            자주 묻는 질문
          </a>
        )}
        을 먼저 확인해 주세요. 영업일 기준 1~2일 내 순차적으로 답변드립니다.
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
          문의 유형
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {INQUIRY_CATEGORIES.map((item) => {
            const selected = category === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setCategory(item.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center transition ${
                  selected
                    ? "border-[var(--color-accent)] bg-[var(--color-inquiry-bg)] text-[var(--color-inquiry-text-dark)] shadow-sm"
                    : "border-zinc-200 bg-white text-[var(--color-text-secondary)] hover:border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                <InquiryCategoryIcon category={item.value} />
                <span className="text-xs font-semibold">{item.label}</span>
                <span className="text-[10px] leading-tight text-[var(--color-text-muted)]">
                  {item.hint}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
            이메일 <span className="text-red-500">*</span>
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
            placeholder="답변 받을 이메일"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
            연락처
          </span>
          <input
            type="text"
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            className={inputClass}
            placeholder="긴급 연락 시 활용 (선택)"
            maxLength={40}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
          제목 <span className="text-red-500">*</span>
        </span>
        <input
          type="text"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={inputClass}
          placeholder="문의 제목을 입력해 주세요."
          maxLength={INQUIRY_TITLE_MAX}
        />
      </label>

      <label className="block">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">
            내용 <span className="text-red-500">*</span>
          </span>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            MIN {INQUIRY_BODY_MIN} · MAX {INQUIRY_BODY_MAX}
          </span>
        </div>
        <textarea
          required
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className={`${inputClass} min-h-[10rem] resize-y`}
          placeholder="문의 내용을 자세히 적어 주세요. 버그 신고 시 재현 방법·브라우저·기기 정보도 함께 적어 주시면 빠른 확인이 가능합니다."
          maxLength={INQUIRY_BODY_MAX}
        />
        <p className="mt-1 text-right text-[11px] text-[var(--color-text-muted)]">
          {body.length} / {INQUIRY_BODY_MAX}
        </p>
      </label>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
          첨부 파일
        </h2>
        <InquiryFileUpload
          attachments={attachments}
          onChange={setAttachments}
          disabled={isSubmitting}
        />
      </section>

      <label className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5"
        />
        <span>
          문의 처리를 위해 입력된 개인정보를 이용하는 것에 동의합니다.
        </span>
      </label>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center">
        <p className="text-xs text-[var(--color-text-muted)]">
          {draftSavedAt ? `임시저장됨 · ${draftSavedAt}` : "작성 중인 내용을 임시저장할 수 있습니다."}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={saveDraft}
            disabled={isSubmitting}
            className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition hover:bg-zinc-50 disabled:opacity-60"
          >
            임시저장
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-[var(--color-text-primary)] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? "접수 중..." : "문의 접수"}
          </button>
        </div>
      </div>
    </form>
  );
}
