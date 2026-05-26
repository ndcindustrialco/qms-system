"use client";

import { useState, useMemo } from "react";
import type { DarSummary } from "@/types/dar";
import { OBJECTIVE_LABELS, DOC_TYPE_LABELS, DAR_STATUS_LABELS } from "@/types/dar";
import type { DarStatus, DarObjective } from "@/types/dar";
import DarTable from "@/components/dar/DarTable";
import DarCardList from "@/components/dar/DarCardList";
import { useLocale } from "@/lib/locale-context";

const OBJECTIVE_LABELS_EN: Record<DarObjective, string> = {
  PREPARE_NEW: "Prepare New Doc",
  REQUEST_COPY_CONTROLLED: "Copy (Controlled)",
  REQUEST_COPY_UNCONTROLLED: "Copy (Uncontrolled)",
  REVISE: "Revise",
  CANCEL: "Cancel Doc",
};

type StatusMeta = {
  label: string;
  labelTh: string;
  dot: string;    // color dot
  count: string;  // count text color
  active: string; // active card classes
};

const STATUS_META: Record<DarStatus, StatusMeta> = {
  PENDING_REVIEW:  { label: "Pending Review",  labelTh: "รอตรวจสอบ",    dot: "bg-sky-400",     count: "text-sky-600",     active: "border-sky-300 bg-sky-50/50" },
  PENDING_APPROVE: { label: "Pending Approve", labelTh: "รออนุมัติ",     dot: "bg-violet-400",  count: "text-violet-600",  active: "border-violet-300 bg-violet-50/50" },
  QMS_PROCESSING:  { label: "QMS Processing",  labelTh: "QMS ดำเนินการ", dot: "bg-amber-400",   count: "text-amber-600",   active: "border-amber-300 bg-amber-50/50" },
  COMPLETED:       { label: "Completed",        labelTh: "เสร็จสิ้น",     dot: "bg-emerald-400", count: "text-emerald-600", active: "border-emerald-300 bg-emerald-50/50" },
  CANCELLED:       { label: "Cancelled",        labelTh: "ยกเลิก",        dot: "bg-rose-300",    count: "text-rose-400",    active: "border-rose-200 bg-rose-50/40" },
  DRAFT:           { label: "Draft",            labelTh: "ฉบับร่าง",      dot: "bg-slate-300",   count: "text-slate-500",   active: "border-slate-300 bg-slate-50" },
};

const ORDERED_STATUSES: DarStatus[] = [
  "PENDING_REVIEW",
  "PENDING_APPROVE",
  "QMS_PROCESSING",
  "COMPLETED",
  "CANCELLED",
  "DRAFT",
];

type SortKey = "requestDate" | "darNo" | "status";
type SortDir = "asc" | "desc";

