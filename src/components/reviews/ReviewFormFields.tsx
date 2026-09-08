"use client";

import { type RefObject, useId } from "react";
import {
  TuiEditor,
  type TuiEditorRef,
} from "@/src/components/common/TuiEditor";
import { isEditorContentEmpty } from "@/src/lib/utils/editor";
import { formatRating } from "@/src/lib/utils/rating";

interface ReviewFormFieldsProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  editorRef: RefObject<TuiEditorRef | null>;
  initialValue?: string;
  ratingColor?: string;
  rangeClassName?: string;
  editorLabelClassName?: string;
}

export function getReviewEditorContent(
  editorRef: RefObject<TuiEditorRef | null>
): string | null {
  const content = (editorRef.current?.getHTML() ?? "").trim();
  return isEditorContentEmpty(content) ? null : content;
}

export function ReviewFormFields({
  rating,
  onRatingChange,
  editorRef,
  initialValue,
  ratingColor,
  rangeClassName = "",
  editorLabelClassName = "block",
}: ReviewFormFieldsProps) {
  const ratingId = useId();
  const editorLabelId = useId();

  return (
    <>
      <div className="space-y-1">
        <label
          htmlFor={ratingId}
          className="text-xs font-medium text-[var(--color-text-secondary)]"
        >
          평점 (0-10)
        </label>
        <div className="flex items-center gap-3">
          <input
            id={ratingId}
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={rating}
            onChange={(event) => onRatingChange(Number(event.target.value))}
            aria-valuetext={`${formatRating(rating)}점`}
            className={`flex-1 ${rangeClassName}`}
          />
          <span
            className="w-12 text-center text-sm font-semibold"
            style={ratingColor ? { color: ratingColor } : undefined}
            aria-hidden="true"
          >
            {formatRating(rating)}
          </span>
        </div>
      </div>

      <div className="space-y-1" aria-labelledby={editorLabelId}>
        <span
          id={editorLabelId}
          className={`${editorLabelClassName} text-xs font-medium text-[var(--color-text-secondary)]`}
        >
          리뷰 내용
        </span>
        <TuiEditor
          ref={editorRef}
          initialValue={initialValue}
          height="400px"
          showMediaTools={false}
        />
      </div>
    </>
  );
}
