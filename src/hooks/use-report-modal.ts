"use client";
/** 신고 모달 열기/닫기·사유·상세·제출 상태 공통 훅 */

import { useState } from "react";

interface UseReportModalParams {
  /** 신고 사유/상세를 받아 실제 제출을 수행. true를 반환하면 모달을 닫는다. */
  onSubmit: (reason: string, detail: string) => Promise<boolean>;
}

export function useReportModal({ onSubmit }: UseReportModalParams) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const open = () => {
    setReason("");
    setDetail("");
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setReason("");
    setDetail("");
  };

  const submit = async () => {
    if (!reason.trim()) {
      alert("신고 사유를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmit(reason, detail);
      if (success) close();
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    reason,
    detail,
    isSubmitting,
    open,
    close,
    setReason,
    setDetail,
    submit,
  };
}
