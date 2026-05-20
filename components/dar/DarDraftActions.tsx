"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useT } from "@/lib/i18n";

interface Props {
  darId: string;
}

export default function DarDraftActions({ darId }: Props) {
  const t = useT();
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/dar/${darId}`, { method: "DELETE" });
      const json = await res.json();
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
        <Link href={`/dar/${darId}/edit`} className="btn btn-primary btn-sm">
          {t("edit")}
        </Link>
        <button
          type="button"
          className="btn btn-error btn-outline btn-sm"
          onClick={() => setShowConfirm(true)}
        >
          {t("deleteDraft")}
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-content/20 p-4">
          <div className="bg-base-100 rounded-xl shadow-lg border border-base-300 w-full max-w-sm p-6 flex flex-col gap-4">
            <h3 className="text-[16px] font-semibold text-base-content">{t("confirmDeleteDraft")}</h3>
            <p className="text-[14px] text-neutral">{t("deleteDraftMsg")}</p>
            {error && <p className="text-[13px] text-error">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => { setShowConfirm(false); setError(null); }}
                disabled={deleting}
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                className="btn btn-error btn-sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <span className="loading loading-spinner loading-xs" /> : null}
                {t("confirmDelete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
