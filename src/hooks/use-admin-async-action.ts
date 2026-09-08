"use client";

import { useRef, useState } from "react";

type AsyncAction = () => Promise<void>;

export function useAdminAsyncAction() {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const processingRef = useRef(new Set<string>());

  async function runAction(
    id: string,
    action: AsyncAction,
    onError: (error: unknown) => void
  ): Promise<boolean> {
    if (processingRef.current.has(id)) return false;

    processingRef.current.add(id);
    setProcessingIds((previous) => new Set(previous).add(id));
    try {
      await action();
      return true;
    } catch (error) {
      onError(error);
      return false;
    } finally {
      processingRef.current.delete(id);
      setProcessingIds((previous) => {
        const next = new Set(previous);
        next.delete(id);
        return next;
      });
    }
  }

  async function confirmAndRun(
    id: string,
    message: string,
    action: AsyncAction,
    onError: (error: unknown) => void
  ): Promise<boolean> {
    if (!window.confirm(message)) return false;
    return runAction(id, action, onError);
  }

  return { processingIds, runAction, confirmAndRun };
}
