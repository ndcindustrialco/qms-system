"use client";

import { useLocale } from "@/lib/locale-context";

export default function QmsDarPageHeader() {
  const locale = useLocale();

  const t = {
    title:       locale === "th" ? "จัดการคำขอเอกสาร (DAR)"       : "Manage Document Requests (DAR)",
    description: locale === "th" ? "ภาพรวมคำขอเอกสารทั้งหมดในระบบ" : "Overview of all document requests",
  };

  return (
    <div className="mb-6">
      <h1 className="text-xl md:text-2xl font-bold text-primary">{t.title}</h1>
      <p className="text-xs md:text-sm text-gray-500 mt-0.5">{t.description}</p>
    </div>
  );
}
