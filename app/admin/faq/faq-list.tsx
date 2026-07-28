"use client";
/** FAQ 목록(드래그 정렬, 수정/삭제) 컴포넌트 */

import { FaqEditForm } from "./faq-form";
import type { FaqItem } from "./types";

interface FaqListProps {
  faqs: FaqItem[];
  editingId: string | null;
  editForm: { question: string; answer: string };
  draggingId: string | null;
  isReordering: boolean;
  isSubmitting: boolean;
  onEditFormChange: (value: { question: string; answer: string }) => void;
  onStartEdit: (faq: FaqItem) => void;
  onCancelEdit: () => void;
  onSubmitEdit: (event: React.FormEvent) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDrop: (id: string) => void;
  onDragEnd: () => void;
}

export function FaqList({
  faqs,
  editingId,
  editForm,
  draggingId,
  isReordering,
  isSubmitting,
  onEditFormChange,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit,
  onDelete,
  onDragStart,
  onDrop,
  onDragEnd,
}: FaqListProps) {
  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <div
          key={faq.id}
          draggable={editingId !== faq.id && !isReordering}
          onDragStart={() => onDragStart(faq.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(faq.id)}
          onDragEnd={onDragEnd}
          className={`rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm ${
            editingId !== faq.id ? "cursor-grab active:cursor-grabbing" : ""
          } ${draggingId === faq.id ? "opacity-60" : ""}`}
        >
          {editingId === faq.id ? (
            <FaqEditForm
              value={editForm}
              onChange={onEditFormChange}
              onSubmit={onSubmitEdit}
              onCancel={onCancelEdit}
              isSubmitting={isSubmitting}
            />
          ) : (
            <>
              <p className="font-semibold text-zinc-900">{faq.question}</p>
              <p className="mt-1 text-sm text-zinc-600 whitespace-pre-wrap">
                {faq.answer}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onStartEdit(faq)}
                  className="text-xs font-medium text-zinc-500 hover:text-[var(--color-brand-primary)]"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(faq.id)}
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
  );
}
