"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";

export default function DarNewHeader() {
  const locale = useLocale();

  const t = {
    back:    locale === "th" ? "คำขอเอกสาร"            : "Document Requests",
    current: locale === "th" ? "สร้างคำขอใหม่"         : "New Request",
    title:   locale === "th" ? "สร้างคำขอเอกสาร (DAR)" : "New Document Request (DAR)",
  };

  return (
    <div
      className="rounded-xl px-5 py-5 mb-6"
      style={{ background: "linear-gradient(135deg, #0F1059 0%, #1D6A8A 100%)" }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[11px] text-white/60 mb-2">
        <Link href="/dar" className="hover:text-white/90 transition-colors">
          {t.back}
        </Link>
        <span>/</span>
        <span className="text-white/90">{t.current}</span>
      </div>

      <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">{t.title}</h1>
    </div>
  );
}
