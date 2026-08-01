/** Resend 메일 발송 */

import { Resend } from "resend";
import { getEmailEnv, getServerEnv } from "@/src/lib/env";

export type EmailContent = {
  subject: string;
  html: string;
  text: string;
};

let resendClient: Resend | null = null;

function getResend() {
  if (!resendClient) {
    resendClient = new Resend(getEmailEnv().resendApiKey);
  }
  return resendClient;
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const emailEnv = getEmailEnv();
  const { error } = await getResend().emails.send({
    from: emailEnv.resendFrom,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
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