export default function QmsDarListClient({ dars }: { dars: DarSummary[] }) {
  const locale = useLocale();
  const isTh = locale === "th";

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<DarStatus | "">("");
  const [filterObjective, setFilterObjective] = useState<DarObjective | "">("");
  const [sortKey, setSortKey] = useState<SortKey>("requestDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function objectiveLabel(key: DarObjective) {
    return isTh ? OBJECTIVE_LABELS[key] : OBJECTIVE_LABELS_EN[key];
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const counts = useMemo(
    () =>
      dars.reduce<Record<string, number>>((acc, d) => {
        acc[d.status] = (acc[d.status] ?? 0) + 1;
        return acc;
      }, {}),
    [dars]
  );

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
            (DOC_TYPE_LABELS as Record<string, string>)[d.docType] ?? d.docType,
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

  const hasActiveFilter = search || filterStatus || filterObjective;
  const isFilteredEmpty = dars.length > 0 && filtered.length === 0;

  const statusOptions: { value: DarStatus; label: string }[] = [
    { value: "DRAFT",            label: isTh ? "ฉบับร่าง"      : "Draft" },
    { value: "PENDING_REVIEW",   label: isTh ? "รอตรวจสอบ"     : "Pending Review" },
    { value: "PENDING_APPROVE",  label: isTh ? "รออนุมัติ"      : "Pending Approve" },
    { value: "QMS_PROCESSING",   label: isTh ? "QMS ดำเนินการ"  : "QMS Processing" },
    { value: "COMPLETED",        label: isTh ? "เสร็จสิ้น"      : "Completed" },
    { value: "CANCELLED",        label: isTh ? "ยกเลิก"         : "Cancelled" },
  ];

  const objectiveOptions: { value: DarObjective; label: string }[] = (
    Object.keys(OBJECTIVE_LABELS) as DarObjective[]
  ).map((k) => ({ value: k, label: objectiveLabel(k) }));

  const selectCls =
    "bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-sm focus:outline-none focus:border-[#0F1059] focus:bg-white transition-colors";

  return (
    <>
      {/* Status count cards — clickable to filter */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
        {ORDERED_STATUSES.map((s) => {
          const meta = STATUS_META[s];
          const active = filterStatus === s;
          const count = counts[s] ?? 0;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(active ? "" : s)}
              className={[
                "rounded-xl px-3 py-3 text-left border transition-all duration-150",
                active
                  ? meta.active
                  : "bg-white border-slate-100 hover:border-slate-200",
              ].join(" ")}
            >
              <div className={`w-1.5 h-1.5 rounded-full mb-2.5 ${meta.dot}`} />
              <p className={`text-2xl font-semibold leading-none mb-1 ${active ? meta.count : "text-slate-700"}`}>
                {count}
              </p>
              <p className="text-[11px] text-slate-400 leading-snug">
                {isTh ? meta.labelTh : meta.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Search / filter / sort bar */}
      {dars.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 mb-4 flex flex-wrap items-center gap-3">
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
              placeholder={isTh ? "ค้นหา DAR No., ประเภท, สถานะ..." : "Search DAR No., type, status..."}
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
              <option value="requestDate">{isTh ? "วันที่ขอ" : "Date"}</option>
              <option value="darNo">{isTh ? "เลขที่ DAR" : "DAR No."}</option>
              <option value="status">{isTh ? "สถานะ" : "Status"}</option>
            </select>
            <button
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              title={sortDir === "asc" ? (isTh ? "น้อย → มาก" : "Ascending") : (isTh ? "มาก → น้อย" : "Descending")}
              className="h-11 min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#0F1059] transition-colors"
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

          {/* Clear */}
          {hasActiveFilter && (
            <button
              onClick={() => { setSearch(""); setFilterStatus(""); setFilterObjective(""); }}
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

      {/* Table / cards / empty states */}
      {dars.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-slate-800 font-semibold text-base mb-1">
            {isTh ? "ยังไม่มีคำขอเอกสาร" : "No document requests yet"}
          </p>
          <p className="text-slate-400 text-sm">
            {isTh ? "คำขอที่ผู้ใช้ส่งมาจะแสดงที่นี่" : "Requests submitted by users will appear here"}
          </p>
        </div>
      ) : isFilteredEmpty ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-slate-800 font-semibold text-base mb-1">
            {isTh ? "ไม่พบผลลัพธ์" : "No results found"}
          </p>
          <p className="text-slate-400 text-sm mb-4">
            {isTh ? "ลองปรับตัวกรองหรือคำค้นหา" : "Try adjusting your filters or search term"}
          </p>
          <button
            onClick={() => { setSearch(""); setFilterStatus(""); setFilterObjective(""); }}
            className="h-11 min-w-[44px] bg-white text-slate-700 border border-slate-200 rounded-xl px-4 py-2 text-sm hover:bg-slate-50 transition-colors"
          >
            {isTh ? "ล้างตัวกรอง" : "Clear Filters"}
          </button>
        </div>
      ) : (
        <>
          <DarTable dars={filtered} onSort={toggleSort} sortKey={sortKey} sortDir={sortDir} />
          <DarCardList dars={filtered} />
        </>
      )}
    </>
  );
}
