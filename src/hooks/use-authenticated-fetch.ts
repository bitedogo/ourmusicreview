"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApiClientError,
  fetchJson,
  getApiErrorMessage,
} from "@/src/lib/http/client";

export function useAuthenticatedFetch<T extends { ok: boolean }>(url: string, callbackPath: string) {
  const router = useRouter();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchJson<T>(url);
        setData(result);
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 401) {
          router.push(`/auth/signin?callbackUrl=${callbackPath}`);
          return;
        }
        setError(getApiErrorMessage(err, "데이터를 불러오는 중 오류가 발생했습니다."));
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [url, callbackPath, router]);

  return { data, isLoading, error };
}
