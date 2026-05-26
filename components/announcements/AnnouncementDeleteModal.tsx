"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";
import type { AnnouncementRow } from "@/services/announcement";

type Props = {
  item: AnnouncementRow | null;
  open: boolean;
  onClose: () => void;
  onDeleted: (success: boolean, errorMessage?: string) => void;
};

export default function AnnouncementDeleteModal({ item, open, onClose, onDeleted }: Props) {
  const t = useT();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!item) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/announcements/${item.id}`, { method: "DELETE" });
      const json = await res.json() as { data: unknown; error: string | null };
      if (!res.ok || json.error) { onDeleted(false, json.error ?? undefined); return; }
      onDeleted(true);
    } catch {
      onDeleted(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <dialog className={`modal ${open ? "modal-open" : ""}`} aria-modal="true">
      <div className="modal-box rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">{t("announcement.deleteTitle")}</h3>
            {item && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-65">{item.title}</p>}
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-6">
          {t("announcement.deleteConfirm")} {t("announcement.deleteWarning")}
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="bg-white text-slate-700 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-rose-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
            {t("common.delete")}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={() => !loading && onClose()} />
    </dialog>
  );
}
