/**
 * Microsoft Graph API - Send Mail (app-only)
 */

import { getGraphToken } from "@/lib/graph-token";

export interface MailRecipient {
  name: string;
  email: string;
}

interface SendMailOptions {
  to: MailRecipient[];
  subject: string;
  bodyHtml: string;
  senderEmail?: string;
}

async function sendMail(opts: SendMailOptions): Promise<void> {
  const sender = opts.senderEmail || process.env.MAIL_SENDER_ADDRESS;
  if (!sender) {
    console.warn("[email] No sender address - skipping mail send");
    return;
  }

  const token = await getGraphToken();

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

  const res = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph sendMail ${res.status}: ${text}`);
  }
}

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getAppUrl(path: string): string {
  const base = (process.env.NEXTAUTH_URL ?? "").replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function makeBilingualMail(opts: {
  titleTh: string;
  titleEn: string;
  subtitleTh?: string;
  subtitleEn?: string;
  facts: Array<{ labelTh: string; labelEn: string; value: string }>;
  detailTh?: string;
  detailEn?: string;
  actionLabelTh?: string;
  actionLabelEn?: string;
  actionUrl?: string;
}): string {
  const factsHtml = opts.facts
    .map(
      (f) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;width:35%;vertical-align:top;background:#f8fafc">
          <div style="font-size:12px;color:#0f172a;font-weight:700">${esc(f.labelTh)}</div>
          <div style="font-size:11px;color:#64748b">${esc(f.labelEn)}</div>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;vertical-align:top">
          <div style="font-size:13px;color:#0f172a;font-weight:600;white-space:pre-wrap">${esc(f.value)}</div>
        </td>
      </tr>`
    )
    .join("");

  const actionHtml = opts.actionUrl
    ? `
      <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e2e8f0">
        <a href="${opts.actionUrl}" style="display:inline-block;padding:12px 20px;background:#0f1059;color:#fff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:700">
          ${esc(opts.actionLabelTh ?? "เปิดรายการ")} / ${esc(opts.actionLabelEn ?? "Open Item")}
        </a>
        <div style="margin-top:8px;font-size:11px;color:#64748b;word-break:break-all">${esc(opts.actionUrl)}</div>
      </div>`
    : "";

  return `
  <div style="width:100%;margin:0;padding:20px;background:#f8fafc;font-family:Segoe UI,Arial,sans-serif">
    <div style="width:100%;max-width:980px;margin:0 auto;background:#fff;overflow:hidden">
      <div style="padding:18px 22px;background:#0f1059;color:#fff">
        <div style="font-size:20px;font-weight:800;line-height:1.3">${esc(opts.titleTh)}</div>
        <div style="font-size:15px;font-weight:600;opacity:.95">${esc(opts.titleEn)}</div>
        ${opts.subtitleTh ? `<div style="margin-top:8px;font-size:12px;opacity:.9">${esc(opts.subtitleTh)}${opts.subtitleEn ? ` / ${esc(opts.subtitleEn)}` : ""}</div>` : ""}
      </div>
      <div style="padding:20px 22px">
        <table style="width:100%;border-collapse:collapse">${factsHtml}</table>
        ${opts.detailTh || opts.detailEn ? `<div style="margin-top:14px;padding:12px;background:#f8fafc"><div style="font-size:12px;font-weight:700;color:#0f172a">รายละเอียด / Details</div><div style="font-size:13px;color:#334155;margin-top:6px;white-space:pre-wrap">${esc(opts.detailTh ?? "")}${opts.detailEn ? `\n${esc(opts.detailEn)}` : ""}</div></div>` : ""}
        ${actionHtml}
      </div>
      <div style="padding:12px 22px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:11px;color:#64748b">
        อีเมลนี้ถูกส่งโดยระบบอัตโนมัติ กรุณาอย่าตอบกลับ / This is an automated email. Please do not reply.
      </div>
    </div>
  </div>`;
}

export interface DarEmailItem {
  itemNo: number;
  docNumber: string;
  docName: string;
  revision: string;
}

export interface DarEmailAttachment {
  fileName: string;
  spWebUrl: string;
}

