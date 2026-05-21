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
    <div className="card-premium border border-base-300 rounded-xl shadow-sm px-5 py-4 mb-6 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-xl md:text-2xl font-bold text-primary leading-tight">{t.title}</h1>
      </div>

      {onNewRequest ? (
        <button
          onClick={onNewRequest}
          className="btn btn-primary btn-sm gap-1.5 shrink-0"
        >
          {plusIcon}
          <span className="hidden sm:inline">{t.newRequest}</span>
        </button>
      ) : (
        <Link
          href="/dar/new"
          className="btn btn-primary btn-sm gap-1.5 shrink-0"
        >
          {plusIcon}
          <span className="hidden sm:inline">{t.newRequest}</span>
        </Link>
      )}
    </div>
  );
}
