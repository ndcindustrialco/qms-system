"use client";

import { useLocale } from "@/lib/locale-context";

export default function QmsDarPageHeader() {
  const locale = useLocale();

  const t = {
    title:       locale === "th" ? "จัดการคำขอเอกสาร (DAR)"       : "Manage Document Requests (DAR)",
    description: locale === "th" ? "ภาพรวมคำขอเอกสารทั้งหมดในระบบ" : "Overview of all document requests",
  };

  return (
    <div className="card-premium border border-base-300 rounded-xl shadow-sm px-5 py-4 mb-6 flex items-center justify-between gap-4">
      <h1 className="text-xl md:text-2xl font-bold text-primary">{t.title}</h1>
    </div>
  );
}
