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
  const [tempId] = useState(() => {
    // crypto.randomUUID is available in all modern browsers and in the Node.js edge runtime
    return crypto.randomUUID();
  });

  const t = {
    title: locale === "th" ? "สร้างคำขอเอกสาร (DAR)" : "New Document Request (DAR)",
    close: locale === "th" ? "ปิด" : "Close",
    loadingDep: locale === "th" ? "กำลังโหลดข้อมูล..." : "Loading...",
    errorDep: locale === "th" ? "โหลดข้อมูลไม่สำเร็จ" : "Failed to load data",
    retry: locale === "th" ? "ลองใหม่" : "Retry",
  };

  async function fetchDepartments() {
    setDepsLoading(true);
    setDepsError(null);
    try {
      const res = await fetch("/api/departments");
      const json = await res.json() as { data: Department[] | null; error: string | null };
      if (!res.ok || json.error || !json.data) {
        setDepsError(t.errorDep);
        return;
      }
      setDepartments(json.data);
    } catch {
      setDepsError(t.errorDep);
    } finally {
      setDepsLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen && departments.length === 0 && !depsLoading) {
      fetchDepartments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="drawer drawer-end fixed inset-0 z-50">
      {/* Checkbox trick not needed — we control open state via prop */}
      <input id="dar-drawer" type="checkbox" className="drawer-toggle" readOnly checked={isOpen} />

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-base-content/20 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl card-premium flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-300 shrink-0">
          <h2 className="text-[16px] font-semibold text-base-content">{t.title}</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label={t.close}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {depsLoading && (
            <div className="flex items-center justify-center py-16 gap-3 text-neutral">
              <span className="loading loading-spinner loading-sm" />
              <span className="text-[14px]">{t.loadingDep}</span>
            </div>
          )}

          {depsError && !depsLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-[14px] text-error">{depsError}</p>
              <button className="btn btn-ghost btn-sm" onClick={fetchDepartments}>
                {t.retry}
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