export async function sendReviewerAssignedEmail(opts: {
  reviewer: MailRecipient;
  requesterName: string;
  requesterDepartment: string | null;
  darNo: string;
  darId: string;
  requestDate: string;
  objective: string;
  docType: string;
  reason: string;
  items: DarEmailItem[];
  attachments: DarEmailAttachment[];
  senderEmail?: string;
}): Promise<void> {
  const url = getAppUrl(`/dar/${opts.darId}`);
  await sendMail({
    to: [opts.reviewer],
    senderEmail: opts.senderEmail,
    subject: `[DAR] Review Required - ${opts.darNo}`,
    bodyHtml: makeBilingualMail({
      titleTh: `คำขอเอกสาร DAR ${opts.darNo} รอตรวจสอบ`,
      titleEn: `DAR ${opts.darNo} Pending Review`,
      facts: [
        { labelTh: "ผู้ตรวจสอบ", labelEn: "Reviewer", value: opts.reviewer.name },
        { labelTh: "ผู้ร้องขอ", labelEn: "Requester", value: `${opts.requesterName}${opts.requesterDepartment ? ` (${opts.requesterDepartment})` : ""}` },
        { labelTh: "วันที่ร้องขอ", labelEn: "Request Date", value: opts.requestDate },
        { labelTh: "วัตถุประสงค์", labelEn: "Objective", value: opts.objective },
        { labelTh: "ประเภทเอกสาร", labelEn: "Document Type", value: opts.docType },
        { labelTh: "จำนวนรายการ", labelEn: "Item Count", value: String(opts.items.length) },
      ],
      detailTh: `เหตุผล: ${opts.reason}`,
      detailEn: `Reason: ${opts.reason}`,
      actionLabelTh: "เปิดคำขอ DAR",
      actionLabelEn: "Open DAR",
      actionUrl: url,
    }),
  });
}

export async function sendMrApprovalRequestEmail(opts: {
  mr: MailRecipient;
  reviewerName: string;
  requesterName: string;
  requesterDepartment: string | null;
  darNo: string;
  darId: string;
  requestDate: string;
  objective: string;
  docType: string;
  reason: string;
  items: DarEmailItem[];
  attachments: DarEmailAttachment[];
  senderEmail?: string;
}): Promise<void> {
  const url = getAppUrl(`/dar/${opts.darId}`);
  await sendMail({
    to: [opts.mr],
    senderEmail: opts.senderEmail,
    subject: `[DAR] MR Approval Required - ${opts.darNo}`,
    bodyHtml: makeBilingualMail({
      titleTh: `คำขอ DAR ${opts.darNo} รออนุมัติ MR`,
      titleEn: `DAR ${opts.darNo} Pending MR Approval`,
      facts: [
        { labelTh: "ผู้ตรวจสอบแล้ว", labelEn: "Reviewed By", value: opts.reviewerName },
        { labelTh: "ผู้ร้องขอ", labelEn: "Requester", value: `${opts.requesterName}${opts.requesterDepartment ? ` (${opts.requesterDepartment})` : ""}` },
        { labelTh: "วัตถุประสงค์", labelEn: "Objective", value: opts.objective },
        { labelTh: "จำนวนรายการ", labelEn: "Item Count", value: String(opts.items.length) },
      ],
      actionLabelTh: "เปิดคำขอ DAR",
      actionLabelEn: "Open DAR",
      actionUrl: url,
    }),
  });
}

