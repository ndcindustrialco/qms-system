"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";

type Props = {
  onNewRequest?: () => void;
};

export default function DarListHeader({ onNewRequest }: Props) {
  const locale = useLocale();

  const t = {
    title:      locale === "th" ? "คำขอเอกสาร (DAR)" : "Document Requests (DAR)",
    subtitle:   locale === "th" ? "จัดการและติดตามคำขอเอกสารของคุณ" : "Manage and track your document requests",
    newRequest: locale === "th" ? "สร้างคำขอใหม่" : "New Request",
  };

  const plusIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );

  const buttonCls = "inline-flex items-center gap-1.5 bg-[#0F1059] hover:bg-[#161875] text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors shrink-0";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-6 py-5 mb-6 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-[#0F1059] leading-tight tracking-tight">{t.title}</h1>
        <p className="text-xs text-slate-400 mt-1">{t.subtitle}</p>
      </div>

      {onNewRequest ? (
        <button onClick={onNewRequest} className={buttonCls}>
          {plusIcon}
          <span className="hidden sm:inline">{t.newRequest}</span>
        </button>
      ) : (
        <Link href="/dar/new" className={buttonCls}>
          {plusIcon}
          <span className="hidden sm:inline">{t.newRequest}</span>
        </Link>
      )}
    </div>
  );
}
