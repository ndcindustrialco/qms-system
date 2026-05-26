"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";

interface Props {
  darId: string;
}

export default function DarDraftActions({ darId }: Props) {
  const t = useT();
  const router = useRouter();
  const locale = useLocale();
  const isTh = locale === "th";

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/dar/${darId}`, { method: "DELETE" });
      const json = await res.json() as { error: string | null };
      if (!res.ok || json.error) {
        setError(json.error ?? t("error"));
        return;
      }
      router.push("/dar");
      router.refresh();
    } catch {
      setError(t("errorRetry"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="h-11 min-w-[44px] inline-flex items-center gap-1.5 px-3 rounded-xl text-sm font-medium
                     text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {t("deleteDraft")}
        </button>
      </div>

      {showConfirm && (
        <dialog className="modal modal-open" aria-modal="true">
          <div className="modal-box rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-800">{t("confirmDeleteDraft")}</h3>
            </div>

            <p className="text-sm text-slate-600 mb-4">{t("deleteDraftMsg")}</p>

            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3 py-2 mb-4">{error}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => { setShowConfirm(false); setError(null); }}
                className="h-11 min-w-[44px] bg-white text-slate-700 border border-slate-200 rounded-xl px-4 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {isTh ? "ยกเลิก" : "Cancel"}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="h-11 min-w-[44px] bg-rose-600 text-white rounded-xl px-4 text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {deleting && (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                )}
                {t("confirmDelete")}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => !deleting && setShowConfirm(false)} />
        </dialog>
      )}
    </>
  );
}
