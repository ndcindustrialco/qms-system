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

type SortKey = "requestDate" | "darNo" | "status";
type SortDir = "asc" | "desc";

type Props = {
  dars: DarSummary[];
  onSort?: (key: SortKey) => void;
  sortKey?: SortKey;
  sortDir?: SortDir;
  onEdit?: (id: string) => void;
};

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  );
  return dir === "asc" ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#0F1059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#0F1059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
    </svg>
  );
}

export default function DarTable({ dars, onSort, sortKey, sortDir = "desc", onEdit }: Props) {
  const locale = useLocale();

  const t = {
    darNo:     locale === "th" ? "เลขที่ DAR"   : "DAR No.",
    date:      locale === "th" ? "วันที่ขอ"     : "Date",
    objective: locale === "th" ? "วัตถุประสงค์" : "Objective",
    docType:   locale === "th" ? "ประเภทเอกสาร" : "Doc Type",
    items:     locale === "th" ? "รายการ"       : "Items",
    status:    locale === "th" ? "สถานะ"        : "Status",
    view:      locale === "th" ? "ดูรายละเอียด" : "View",
    edit:      locale === "th" ? "แก้ไข"        : "Edit",
    draft:     locale === "th" ? "ร่าง"         : "Draft",
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
    <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
            <th className="px-4 py-3 text-left">
              <button onClick={() => onSort?.("darNo")} className="inline-flex items-center gap-1.5 text-slate-800 text-sm font-semibold hover:text-[#0F1059] transition-colors">
                {t.darNo}
                <SortIcon active={sortKey === "darNo"} dir={sortDir} />
              </button>
            </th>
            <th className="px-4 py-3 text-center">
              <button onClick={() => onSort?.("requestDate")} className="inline-flex items-center gap-1.5 text-slate-800 text-sm font-semibold hover:text-[#0F1059] transition-colors">
                {t.date}
                <SortIcon active={sortKey === "requestDate"} dir={sortDir} />
              </button>
            </th>
            <th className="text-slate-800 text-sm font-semibold px-4 py-3 text-left">{t.objective}</th>
            <th className="text-slate-800 text-sm font-semibold px-4 py-3 text-left">{t.docType}</th>
            <th className="text-slate-800 text-sm font-semibold px-4 py-3 text-center">{t.items}</th>
            <th className="px-4 py-3 text-left">
              <button onClick={() => onSort?.("status")} className="inline-flex items-center gap-1.5 text-slate-800 text-sm font-semibold hover:text-[#0F1059] transition-colors">
                {t.status}
                <SortIcon active={sortKey === "status"} dir={sortDir} />
              </button>
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {dars.map((dar) => (
            <tr
              key={dar.id}
              className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <td className="px-4 py-3">
                {dar.darNo ? (
                  <span className="text-sm font-semibold text-[#0F1059]">{dar.darNo}</span>
                ) : (
                  <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-500 font-medium">
                    {t.draft}
                  </span>
                )}
              </td>

              <td className="px-4 py-3 text-center">
                <span className="text-sm font-mono text-slate-600 whitespace-nowrap">{fmtDate(dar.requestDate)}</span>
              </td>

              <td className="px-4 py-3">
                <span className="text-sm text-slate-600">{objectiveLabel(dar.objective)}</span>
              </td>

              <td className="px-4 py-3">
                <span className="text-sm text-slate-600">{docTypeLabel(dar.docType)}</span>
              </td>

              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                  {dar.itemCount}
                </span>
              </td>

              <td className="px-4 py-3">
                <DarStatusBadge status={dar.status} />
              </td>

              <td className="px-4 py-3">
                <div className="flex items-center gap-2 justify-end">
                  <Link
                    href={`/dar/${dar.id}`}
                    className="h-11 inline-flex items-center gap-1 px-3 rounded-xl text-xs font-medium text-[#1D6A8A] border border-[#1D6A8A]/30 hover:bg-sky-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {t.view}
                  </Link>

                  {dar.status === "DRAFT" && (
                    <button
                      onClick={() => onEdit?.(dar.id)}
                      className="h-11 inline-flex items-center gap-1 px-3 rounded-xl text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      {t.edit}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
