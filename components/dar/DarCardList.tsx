"use client";

import Link from "next/link";
import type { DarSummary } from "@/types/dar";
import { OBJECTIVE_LABELS, DOC_TYPE_LABELS } from "@/types/dar";
import DarStatusBadge from "./DarStatusBadge";
import { useLocale } from "@/lib/locale-context";

const OBJECTIVE_LABELS_EN: Record<string, string> = {
  PREPARE_NEW:                "Prepare New Doc",
  REQUEST_COPY_CONTROLLED:    "Copy (Controlled)",
  REQUEST_COPY_UNCONTROLLED:  "Copy (Uncontrolled)",
  REVISE:                     "Revise",
  CANCEL:                     "Cancel Doc",
};

const DOC_TYPE_LABELS_EN: Record<string, string> = {
  MANUAL:    "Manual (M)",
  FORMAT:    "Format (FM)",
  DRAWING:   "Drawing",
  PROCEDURE: "Procedure (P)",
  SOP:       "SOP",
  SIP:       "SIP",
  IPQC:      "IPQC",
  OTHER:     "Other",
};

export default function DarCardList({ dars }: { dars: DarSummary[] }) {
  const locale = useLocale();

  const t = {
    noDarNo:   locale === "th" ? "ยังไม่มีเลขที่" : "Draft",
    objective: locale === "th" ? "วัตถุประสงค์"   : "Objective",
    docType:   locale === "th" ? "ประเภท"         : "Doc Type",
    itemCount: locale === "th" ? "จำนวนรายการ"    : "Items",
    date:      locale === "th" ? "วันที่ขอ"       : "Date",
    itemUnit:  locale === "th" ? "รายการ"         : "item(s)",
    view:      locale === "th" ? "ดูรายละเอียด"   : "View",
    edit:      locale === "th" ? "แก้ไข"          : "Edit",
  };

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString(locale === "th" ? "th-TH" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function objectiveLabel(key: string) {
    return locale === "th"
      ? (OBJECTIVE_LABELS as Record<string, string>)[key] ?? key
      : OBJECTIVE_LABELS_EN[key] ?? key;
  }

  function docTypeLabel(key: string) {
    return locale === "th"
      ? (DOC_TYPE_LABELS as Record<string, string>)[key] ?? key
      : DOC_TYPE_LABELS_EN[key] ?? key;
  }

  return (
    <div className="md:hidden flex flex-col gap-3">
      {dars.map((dar) => (
        <div
          key={dar.id}
          className="card-premium p-4 border border-base-300 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          {/* Card header: DAR No. + Status */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              {dar.darNo ? (
                <p className="text-sm font-bold text-[#0F1059]">{dar.darNo}</p>
              ) : (
                <span className="inline-block px-2 py-0.5 text-[11px] rounded-md bg-base-200 text-gray-400 font-medium">
                  {t.noDarNo}
                </span>
              )}
              <p className="text-[11px] text-gray-500 mt-0.5">{fmtDate(dar.requestDate)}</p>
            </div>
            <DarStatusBadge status={dar.status} />
          </div>

          {/* Metadata rows */}
          <div className="flex flex-col gap-1.5 border-t border-base-200 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500 w-28 shrink-0">{t.objective}</span>
              <span className="text-xs text-base-content font-medium">{objectiveLabel(dar.objective)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500 w-28 shrink-0">{t.docType}</span>
              <span className="text-xs text-base-content font-medium">{docTypeLabel(dar.docType)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500 w-28 shrink-0">{t.itemCount}</span>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-base-200 text-[11px] font-semibold text-gray-500">
                {dar.itemCount}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4 justify-end">
            <Link
              href={`/dar/${dar.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-[#1D6A8A] border border-[#1D6A8A]/30 hover:bg-[#1D6A8A]/10 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {t.view}
            </Link>

            {dar.status === "DRAFT" && (
              <Link
                href={`/dar/${dar.id}/edit`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-[#0F1059] hover:bg-[#0F1059]/90 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                {t.edit}
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
