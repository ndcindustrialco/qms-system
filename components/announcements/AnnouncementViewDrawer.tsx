"use client";

import { useEffect } from "react";
import { useT } from "@/lib/i18n";
import type { AnnouncementRow } from "@/services/announcement";
import AnnouncementViewFields from "@/components/announcements/AnnouncementViewFields";

type Props = {
  item: AnnouncementRow | null;
  open: boolean;
  onClose: () => void;
  onEdit: (item: AnnouncementRow) => void;
};

export default function AnnouncementViewDrawer({ item, open, onClose, onEdit }: Props) {
  const t = useT();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label={t("announcement.viewTitle")}
      className="fixed inset-0 z-50 flex items-end lg:items-stretch lg:justify-end"
    >
      <div onClick={onClose} aria-hidden="true" className="absolute inset-0 bg-black/30" />

      <div className={[
        "relative z-10 flex flex-col bg-white shadow-2xl",
        "w-full max-h-[92vh] rounded-t-2xl",
        "lg:h-full lg:max-h-full lg:w-[480px] lg:rounded-none lg:rounded-l-2xl",
      ].join(" ")}>
        {/* Mobile drag handle */}
        <div className="lg:hidden flex justify-center pt-3 pb-1 shrink-0" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 leading-snug">{t("announcement.viewTitle")}</h2>
            {item && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-64">{item.title}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label={t("common.close")}
            className="h-11 w-11 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1059] focus-visible:ring-offset-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        {item && <AnnouncementViewFields item={item} />}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="h-11 bg-white text-slate-700 border border-slate-200 rounded-xl px-4 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            {t("common.close")}
          </button>
          {item && (
            <button
              onClick={() => { onClose(); onEdit(item); }}
              className="h-11 bg-[#0F1059] text-white rounded-xl px-4 text-sm font-medium hover:bg-[#161875] transition-colors"
            >
              {t("common.edit")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
