"use client";

import { useState, useMemo } from "react";
import type { DarSummary } from "@/types/dar";
import { OBJECTIVE_LABELS, DOC_TYPE_LABELS, DAR_STATUS_LABELS } from "@/types/dar";
import type { DarStatus, DarObjective, DarDocType } from "@/types/dar";
import DarListHeader from "@/components/dar/DarListHeader";
import DarTable from "@/components/dar/DarTable";
import DarCardList from "@/components/dar/DarCardList";
import DarDrawer from "@/components/dar/DarDrawer";
import DarEditDrawer from "@/components/dar/DarEditDrawer";
import { useT } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";

type RequesterInfo = {
  name: string | null;
  employeeId: string | null;
  department: string | null;
  requestDate: string;
};

type Props = {
  dars: DarSummary[];
  requesterInfo: RequesterInfo;
};

type SortKey = "requestDate" | "darNo" | "status";
type SortDir = "asc" | "desc";

const OBJECTIVE_LABELS_EN: Record<DarObjective, string> = {
  PREPARE_NEW: "Prepare New Doc",
  REQUEST_COPY_CONTROLLED: "Copy (Controlled)",
  REQUEST_COPY_UNCONTROLLED: "Copy (Uncontrolled)",
  REVISE: "Revise",
  CANCEL: "Cancel Doc",
};

const DOC_TYPE_LABELS_EN: Record<DarDocType, string> = {
  MANUAL: "Manual (M)",
  FORMAT: "Format (FM)",
  DRAWING: "Drawing",
  PROCEDURE: "Procedure (P)",
  SOP: "SOP",
  SIP: "SIP",
  IPQC: "IPQC",
  OTHER: "Other",
};

