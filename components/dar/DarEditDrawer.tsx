"use client";

import { useEffect, useState } from "react";
import DarForm from "./DarForm";
import { useLocale } from "@/lib/locale-context";
import type { DarDetail } from "@/types/dar";

type Department = { id: string; name: string };

type Props = {
  darId: string | null;
  onClose: () => void;
};

export default function DarEditDrawer({ darId, onClose }: Props) {
  const locale = useLocale();
  const isOpen = darId !== null;

  const [dar, setDar] = useState<DarDetail | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [tempId] = useState(() => crypto.randomUUID());

  // Delete confirm modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isTh = locale === "th";

  async function load(id: string) {
    setLoading(true);
    setError(null);
    try {
      const [darRes, depsRes] = await Promise.all([
        fetch(`/api/dar/${id}`),
        fetch("/api/departments"),
      ]);
      const darJson = await darRes.json() as { data: DarDetail | null; error: string | null };
      const depsJson = await depsRes.json() as { data: Department[] | null; error: string | null };

      if (!darRes.ok || darJson.error || !darJson.data) throw new Error();
      if (!depsRes.ok || depsJson.error || !depsJson.data) throw new Error();

      setDar(darJson.data);
      setDepartments(depsJson.data);
    } catch {
      setError(isTh ? "โหลดข้อมูลไม่สำเร็จ" : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!darId) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/dar/${darId}`, { method: "DELETE" });
      const json = await res.json() as { error: string | null };
      if (!res.ok || json.error) throw new Error(json.error ?? "");
      setShowDeleteConfirm(false);
      onClose();
      // Reload the list
      window.location.reload();
    } catch (e) {
      setDeleteError(e instanceof Error && e.message ? e.message : (isTh ? "ลบไม่สำเร็จ" : "Delete failed"));
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    if (darId) load(darId);
    else { setDar(null); setError(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [darId]);

  // Entrance animation
  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showDeleteConfirm) setShowDeleteConfirm(false);
        else onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, showDeleteConfirm]);

  if (!isOpen) return null;

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isTh ? "แก้ไขคำขอเอกสาร" : "Edit Document Request"}
        className="fixed inset-0 z-50 flex items-end lg:items-stretch lg:justify-end"
      >
        {/* Backdrop */}
        <div
          onClick={onClose}
          aria-hidden="true"
          className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        />

        {/* Panel */}
        <div
          className={[
            "relative z-10 flex flex-col bg-white shadow-2xl",
            "transition-transform duration-300 ease-out",
            "w-full max-h-[92vh] rounded-t-2xl",
            "lg:inset-y-0 lg:right-0 lg:h-full lg:max-h-full lg:w-1/2 lg:rounded-none lg:rounded-l-2xl",
            visible
              ? "translate-y-0 lg:translate-x-0"
              : "translate-y-full lg:translate-x-full lg:translate-y-0",
          ].join(" ")}
        >
          {/* Mobile drag handle */}
          <div className="lg:hidden flex justify-center pt-3 pb-1 shrink-0" aria-hidden="true">
            <div className="w-10 h-1 rounded-full bg-slate-200" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 leading-snug">
                {isTh ? "แก้ไขคำขอเอกสาร (DAR)" : "Edit Document Request"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {dar?.darNo
                  ? (isTh ? `เลขที่ ${dar.darNo}` : `DAR No. ${dar.darNo}`)
                  : (isTh ? "ฉบับร่าง" : "Draft")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Delete button — only shown for DRAFT */}
              {dar?.status === "DRAFT" && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  aria-label={isTh ? "ลบคำขอ" : "Delete request"}
                  className="h-9 px-3 flex items-center gap-1.5 rounded-xl text-rose-600 border border-rose-200
                             hover:bg-rose-50 transition-colors text-sm font-medium
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="hidden sm:inline">{isTh ? "ลบ" : "Delete"}</span>
                </button>
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                aria-label={isTh ? "ปิด" : "Close"}
                className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-400
                           hover:text-slate-600 hover:bg-slate-100 transition-colors
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1059] focus-visible:ring-offset-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#0F1059] animate-spin" />
                <span className="text-slate-400 text-sm">{isTh ? "กำลังโหลดข้อมูล..." : "Loading..."}</span>
              </div>
            )}

            {error && !loading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                <p className="text-slate-800 font-semibold text-base mb-1">
                  {isTh ? "โหลดข้อมูลไม่สำเร็จ" : "Something went wrong"}
                </p>
                <p className="text-slate-400 text-sm mb-4">{error}</p>
                <button
                  onClick={() => darId && load(darId)}
                  className="bg-white text-slate-700 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  {isTh ? "ลองใหม่" : "Try Again"}
                </button>
              </div>
            )}

            {!loading && !error && dar && (
              <DarForm
                mode="edit"
                tempId={tempId}
                initialData={dar}
                departments={departments}
                requesterInfo={{
                  name: dar.requester.name,
                  employeeId: dar.requester.employeeId,
                  department: dar.requester.department?.name ?? null,
                  requestDate: dar.requestDate,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Delete confirm modal — §11 Confirm/Destructive Action Modal */}
      {showDeleteConfirm && (
        <dialog className="modal modal-open" aria-modal="true">
          <div className="modal-box rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-md w-full">
            {/* Icon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">
                  {isTh ? "ยืนยันการลบ" : "Delete Draft?"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {dar?.darNo ?? (isTh ? "ฉบับร่าง" : "Draft")}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              {isTh
                ? "คำขอนี้จะถูกลบถาวร ไม่สามารถกู้คืนได้"
                : "This draft will be permanently deleted and cannot be recovered."}
            </p>

            {deleteError && (
              <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3 py-2 mb-4">{deleteError}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteError(null); }}
                disabled={deleting}
                className="bg-white text-slate-700 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {isTh ? "ยกเลิก" : "Cancel"}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-rose-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {deleting && (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                )}
                {isTh ? "ลบถาวร" : "Delete"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => !deleting && setShowDeleteConfirm(false)} />
        </dialog>
      )}
    </>
  );
}
