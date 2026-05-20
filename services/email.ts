/**
 * Microsoft Graph API — Send Mail (app-only)
 *
 * Required Azure AD application permission:
 *   - Mail.Send
 *
 * The "from" address must be a mailbox in the tenant.
 * Set MAIL_SENDER_ADDRESS to the shared/service mailbox (e.g. noreply@yourcompany.com).
 */

async function getAppAccessToken(): Promise<string> {
  const tenantId = process.env.AZURE_AD_TENANT_ID!;
  const clientId = process.env.AZURE_AD_CLIENT_ID!;
  const clientSecret = process.env.AZURE_AD_CLIENT_SECRET!;

  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
    scope: "https://graph.microsoft.com/.default",
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to acquire app-only access token: ${res.status} ${errorText}`);
  }

  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export interface MailRecipient {
  name: string;
  email: string;
}

interface SendMailOptions {
  to: MailRecipient[];
  subject: string;
  bodyHtml: string;
}

async function sendMail(opts: SendMailOptions): Promise<void> {
  const sender = process.env.MAIL_SENDER_ADDRESS;
  if (!sender) {
    console.warn("[email] MAIL_SENDER_ADDRESS not set — skipping mail send");
    return;
  }

  const token = await getAppAccessToken();

  const payload = {
    message: {
      subject: opts.subject,
      body: { contentType: "HTML", content: opts.bodyHtml },
      toRecipients: opts.to.map((r) => ({
        emailAddress: { address: r.email, name: r.name },
      })),
    },
    saveToSentItems: false,
  };

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph sendMail ${res.status}: ${text}`);
  }
}

// ── DAR email templates ───────────────────────────────────────────────────────

export async function sendReviewerAssignedEmail(opts: {
  reviewer: MailRecipient;
  requesterName: string;
  darNo: string;
  darId: string;
}): Promise<void> {
  const appUrl = process.env.NEXTAUTH_URL ?? "";
  const darUrl = `${appUrl}/dar/${opts.darId}`;

  await sendMail({
    to: [opts.reviewer],
    subject: `[QMS] คำขอเอกสาร ${opts.darNo} รอการตรวจสอบจากคุณ`,
    bodyHtml: `
      <div style="font-family:sans-serif;color:#1a2332;max-width:600px">
        <h2 style="color:#0f1059">คำขอเอกสาร ${opts.darNo}</h2>
        <p>คุณได้รับมอบหมายให้ตรวจสอบคำขอเอกสาร จาก <strong>${opts.requesterName}</strong></p>
        <p>
          <a href="${darUrl}" style="display:inline-block;padding:10px 20px;background:#0f1059;color:#fff;border-radius:6px;text-decoration:none">
            ดูคำขอและลงลายมือชื่อ
          </a>
        </p>
        <p style="color:#5a6a7a;font-size:13px">หากปุ่มด้านบนไม่ทำงาน กรุณาเปิดลิงก์: ${darUrl}</p>
      </div>
    `,
  });
}

export async function sendApprovalNotificationEmail(opts: {
  to: MailRecipient;
  darNo: string;
  darId: string;
  approverName: string;
  stepLabel: string;
  nextStepLabel: string;
}): Promise<void> {
  const appUrl = process.env.NEXTAUTH_URL ?? "";
  const darUrl = `${appUrl}/dar/${opts.darId}`;

  await sendMail({
    to: [opts.to],
    subject: `[QMS] คำขอเอกสาร ${opts.darNo} ผ่านขั้นตอน${opts.stepLabel}แล้ว`,
    bodyHtml: `
      <div style="font-family:sans-serif;color:#1a2332;max-width:600px">
        <h2 style="color:#0f1059">คำขอเอกสาร ${opts.darNo}</h2>
        <p><strong>${opts.approverName}</strong> ได้อนุมัติขั้นตอน${opts.stepLabel} เรียบร้อยแล้ว</p>
        <p>ขั้นตอนถัดไป: <strong>${opts.nextStepLabel}</strong></p>
        <p>
          <a href="${darUrl}" style="display:inline-block;padding:10px 20px;background:#0f1059;color:#fff;border-radius:6px;text-decoration:none">
            ดูสถานะคำขอ
          </a>
        </p>
      </div>
    `,
  });
}

export async function sendRejectionEmail(opts: {
  to: MailRecipient;
  darNo: string;
  darId: string;
  rejectorName: string;
  reason: string;
}): Promise<void> {
  const appUrl = process.env.NEXTAUTH_URL ?? "";
  const darUrl = `${appUrl}/dar/${opts.darId}`;

  await sendMail({
    to: [opts.to],
    subject: `[QMS] คำขอเอกสาร ${opts.darNo} ถูกส่งคืน`,
    bodyHtml: `
      <div style="font-family:sans-serif;color:#1a2332;max-width:600px">
        <h2 style="color:#0f1059">คำขอเอกสาร ${opts.darNo}</h2>
        <p><strong>${opts.rejectorName}</strong> ได้ส่งคืนคำขอนี้พร้อมเหตุผล:</p>
        <blockquote style="border-left:3px solid #dc2626;padding-left:12px;color:#5a6a7a">
          ${opts.reason}
        </blockquote>
        <p>กรุณาแก้ไขและส่งใหม่อีกครั้ง</p>
        <p>
          <a href="${darUrl}" style="display:inline-block;padding:10px 20px;background:#0f1059;color:#fff;border-radius:6px;text-decoration:none">
            ดูคำขอ
          </a>
        </p>
      </div>
    `,
  });
}
