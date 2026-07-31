/** Resend 메일 발송 */

import { Resend } from "resend";
import { getServerEnv } from "@/src/lib/env";

export type EmailContent = {
  subject: string;
  html: string;
  text: string;
};

let resendClient: Resend | null = null;

function getResend() {
  if (!resendClient) {
    resendClient = new Resend(getServerEnv().resendApiKey);
  }
  return resendClient;
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const env = getServerEnv();
  const { error } = await getResend().emails.send({
    from: env.resendFrom,
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
  if (env.nextAuthUrl) {
    return env.nextAuthUrl.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}
