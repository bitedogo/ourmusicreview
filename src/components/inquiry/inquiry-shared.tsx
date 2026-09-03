/** ë¬¸ì˜ ?ì„¸Â·ê´€ë¦¬ì ?‘ìª½?ì„œ ê³µìš©?¼ë¡œ ?°ëŠ” UI ì¡°ê° */

import type { InquiryReplyItem } from "@/src/lib/inquiries/client-api";
import type { InquiryAttachment } from "@/src/lib/inquiries/types";
import { formatDateTime } from "@/src/lib/utils/date";

/** ì²¨ë??Œì¼ ë§í¬ ëª©ë¡ */
export function InquiryAttachmentList({ files }: { files: InquiryAttachment[] }) {
  if (files.length === 0) return null;
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {files.map((file) => (
        <li key={file.url}>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-full border border-zinc-200 px-3 py-1 text-xs text-[var(--color-accent)] hover:bg-zinc-50"
          >
            {file.name}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** ?µë? ?¤ë ˆ???¨ì¼ ì¹´ë“œ */
export function InquiryReplyCard({ reply }: { reply: InquiryReplyItem }) {
  return (
    <article
      className={`rounded-2xl border p-6 shadow-sm ${
        reply.isAdmin
          ? "border-[var(--color-inquiry-border)] bg-[var(--color-inquiry-bg)]"
          : "border-zinc-200 bg-white"
      }`}
    >
      <p className="mb-2 text-xs font-semibold text-[var(--color-text-muted)]">
        {reply.isAdmin ? "?´ì˜???µë?" : "ì¶”ê? ë¬¸ì˜"}
      </p>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-primary)]">
        {reply.body}
      </p>
      <p className="mt-3 text-[11px] text-[var(--color-text-muted)]">
        {formatDateTime(reply.createdAt)}
      </p>
    </article>
  );
}

/** ?µë? ?¤ë ˆ???„ì²´ ëª©ë¡ */
export function InquiryReplyThread({ replies }: { replies: InquiryReplyItem[] }) {
  if (replies.length === 0) return null;
  return (
    <div className="space-y-4">
      {replies.map((reply) => (
        <InquiryReplyCard key={reply.id} reply={reply} />
      ))}
    </div>
  );
}

