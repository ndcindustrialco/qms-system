"use client";

import { useEffect, useState } from "react";
import DarForm from "./DarForm";
import { useLocale } from "@/lib/locale-context";

type RequesterInfo = {
  name: string | null;
  employeeId: string | null;
  department: string | null;
  requestDate: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  requesterInfo: RequesterInfo;
};

type Department = { id: string; name: string };

export default function DarDrawer({ isOpen, onClose, requesterInfo }: Props) {
  const locale = useLocale();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [depsLoading, setDepsLoading] = useState(false);
  const [depsError, setDepsError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [tempId] = useState(() => crypto.randomUUID());

  const isTh = locale === "th";

  async function fetchDepartments() {
    setDepsLoading(true);
    setDepsError(null);
    try {
      const res = await fetch("/api/departments");
      const json = await res.json() as { data: Department[] | null; error: string | null };
      if (!res.ok || json.error || !json.data) throw new Error();
      setDepartments(json.data);
    } catch {
      setDepsError(isTh ? "โหลดข้อมูลไม่สำเร็จ" : "Failed to load departments");
    } finally {
      setDepsLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen && departments.length === 0 && !depsLoading) fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Entrance animation — one-frame delay so transition fires after mount
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

  // Esc to close (§18 keyboard shortcuts)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label={isTh ? "สร้างคำขอเอกสาร" : "New Document Request"}
      className="fixed inset-0 z-50 flex items-end lg:items-stretch lg:justify-end"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      />

      {/*
        Mobile  → bottom sheet (slides up, max 92vh, rounded-t-2xl)
        Desktop → right half-panel (slides in from right, full height)
      */}
      <div
        className={[
          "relative z-10 flex flex-col bg-white shadow-2xl",
          "transition-transform duration-300 ease-out",
          // mobile
          "w-full max-h-[92vh] rounded-t-2xl",
          // desktop override
          "lg:inset-y-0 lg:right-0 lg:h-full lg:max-h-full lg:w-1/2 lg:rounded-none lg:rounded-l-2xl",
          // animation
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
              {isTh ? "สร้างคำขอเอกสาร (DAR)" : "New Document Request"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isTh ? "กรอกรายละเอียดคำขอเอกสารด้านล่าง" : "Fill in the request details below"}
            </p>
          </div>
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

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {depsLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#0F1059] animate-spin" />
              <span className="text-slate-400 text-sm">{isTh ? "กำลังโหลดข้อมูล..." : "Loading..."}</span>
            </div>
          )}

          {depsError && !depsLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <p className="text-slate-800 font-semibold text-base mb-1">
                {isTh ? "โหลดข้อมูลไม่สำเร็จ" : "Something went wrong"}
              </p>
              <p className="text-slate-400 text-sm mb-4">{depsError}</p>
              <button
                onClick={fetchDepartments}
                className="bg-white text-slate-700 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                {isTh ? "ลองใหม่" : "Try Again"}
              </button>
            </div>
          )}

          {!depsLoading && !depsError && (
            <DarForm
              mode="create"
              tempId={tempId}
              departments={departments}
              requesterInfo={requesterInfo}
            />
          )}
        </div>
      </div>
    </div>
  );
}
