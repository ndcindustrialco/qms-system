"use client";

import { useMemo } from "react";
import type { UserWithDept } from "@/types/user";
import { useRouter } from "next/navigation";
import MrUserRow from "@/components/qms/MrUserRow";
import Toast from "@/components/common/Toast";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/lib/locale-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/common/PageHeader";
import FilterBar from "@/components/common/FilterBar";
import Pagination from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { useState } from "react";

type Props = { initialUsers: UserWithDept[] };

export default function MrManagementClient({ initialUsers }: Props) {
  const locale = useLocale();
  const isTh = locale === "th";
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const mrUsers = useMemo(() => initialUsers.filter((u) => u.role === "MR"), [initialUsers]);

  // ── URL-bound search (debounced) ───────────────────────────────────────────
  const { params, rawValues, setParam } = useUrlFilters({
    keys: ["search", "page"] as const,
    searchKey: "search",
    debounceMs: 300,
  });

  const filtered = useMemo(() => {
    const q = params.search.toLowerCase().trim();
    if (!q) return initialUsers;
    return initialUsers.filter((u) =>
      [u.name, u.email, u.department?.name].join(" ").toLowerCase().includes(q),
    );
  }, [initialUsers, params.search]);

  // ── Client-side pagination ────────────────────────────────────────────────
  const PAGE_SIZE = 20;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function handleToggle(userId: string, newRole: "MR" | "USER") {
    setLoadingId(userId);
    try {
      const res = await fetch(`/api/qms/mr/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        showToast("error", json.error ?? (isTh ? "เกิดข้อผิดพลาด" : "An error occurred"));
        return;
      }
      showToast("success", isTh ? "อัปเดตสำเร็จ" : "Updated successfully");
      router.refresh();
    } catch {
      showToast("error", isTh ? "เกิดข้อผิดพลาด" : "An error occurred");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <PageHeader
        title={isTh ? "กำหนดผู้แทนฝ่ายบริหาร (MR)" : "Set Management Representative (MR)"}
        subtitle={isTh ? "กำหนดสิทธิ์ MR ให้กับผู้ใช้ในระบบ" : "Assign MR role to users in the system"}
        actions={
          <span className="flex items-center gap-2">
            <span className="text-[11px] text-neutral">{isTh ? "MR ปัจจุบัน" : "Current MR"}:</span>
            <span className="px-2.5 py-1 text-[12px] font-bold rounded-full bg-warning/15 text-warning">
              {mrUsers.length} {isTh ? "คน" : "user(s)"}
            </span>
          </span>
        }
      />

      {/* Current MR highlight */}
      {mrUsers.length > 0 && (
        <div className="bg-warning/5 border border-warning/20 rounded-xl px-5 py-4">
          <p className="text-[12px] font-bold text-warning mb-3">
            {isTh ? "ผู้แทนฝ่ายบริหาร (MR) ปัจจุบัน" : "Current Management Representatives"}
          </p>
          <div className="flex flex-wrap gap-2">
            {mrUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-2 bg-white border border-warning/30 rounded-lg px-3 py-2">
                <div className="w-6 h-6 rounded-full bg-warning/20 text-warning flex items-center justify-center text-[10px] font-bold shrink-0">
                  {(u.name ?? u.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-neutral">{u.name ?? u.email}</p>
                  {u.department && <p className="text-[10px] text-gray-400">{u.department.name}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <FilterBar
        searchValue={rawValues.search}
        onSearchChange={(v) => setParam("search", v)}
        searchPlaceholder={isTh ? "ค้นหาชื่อ, อีเมล, แผนก..." : "Search name, email, department..."}
        resultCount={filtered.length}
        totalCount={initialUsers.length}
        countLabel={isTh ? "คน" : "users"}
      />

      {/* Mobile Card List */}
      <div className="lg:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 text-center">
            <p className="text-slate-500 text-sm">{isTh ? "ไม่พบผู้ใช้" : "No users found"}</p>
          </div>
        ) : (
          paginated.map((user) => {
            const isMr = user.role === "MR";
            const canToggle = user.role === "USER" || user.role === "MR";
            return (
              <div
                key={user.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                        {((user.name ?? user.email) || "-").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-800 leading-tight">
                          {user.name ?? "—"}
                          {isMr && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700">
                              MR
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400 font-mono truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                    isMr ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {isTh ? (isMr ? "ผู้แทนฝ่ายบริหาร" : "ผู้ใช้งาน") : (isMr ? "Mgmt. Rep." : "User")}
                  </span>
                </div>

                {user.department && (
                  <p className="text-xs text-slate-500 pl-10">{user.department.name}</p>
                )}

                {canToggle && (
                  <div className="pt-2 border-t border-slate-100">
                    <Button
                      size="sm"
                      variant={isMr ? "outline" : "default"}
                      disabled={loadingId === user.id}
                      onClick={() => handleToggle(user.id, isMr ? "USER" : "MR")}
                      className={`w-full gap-1.5 ${
                        isMr ? "text-amber-600 border-amber-200 hover:bg-amber-50" : ""
                      }`}
                    >
                      {loadingId === user.id && (
                        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      )}
                      {isMr
                        ? (isTh ? "ยกเลิก MR" : "Remove MR")
                        : (isTh ? "ตั้งเป็น MR" : "Set as MR")}
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table */}
      <div className="card-premium overflow-hidden shadow-sm hidden lg:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isTh ? "ชื่อ" : "Name"}</TableHead>
                <TableHead className="hidden md:table-cell">{isTh ? "อีเมล" : "Email"}</TableHead>
                <TableHead className="hidden md:table-cell">{isTh ? "แผนก" : "Department"}</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">{isTh ? "การจัดการ" : "Action"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-400">
                    {isTh ? "ไม่พบผู้ใช้" : "No users found"}
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((user) => (
                  <MrUserRow
                    key={user.id}
                    user={user}
                    onToggle={handleToggle}
                    loading={loadingId === user.id}
                    isTh={isTh}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination
        page={safePage}
        totalPages={totalPages}
        total={filtered.length}
        countLabel={isTh ? "คน" : "users"}
        onPageChange={(p) => setParam("page", String(p))}
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={hideToast}
          duration={toast.type === "error" ? 0 : 4000}
        />
      )}
    </div>
  );
}
