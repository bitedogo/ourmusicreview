/** Resend 메일 발송 (로고 CID 인라인 첨부) */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Resend } from "resend";
import { getServerEnv } from "@/src/lib/env";

export type EmailContent = {
  subject: string;
  html: string;
  text: string;
};

/** 메일 HTML에서 쓰는 인라인 로고 CID */
export const EMAIL_LOGO_CID = "oru-logo";

let resendClient: Resend | null = null;
let logoAttachment:
  | {
      content: string;
      filename: string;
      contentId: string;
      contentType: string;
    }
  | null
  | undefined;

function getResend() {
  if (!resendClient) {
    resendClient = new Resend(getServerEnv().resendApiKey);
  }
  return resendClient;
}

function getLogoAttachment() {
  if (logoAttachment !== undefined) {
    return logoAttachment;
  }

  try {
    const logoPath = join(process.cwd(), "public", "oru_logo.png");
    const content = readFileSync(logoPath).toString("base64");
    logoAttachment = {
      content,
      filename: "oru_logo.png",
      contentId: EMAIL_LOGO_CID,
      contentType: "image/png",
    };
  } catch {
    logoAttachment = null;
  }

  return logoAttachment;
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const env = getServerEnv();
  const logo = getLogoAttachment();

  const { error } = await getResend().emails.send({
    from: env.resendFrom,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    ...(logo
      ? {
          attachments: [
            {
              content: logo.content,
              filename: logo.filename,
              contentId: logo.contentId,
              contentType: logo.contentType,
            },
          ],
        }
      : {}),
  });

  if (error) {
    throw new Error(error.message || "이메일 발송에 실패했습니다.");
  }
}

export async function sendTemplatedEmail(to: string, content: EmailContent) {
  await sendEmail({ to, ...content });
}

export function getAppBaseUrl(): string {
  const env = getServerEnv();
  const nextAuthUrl = env.nextAuthUrl?.trim().replace(/\/$/, "");
  if (nextAuthUrl && !/localhost|127\.0\.0\.1/i.test(nextAuthUrl)) {
    return nextAuthUrl;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim().replace(/\/$/, "");
  if (vercelUrl) {
    return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
  }

  return nextAuthUrl || "http://localhost:3000";
}