export default function DarListClient({ dars, requesterInfo }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editDarId, setEditDarId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<DarStatus | "">("");
  const [filterObjective, setFilterObjective] = useState<DarObjective | "">("");
  const [sortKey, setSortKey] = useState<SortKey>("requestDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const t = useT();
  const locale = useLocale();
  const isTh = locale === "th";

  function objectiveLabel(key: DarObjective) {
    return isTh ? OBJECTIVE_LABELS[key] : OBJECTIVE_LABELS_EN[key];
  }

  function docTypeLabel(key: DarDocType) {
    return isTh ? DOC_TYPE_LABELS[key] : DOC_TYPE_LABELS_EN[key];
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return dars
      .filter((d) => {
        if (filterStatus && d.status !== filterStatus) return false;
        if (filterObjective && d.objective !== filterObjective) return false;
        if (q) {
          const haystack = [
            d.darNo ?? "",
            objectiveLabel(d.objective),
            docTypeLabel(d.docType),
            DAR_STATUS_LABELS[d.status],
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortKey === "requestDate") {
          cmp = new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime();
        } else if (sortKey === "darNo") {
          cmp = (a.darNo ?? "").localeCompare(b.darNo ?? "");
        } else if (sortKey === "status") {
          cmp = a.status.localeCompare(b.status);
        }
        return sortDir === "asc" ? cmp : -cmp;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dars, search, filterStatus, filterObjective, sortKey, sortDir, isTh]);

  const isAllEmpty = dars.length === 0;
  const isFilteredEmpty = !isAllEmpty && filtered.length === 0;

  const statusOptions: { value: DarStatus; label: string }[] = [
    { value: "DRAFT", label: isTh ? "ฉบับร่าง" : "Draft" },
    { value: "PENDING_REVIEW", label: isTh ? "รอตรวจสอบ" : "Pending Review" },
    { value: "PENDING_APPROVE", label: isTh ? "รออนุมัติ" : "Pending Approve" },
    { value: "QMS_PROCESSING", label: isTh ? "QMS ดำเนินการ" : "QMS Processing" },
    { value: "COMPLETED", label: isTh ? "เสร็จสิ้น" : "Completed" },
    { value: "CANCELLED", label: isTh ? "ยกเลิก" : "Cancelled" },
  ];

  const objectiveOptions: { value: DarObjective; label: string }[] = (
    Object.keys(OBJECTIVE_LABELS) as DarObjective[]
  ).map((k) => ({ value: k, label: objectiveLabel(k) }));

  const sortOptions: { value: SortKey; label: string }[] = [
    { value: "requestDate", label: isTh ? "วันที่ขอ" : "Date" },
    { value: "darNo", label: isTh ? "เลขที่ DAR" : "DAR No." },
    { value: "status", label: isTh ? "สถานะ" : "Status" },
  ];

  const hasActiveFilter = search || filterStatus || filterObjective;

  function clearFilters() {
    setSearch("");
    setFilterStatus("");
    setFilterObjective("");
  }

  const selectCls = "bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-sm focus:outline-none focus:border-[#0F1059] focus:bg-white transition-colors";

  return (
    <>
      <DarListHeader onNewRequest={() => setDrawerOpen(true)} />

      {!isAllEmpty && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-5 py-4 mb-4 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-45">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isTh ? "ค้นหา DAR No., ประเภท..." : "Search DAR No., type..."}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-700 text-sm focus:outline-none focus:border-[#0F1059] focus:bg-white transition-colors"
            />
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as DarStatus | "")}
            className={selectCls}
          >
            <option value="">{isTh ? "ทุกสถานะ" : "All Statuses"}</option>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Objective filter */}
          <select
            value={filterObjective}
            onChange={(e) => setFilterObjective(e.target.value as DarObjective | "")}
            className={selectCls}
          >
            <option value="">{isTh ? "ทุกวัตถุประสงค์" : "All Objectives"}</option>
            {objectiveOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className={selectCls}
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              title={sortDir === "asc" ? (isTh ? "น้อย → มาก" : "Ascending") : (isTh ? "มาก → น้อย" : "Descending")}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#0F1059] transition-colors"
            >
              {sortDir === "asc" ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
              )}
            </button>
          </div>

          {/* Clear filters */}
          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              className="text-xs text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {isTh ? "ล้างตัวกรอง" : "Clear"}
            </button>
          )}

          {/* Result count */}
          <span className="text-xs text-slate-400 ml-auto shrink-0">
            {filtered.length} / {dars.length} {isTh ? "รายการ" : "items"}
          </span>
        </div>
      )}

      {isAllEmpty ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-slate-800 font-semibold text-base mb-1">{t("emptyDarUser")}</p>
          <p className="text-slate-400 text-sm mb-4 max-w-xs">{t("emptyDarUserDesc")}</p>
          <button
            onClick={() => setDrawerOpen(true)}
            className="bg-[#0F1059] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#161875] transition-colors inline-flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t("newRequest")}
          </button>
        </div>
      ) : isFilteredEmpty ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-slate-800 font-semibold text-base mb-1">{isTh ? "ไม่พบผลลัพธ์" : "No results found"}</p>
          <p className="text-slate-400 text-sm mb-4">{isTh ? "ลองปรับตัวกรองหรือคำค้นหา" : "Try adjusting your filters or search term"}</p>
          <button onClick={clearFilters} className="bg-white text-slate-700 border border-slate-200 rounded-xl px-4 py-2 text-sm hover:bg-slate-50 transition-colors">
            {isTh ? "ล้างตัวกรอง" : "Clear Filters"}
          </button>
        </div>
      ) : (
        <>
          <DarTable dars={filtered} onSort={toggleSort} sortKey={sortKey} sortDir={sortDir} onEdit={setEditDarId} />
          <DarCardList dars={filtered} onEdit={setEditDarId} />
        </>
      )}

      <DarDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        requesterInfo={requesterInfo}
      />

      <DarEditDrawer
        darId={editDarId}
        onClose={() => setEditDarId(null)}
      />
    </>
  );
}
