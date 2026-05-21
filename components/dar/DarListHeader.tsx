"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";

type Props = {
  onNewRequest?: () => void;
};

export default function DarListHeader({ onNewRequest }: Props) {
  const locale = useLocale();

  const t = {
    title:       locale === "th" ? "คำขอเอกสาร (DAR)"       : "Document Requests (DAR)",
    newRequest:  locale === "th" ? "สร้างคำขอใหม่"           : "New Request",
  };

  const plusIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );

  return (
    <div className="px-5 py-4 mb-6 flex items-center justify-between gap-4 rounded-xl overflow-hidden relative" style={{ background: "linear-gradient(135deg, var(--sidebar-bg-from) 0%, oklch(19% 0.115 264) 100%)", backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(135deg, var(--sidebar-bg-from) 0%, oklch(19% 0.115 264) 100%)", backgroundSize: "24px 24px, 100% 100%" }}>
      <div className="min-w-0">
        <h1 className="text-xl md:text-2xl font-bold text-white leading-tight tracking-tight">{t.title}</h1>
      </div>

      {onNewRequest ? (
        <button
          onClick={onNewRequest}
          className="btn btn-sm gap-1.5 shrink-0 bg-white text-primary hover:bg-white/90 border-0 font-semibold"
        >
          {plusIcon}
          <span className="hidden sm:inline">{t.newRequest}</span>
        </button>
      ) : (
        <Link
          href="/dar/new"
          className="btn btn-sm gap-1.5 shrink-0 bg-white text-primary hover:bg-white/90 border-0 font-semibold"
        >
          {plusIcon}
          <span className="hidden sm:inline">{t.newRequest}</span>
        </Link>
      )}
    </div>
  );
}
