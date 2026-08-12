/** FAQ API 클라이언트 */

import { fetchJson } from "@/src/lib/http/client";

export interface FaqItemDto {
  id: string;
  question: string;
  answer: string;
}

export async function fetchFaqs(signal?: AbortSignal) {
  return fetchJson<{ ok: true; data: { faqs: FaqItemDto[] } }>("/api/faq", {
    signal,
  });
}
