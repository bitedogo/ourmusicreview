/** 인증 관련 메일 HTML/텍스트 (카드형) */

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function layout(params: {
  title: string;
  headline: string;
  subline?: string;
  bodyHtml: string;
}) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(params.title)}</title>
</head>
<body style="margin:0;padding:0;background:#F3F3F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1A1A1A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F3F3;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-top:3px solid #2B2B2B;border-radius:0 0 4px 4px;">
          <tr>
            <td style="padding:40px 40px 28px;text-align:center;">
              <p style="margin:0;font-size:28px;line-height:1;font-weight:700;letter-spacing:0.12em;color:#43A7B2;">ORU</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 8px;text-align:center;">
              <h1 style="margin:0;font-size:22px;line-height:1.4;font-weight:700;color:#1A1A1A;">${escapeHtml(params.headline)}</h1>
            </td>
          </tr>
          ${
            params.subline
              ? `<tr><td style="padding:0 40px 28px;text-align:center;"><p style="margin:0;font-size:14px;line-height:1.5;color:#6B6B6B;">${escapeHtml(params.subline)}</p></td></tr>`
              : `<tr><td style="padding:0 0 20px;"></td></tr>`
          }
          <tr>
            <td style="padding:0 40px 36px;font-size:15px;line-height:1.7;color:#333333;text-align:left;">
              ${params.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 36px;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#9A9A9A;">본인이 요청하지 않은 메일이라면 무시해 주세요.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function otpBlock(code: string): string {
  return `<div style="margin:24px 0;padding:20px 16px;background:#F7F7F7;border-radius:8px;text-align:center;">
    <p style="margin:0 0 8px;font-size:13px;color:#6B6B6B;">인증번호</p>
    <p style="margin:0;font-size:28px;line-height:1.2;font-weight:700;letter-spacing:0.2em;color:#1A1A1A;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">${escapeHtml(code)}</p>
    <p style="margin:12px 0 0;font-size:12px;color:#9A9A9A;">10분 안에 입력해 주세요</p>
  </div>`;
}

export function verificationEmailContent(params: {
  nickname?: string | null;
  code: string;
}) {
  const name = params.nickname?.trim() || "회원";
  const subject = "[ORU] 이메일 인증번호 안내";
  const text = `${name}님, 안녕하세요.\n\nORU 회원가입을 위한 이메일 인증번호입니다.\n\n인증번호: ${params.code}\n\n회원가입 페이지의 인증번호 입력란에 위 코드를 입력해 주세요. 인증번호는 10분 동안 유효합니다.`;
  const html = layout({
    title: subject,
    headline: "이메일 인증번호 안내",
    subline: "회원가입을 완료하려면 이메일 인증이 필요합니다",
    bodyHtml: `<p style="margin:0 0 12px;">${escapeHtml(name)}님, 안녕하세요.</p>
      <p style="margin:0;">ORU 회원가입을 위한 이메일 인증번호입니다. 아래 영문·숫자 코드를 회원가입 페이지의 인증번호 입력란에 입력해 주세요.</p>
      ${otpBlock(params.code)}
      <p style="margin:0;">인증이 완료된 뒤 회원가입을 이어서 진행할 수 있습니다.</p>`,
  });
  return { subject, html, text };
}

export function findIdEmailContent(params: {
  name?: string | null;
  userId: string;
}) {
  const name = params.name?.trim() || "회원";
  const subject = "[ORU] 아이디 안내";
  const text = `${name}님, 안녕하세요.\n\n요청하신 ORU 계정 아이디는 다음과 같습니다.\n\n아이디: ${params.userId}\n\n로그인 페이지에서 해당 아이디로 로그인해 주세요.`;
  const html = layout({
    title: subject,
    headline: "아이디 안내",
    subline: "요청하신 계정 아이디입니다",
    bodyHtml: `<p style="margin:0 0 12px;">${escapeHtml(name)}님, 안녕하세요.</p>
      <p style="margin:0 0 20px;">요청하신 ORU 계정 아이디를 안내드립니다.</p>
      <div style="margin:0 0 20px;padding:20px 16px;background:#F7F7F7;border-radius:8px;text-align:center;">
        <p style="margin:0 0 8px;font-size:13px;color:#6B6B6B;">아이디</p>
        <p style="margin:0;font-size:24px;line-height:1.3;font-weight:700;color:#1A1A1A;">${escapeHtml(params.userId)}</p>
      </div>
      <p style="margin:0;">로그인 페이지에서 위 아이디로 로그인해 주세요.</p>`,
  });
  return { subject, html, text };
}

export function passwordResetEmailContent(params: {
  name?: string | null;
  code: string;
}) {
  const name = params.name?.trim() || "회원";
  const subject = "[ORU] 비밀번호 재설정 인증번호";
  const text = `${name}님, 안녕하세요.\n\n비밀번호 재설정을 위한 인증번호입니다.\n\n인증번호: ${params.code}\n\n사이트에서 인증번호와 새 비밀번호를 입력해 주세요. 인증번호는 10분 동안 유효합니다.`;
  const html = layout({
    title: subject,
    headline: "비밀번호 재설정 인증번호",
    subline: "새 비밀번호 설정을 위한 인증번호입니다",
    bodyHtml: `<p style="margin:0 0 12px;">${escapeHtml(name)}님, 안녕하세요.</p>
      <p style="margin:0;">비밀번호 재설정을 요청하셨습니다. 아래 인증번호를 비밀번호 재설정 화면에 입력한 뒤 새 비밀번호를 설정해 주세요.</p>
      ${otpBlock(params.code)}
      <p style="margin:0;">본인이 요청하지 않았다면 이 메일을 무시하셔도 됩니다.</p>`,
  });
  return { subject, html, text };
}