export async function sendQmsApprovalRequestEmail(opts: {
  qms: MailRecipient;
  requesterName: string;
  darNo: string;
  darId: string;
  senderEmail?: string;
}): Promise<void> {
  const url = getAppUrl(`/dar/${opts.darId}`);
  await sendMail({
    to: [opts.qms],
    senderEmail: opts.senderEmail,
    subject: `[DAR] QMS Approval Required - ${opts.darNo}`,
    bodyHtml: makeBilingualMail({
      titleTh: `คำขอ DAR ${opts.darNo} รออนุมัติ QMS`,
      titleEn: `DAR ${opts.darNo} Pending QMS Approval`,
      facts: [
        { labelTh: "ผู้ร้องขอ", labelEn: "Requester", value: opts.requesterName },
        { labelTh: "สถานะ", labelEn: "Status", value: "MR อนุมัติแล้ว รอ QMS อนุมัติขั้นสุดท้าย / MR approved, awaiting final QMS approval" },
      ],
      actionLabelTh: "เปิดคำขอ DAR",
      actionLabelEn: "Open DAR",
      actionUrl: url,
    }),
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
  const url = getAppUrl(`/dar/${opts.darId}`);
  await sendMail({
    to: [opts.to],
    subject: `[DAR] ${opts.darNo} - ${opts.stepLabel} Approved`,
    bodyHtml: makeBilingualMail({
      titleTh: `คำขอ DAR ${opts.darNo} อนุมัติแล้ว`,
      titleEn: `DAR ${opts.darNo} Approved`,
      facts: [
        { labelTh: "ผู้อนุมัติ", labelEn: "Approved By", value: opts.approverName },
        { labelTh: "ขั้นตอนที่อนุมัติ", labelEn: "Approved Step", value: opts.stepLabel },
        { labelTh: "ขั้นตอนถัดไป", labelEn: "Next Step", value: opts.nextStepLabel },
      ],
      actionLabelTh: "ดูคำขอ DAR",
      actionLabelEn: "View DAR",
      actionUrl: url,
    }),
  });
}

export async function sendRejectionEmail(opts: {
  to: MailRecipient;
  darNo: string;
  darId: string;
  rejectorName: string;
  reason: string;
}): Promise<void> {
  const url = getAppUrl(`/dar/${opts.darId}`);
  await sendMail({
    to: [opts.to],
    subject: `[DAR] ${opts.darNo} - Rejected`,
    bodyHtml: makeBilingualMail({
      titleTh: `คำขอ DAR ${opts.darNo} ถูกปฏิเสธ`,
      titleEn: `DAR ${opts.darNo} Rejected`,
      facts: [
        { labelTh: "ผู้ปฏิเสธ", labelEn: "Rejected By", value: opts.rejectorName },
        { labelTh: "เหตุผล", labelEn: "Reason", value: opts.reason },
      ],
      actionLabelTh: "ดูคำขอ DAR",
      actionLabelEn: "View DAR",
      actionUrl: url,
    }),
  });
}

export async function sendKpiObjectiveReviewerAssignedEmail(opts: {
  reviewer: MailRecipient;
  requesterName: string;
  departmentName: string;
  objectiveId: string;
  objective: string;
  year: number;
}) {
  const url = getAppUrl(`/approve/${opts.objectiveId}/reviewer?type=kpi`);
  await sendMail({
    to: [opts.reviewer],
    subject: `[KPI] Review Required - ${opts.departmentName} / ${opts.year}`,
    bodyHtml: makeBilingualMail({
      titleTh: `KPI ${opts.departmentName} ปี ${opts.year} รอตรวจสอบ`,
      titleEn: `KPI ${opts.departmentName} ${opts.year} Pending Review`,
      facts: [
        { labelTh: "ผู้ตรวจสอบ", labelEn: "Reviewer", value: opts.reviewer.name },
        { labelTh: "ผู้มอบหมาย", labelEn: "Assigned By", value: opts.requesterName },
        { labelTh: "หน่วยงาน", labelEn: "Department", value: opts.departmentName },
        { labelTh: "ปี", labelEn: "Year", value: String(opts.year) },
      ],
      actionLabelTh: "เปิด KPI",
      actionLabelEn: "Open KPI",
      actionUrl: url,
    }),
  });
}

export async function sendKpiObjectiveApproverRequestEmail(opts: {
  approver: MailRecipient;
  reviewerName: string;
  departmentName: string;
  objective: string;
  year: number;
}) {
  const url = getAppUrl(`/qms/kpi`);
  await sendMail({
    to: [opts.approver],
    subject: `[KPI] Approval Required - ${opts.departmentName} / ${opts.year}`,
    bodyHtml: makeBilingualMail({
      titleTh: `KPI ${opts.departmentName} ปี ${opts.year} รออนุมัติ`,
      titleEn: `KPI ${opts.departmentName} ${opts.year} Pending Approval`,
      facts: [
        { labelTh: "ผู้ตรวจสอบแล้ว", labelEn: "Reviewed By", value: opts.reviewerName },
        { labelTh: "หน่วยงาน", labelEn: "Department", value: opts.departmentName },
        { labelTh: "ปี", labelEn: "Year", value: String(opts.year) },
      ],
      actionLabelTh: "เปิด KPI",
      actionLabelEn: "Open KPI",
      actionUrl: url,
    }),
  });
}

export async function sendKpiApprovalRequestEmail(opts: {
  approver: MailRecipient;
  departmentName: string;
  year: number;
  reviewerName?: string;
}) {
  const url = getAppUrl(`/qms/kpi`);
  await sendMail({
    to: [opts.approver],
    subject: `[KPI] Approval Required - ${opts.departmentName} / ${opts.year}`,
    bodyHtml: makeBilingualMail({
      titleTh: `KPI ${opts.departmentName} ปี ${opts.year} รออนุมัติ`,
      titleEn: `KPI ${opts.departmentName} ${opts.year} Pending Approval`,
      facts: [
        { labelTh: "ผู้ตรวจสอบแล้ว", labelEn: "Reviewed By", value: opts.reviewerName ?? "-" },
        { labelTh: "หน่วยงาน", labelEn: "Department", value: opts.departmentName },
        { labelTh: "ปี", labelEn: "Year", value: String(opts.year) },
      ],
      actionLabelTh: "เปิด KPI",
      actionLabelEn: "Open KPI",
      actionUrl: url,
    }),
  });
}

export async function sendKpiResultEmail(opts: {
  to: MailRecipient;
  departmentName: string;
  year: number;
  status: "APPROVED" | "REJECTED";
  actorName: string;
}) {
  const url = getAppUrl(`/qms/kpi`);
  await sendMail({
    to: [opts.to],
    subject: `[KPI] ${opts.status} - ${opts.departmentName} / ${opts.year}`,
    bodyHtml: makeBilingualMail({
      titleTh: `ผลการอนุมัติ KPI ${opts.departmentName} ปี ${opts.year}`,
      titleEn: `KPI ${opts.departmentName} ${opts.year} Approval Result`,
      facts: [
        { labelTh: "สถานะ", labelEn: "Status", value: opts.status },
        { labelTh: "ดำเนินการโดย", labelEn: "Action By", value: opts.actorName },
        { labelTh: "หน่วยงาน", labelEn: "Department", value: opts.departmentName },
        { labelTh: "ปี", labelEn: "Year", value: String(opts.year) },
      ],
      actionLabelTh: "เปิด KPI",
      actionLabelEn: "Open KPI",
      actionUrl: url,
    }),
  });
}

export async function sendKpiMonthlyApprovalRequestEmail(opts: {
  approver: MailRecipient;
  departmentName: string;
  month: string;
  year: number;
  preparerName?: string;
}) {
  const url = getAppUrl(`/qms/kpi/monthly`);
  await sendMail({
    to: [opts.approver],
    subject: `[KPI Monthly] Approval Required - ${opts.departmentName} / ${opts.month} ${opts.year}`,
    bodyHtml: makeBilingualMail({
      titleTh: `KPI รายเดือน ${opts.departmentName} รออนุมัติ`,
      titleEn: `Monthly KPI ${opts.departmentName} Pending Approval`,
      facts: [
        { labelTh: "รอบเดือน", labelEn: "Period", value: `${opts.month} ${opts.year}` },
        { labelTh: "ผู้จัดเตรียม", labelEn: "Prepared By", value: opts.preparerName ?? "-" },
        { labelTh: "หน่วยงาน", labelEn: "Department", value: opts.departmentName },
      ],
      actionLabelTh: "เปิด KPI รายเดือน",
      actionLabelEn: "Open Monthly KPI",
      actionUrl: url,
    }),
  });
}

export async function sendKpiMonthlyResultEmail(opts: {
  to: MailRecipient;
  departmentName: string;
  month: string;
  year: number;
  status: "APPROVED" | "REJECTED";
  actorName: string;
  reason?: string;
}) {
  const url = getAppUrl(`/qms/kpi/monthly`);
  await sendMail({
    to: [opts.to],
    subject: `[KPI Monthly] ${opts.status} - ${opts.departmentName} / ${opts.month} ${opts.year}`,
    bodyHtml: makeBilingualMail({
      titleTh: `ผลการอนุมัติ KPI รายเดือน ${opts.departmentName}`,
      titleEn: `Monthly KPI ${opts.departmentName} Approval Result`,
      facts: [
        { labelTh: "รอบเดือน", labelEn: "Period", value: `${opts.month} ${opts.year}` },
        { labelTh: "สถานะ", labelEn: "Status", value: opts.status },
        { labelTh: "ดำเนินการโดย", labelEn: "Action By", value: opts.actorName },
        { labelTh: "เหตุผล", labelEn: "Reason", value: opts.reason ?? "-" },
      ],
      actionLabelTh: "เปิด KPI รายเดือน",
      actionLabelEn: "Open Monthly KPI",
      actionUrl: url,
    }),
  });
}
