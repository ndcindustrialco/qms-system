"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";
import type { AnnouncementRow } from "@/services/announcement";
import AnnouncementsTable from "@/components/announcements/AnnouncementsTable";
import AnnouncementViewDrawer from "@/components/announcements/AnnouncementViewDrawer";
import AnnouncementEditDrawer from "@/components/announcements/AnnouncementEditDrawer";
import AnnouncementDeleteModal from "@/components/announcements/AnnouncementDeleteModal";
import AnnouncementCreateDrawer from "@/components/announcements/AnnouncementCreateDrawer";

type Toast = { message: string; type: "success" | "error" };
type FilterStatus = "all" | "active" | "inactive" | "scrolling";

function getIsActive(a: AnnouncementRow): boolean {
  return a.status === "ACTIVE";
}

export default function AnnouncementsTableClient({ rows }: { rows: AnnouncementRow[] }) {
  const router = useRouter();
  const t = useT();

  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState<AnnouncementRow | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<AnnouncementRow | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<AnnouncementRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");

  const totalCount = rows.length;
  const activeCount = useMemo(() => rows.filter(getIsActive).length, [rows]);
  const scrollingCount = useMemo(() => rows.filter((r) => r.displayType === "SCROLLING").length, [rows]);

  const filteredRows = useMemo(() => {
    let result = rows;
    if (filter === "active") result = result.filter(getIsActive);
    else if (filter === "inactive") result = result.filter((r) => !getIsActive(r));
    else if (filter === "scrolling") result = result.filter((r) => r.displayType === "SCROLLING");
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.sourceSystem.toLowerCase().includes(q) ||
          (r.createdBy.name ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [rows, filter, search]);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  function handleView(row: AnnouncementRow) { setViewItem(row); setViewOpen(true); }
  function handleEdit(row: AnnouncementRow) { setEditItem(row); setEditOpen(true); }
  function handleDelete(row: AnnouncementRow) { setDeleteItem(row); setDeleteModalOpen(true); }

  async function handleToggle(row: AnnouncementRow, active: boolean) {
    const res = await fetch(`/api/announcements/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    const json = await res.json() as { error: string | null };
    if (!res.ok || json.error) { showToast(json.error ?? t("announcement.updateFail"), "error"); return; }
    showToast(t("announcement.updateSuccess"), "success");
    router.refresh();
  }

  function handleSaved(success: boolean, errorMessage?: string) {
    if (!success) { showToast(errorMessage ?? t("announcement.updateFail"), "error"); return; }
    setEditOpen(false);
    showToast(t("announcement.updateSuccess"), "success");
    router.refresh();
  }

  function handleCreated(success: boolean, errorMessage?: string) {
    if (!success) { showToast(errorMessage ?? t("announcement.createFail"), "error"); return; }
    setCreateOpen(false);
    showToast(t("announcement.createSuccess"), "success");
    router.refresh();
  }

  function handleDeleted(success: boolean, errorMessage?: string) {
    if (!success) { showToast(errorMessage ?? t("announcement.deleteFail"), "error"); return; }
    setDeleteModalOpen(false);
    showToast(t("announcement.deleteSuccess"), "success");
    router.refresh();
  }

  type TabDef = { key: FilterStatus; label: string; count: number };
  const filterTabs: TabDef[] = [
    { key: "all",       label: t("announcement.all"),            count: totalCount },
    { key: "active",    label: t("announcement.statusActive"),   count: activeCount },
    { key: "inactive",  label: t("announcement.statusInactive"), count: totalCount - activeCount },
    { key: "scrolling", label: "Scrolling",                      count: scrollingCount },
  ];

  return (
    <div className="space-y-6">
      {/* Toast — §12 */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-100">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border ${
            toast.type === "success"
              ? "bg-white border-emerald-200 text-emerald-600"
              : "bg-white border-rose-200 text-rose-600"
          }`}>
            {toast.type === "success" ? (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}

      {/* Page header — §14 Page Header Pattern */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F1059]">
            {t("announcement.title")}
          </h1>
          <p className="text-sm text-slate-400 mt-1">จัดการประกาศและข่าวสารของระบบ</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="h-11 min-w-[44px] inline-flex items-center gap-1.5 bg-[#0F1059] hover:bg-[#161875] text-white rounded-xl px-4 text-sm font-medium transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          {t("announcement.new")}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none">{totalCount}</p>
            <p className="text-xs text-slate-400 mt-1">ประกาศทั้งหมด</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600 leading-none">{activeCount}</p>
            <p className="text-xs text-slate-400 mt-1">{t("announcement.statusActive")}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-sky-600 leading-none">{scrollingCount}</p>
            <p className="text-xs text-slate-400 mt-1">Scrolling Ticker</p>
          </div>
        </div>
      </div>

      {/* Toolbar — §15 Table Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 flex flex-wrap items-center gap-3">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 shrink-0">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filter === tab.key
                  ? "bg-white shadow-sm text-[#0F1059]"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              <span className={`inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-bold ${
                filter === tab.key ? "bg-[#0F1059]/10 text-[#0F1059]" : "bg-slate-200 text-slate-500"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="ค้นหาชื่อ, ระบบ, ผู้สร้าง..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#0F1059] focus:bg-white transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <span className="text-xs text-slate-400 shrink-0 ml-auto">
          {filteredRows.length} / {totalCount} รายการ
        </span>
      </div>

      {/* Table card — §15 Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <AnnouncementsTable
            rows={filteredRows}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />
        </div>
      </div>

      {/* Drawers & Modals */}
      <AnnouncementViewDrawer item={viewItem} open={viewOpen} onClose={() => setViewOpen(false)} onEdit={(item) => { setViewOpen(false); handleEdit(item); }} />
      <AnnouncementEditDrawer item={editItem} open={editOpen} onClose={() => setEditOpen(false)} onSaved={handleSaved} />
      <AnnouncementDeleteModal item={deleteItem} open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onDeleted={handleDeleted} />
      <AnnouncementCreateDrawer open={createOpen} onClose={() => setCreateOpen(false)} onCreated={handleCreated} />
    </div>
  );
}
