"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { reorderById } from "@/src/lib/utils/reorder";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

interface FaqListResponse {
  ok: true;
  faqs: FaqItem[];
}

export function FaqManagementClient() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ question: "", answer: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  async function fetchFaqs() {
    try {
      const data = await fetchJson<FaqListResponse>("/api/faq");
      setFaqs(data.faqs);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "FAQ 목록을 불러오는 중 오류가 발생했습니다."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchFaqs();
  }, []);

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    const q = newFaq.question.trim();
    const a = newFaq.answer.trim();
    if (!q || !a) {
      setErrorMessage("질문과 답변을 모두 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await fetchJson<{ ok: true; id: string }>("/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, answer: a }),
      });
      setNewFaq({ question: "", answer: "" });
      setShowAddForm(false);
      await fetchFaqs();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "등록 중 오류가 발생했습니다."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(event: React.FormEvent) {
    event.preventDefault();
    if (!editingId) return;
    const q = editForm.question.trim();
    const a = editForm.answer.trim();
    if (!q || !a) {
      setErrorMessage("질문과 답변을 모두 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await fetchJson<{ ok: true }>(`/api/faq/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, answer: a }),
      });
      setEditingId(null);
      setEditForm({ question: "", answer: "" });
      await fetchFaqs();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "수정 중 오류가 발생했습니다."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("이 FAQ를 삭제하시겠습니까?")) return;
    try {
      await fetchJson<{ ok: true }>(`/api/faq/${id}`, { method: "DELETE" });
      await fetchFaqs();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "삭제 중 오류가 발생했습니다."));
    }
  }

  function getReorderedFaqs(sourceId: string, targetId: string): FaqItem[] {
    return reorderById(faqs, sourceId, targetId);
  }

  async function saveFaqOrder(nextFaqs: FaqItem[]) {
    setIsReordering(true);
    const previousFaqs = faqs;
    setFaqs(
      nextFaqs.map((faq, index) => ({
        ...faq,
        sortOrder: index + 1,
      }))
    );
    try {
      await fetchJson<{ ok: true }>("/api/faq", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: nextFaqs.map((faq) => faq.id) }),
      });
    } catch (err) {
      setFaqs(previousFaqs);
      setErrorMessage(
        getApiErrorMessage(err, "FAQ 순서 저장 중 오류가 발생했습니다.")
      );
    } finally {
      setIsReordering(false);
      setDraggingId(null);
    }
  }

  async function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) return;
    const nextFaqs = getReorderedFaqs(draggingId, targetId);
    if (nextFaqs === faqs) return;
    await saveFaqOrder(nextFaqs);
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-zinc-500">
        FAQ를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">FAQ 관리</h1>
        <div className="flex gap-2">
          <Link
            href="/faq"
            className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            FAQ 목록 보기
          </Link>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            {showAddForm ? "취소" : "FAQ 추가"}
          </button>
        </div>
      </div>
      <p className="text-xs text-zinc-500">
        FAQ 항목을 드래그해서 표시 순서를 변경할 수 있습니다.
      </p>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {errorMessage}
        </div>
      )}

      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700">질문</label>
              <input
                value={newFaq.question}
                onChange={(e) => setNewFaq((p) => ({ ...p, question: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                placeholder="질문을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">답변</label>
              <textarea
                value={newFaq.answer}
                onChange={(e) => setNewFaq((p) => ({ ...p, answer: e.target.value }))}
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
      )}

      <div className="space-y-3">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            draggable={editingId !== faq.id && !isReordering}
            onDragStart={() => setDraggingId(faq.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(faq.id)}
            onDragEnd={() => setDraggingId(null)}
            className={`rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm ${
              editingId !== faq.id ? "cursor-grab active:cursor-grabbing" : ""
            } ${draggingId === faq.id ? "opacity-60" : ""}`}
          >
            {editingId === faq.id ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <input
                  value={editForm.question}
                  onChange={(e) => setEditForm((p) => ({ ...p, question: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                  placeholder="질문"
                />
                <textarea
                  value={editForm.answer}
                  onChange={(e) => setEditForm((p) => ({ ...p, answer: e.target.value }))}
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
                    onClick={() => {
                      setEditingId(null);
                      setEditForm({ question: "", answer: "" });
                    }}
                    className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  >
                    취소
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="font-semibold text-zinc-900">{faq.question}</p>
                <p className="mt-1 text-sm text-zinc-600 whitespace-pre-wrap">
                  {faq.answer}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(faq.id);
                      setEditForm({ question: faq.question, answer: faq.answer });
                    }}
                    className="text-xs font-medium text-zinc-500 hover:text-[var(--color-brand-primary)]"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(faq.id)}
                    className="text-xs font-medium text-red-500 hover:text-[var(--color-brand-primary)]"
                  >
                    삭제
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {faqs.length === 0 && !showAddForm && (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-500">
          등록된 FAQ가 없습니다. FAQ 추가 버튼을 눌러 등록해주세요.
        </div>
      )}
    </div>
  );
}
