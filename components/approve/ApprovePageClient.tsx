"use client";

import Link from "next/link";
import { useAppQuery } from "@/hooks/use-app-query";
import { useT } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";
import { useUrlFilters } from "@/hooks/use-url-filters";
import PageHeader from "@/components/common/PageHeader";
import FilterBar from "@/components/common/FilterBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as Tabs from "@radix-ui/react-tabs";
import { ClipboardList, FileCheck, Clock, ShieldAlert, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import type { UserRole } from "@/generated/prisma/client";
import { isPrivilegedRole } from "@/lib/permissions";
import { ApproveSkeleton } from "./components/ApproveSkeleton";
import { RoleBanner } from "./components/RoleBanner";
import { EmptyState } from "./components/EmptyState";
import { fmtDate } from "@/lib/formatters";

type PendingDarItem = {
  darId: string;
  darNo: string | null;
  status: string;
  requestDate: string;
  requesterName: string | null;
  stepRole: string;
};

type PendingKpiItem = {
  id: string;
  kpiId: string;
  department: string;
  month: string | null;
  year: number;
  status: string;
  source: "OBJECTIVE" | "MONTHLY";
};

type PendingSummary = {
  totalPending: number;
  pendingDarCount: number;
  pendingKpiReviewCount: number;
  pendingKpiApproveCount: number;
  pendingDarItems: PendingDarItem[];
  pendingKpiReviewItems: PendingKpiItem[];
  pendingKpiApproveItems: PendingKpiItem[];
};

type Props = {
  userRole: UserRole;
};

export default function ApprovePageClient({ userRole }: Props) {
  const t = useT();
  const locale = useLocale();
  const privileged = isPrivilegedRole(userRole);

  const { params, rawValues, setParam, clearAll, hasFilters } = useUrlFilters({
    keys: ["search", "tab"],
    searchKey: "search",
  });

  const activeTab = params.tab || "dar";

  const query = useAppQuery<PendingSummary>({
    queryKey: ["approvals", "pending-summary"],
    realtimeClass: "A",
    queryFn: async () => {
      const res = await fetch("/api/approvals/pending-summary");
      if (!res.ok) throw new Error("Failed to fetch approvals");
      const json = await res.json();
      return (json.data ?? null) as PendingSummary;
    },
  });

  const data = query.data;
  const totalKpi = (data?.pendingKpiReviewCount ?? 0) + (data?.pendingKpiApproveCount ?? 0);

  const filteredDarItems = useMemo(() => {
    const items = data?.pendingDarItems ?? [];
    const searchVal = params.search?.toLowerCase().trim() || "";
    if (!searchVal) return items;
    return items.filter(
      (item) =>
        item.darNo?.toLowerCase().includes(searchVal) ||
        item.requesterName?.toLowerCase().includes(searchVal) ||
        item.darId.toLowerCase().includes(searchVal),
    );
  }, [data?.pendingDarItems, params.search]);

  const filteredKpiReviewItems = useMemo(() => {
    const items = data?.pendingKpiReviewItems ?? [];
    const searchVal = params.search?.toLowerCase().trim() || "";
    if (!searchVal) return items;
    return items.filter(
      (item) =>
        item.department.toLowerCase().includes(searchVal) ||
        (item.source === "OBJECTIVE" ? t("approve.typeObjective") : t("approve.typeMonthly"))
          .toLowerCase()
          .includes(searchVal) ||
        String(item.year).includes(searchVal) ||
        (item.month && item.month.toLowerCase().includes(searchVal)),
    );
  }, [data?.pendingKpiReviewItems, params.search, t]);

  const filteredKpiApproveItems = useMemo(() => {
    const items = data?.pendingKpiApproveItems ?? [];
    const searchVal = params.search?.toLowerCase().trim() || "";
    if (!searchVal) return items;
    return items.filter(
      (item) =>
        item.department.toLowerCase().includes(searchVal) ||
        (item.source === "OBJECTIVE" ? t("approve.typeObjective") : t("approve.typeMonthly"))
          .toLowerCase()
          .includes(searchVal) ||
        String(item.year).includes(searchVal) ||
        (item.month && item.month.toLowerCase().includes(searchVal)),
    );
  }, [data?.pendingKpiApproveItems, params.search, t]);

  if (query.isError) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("approve.title")} subtitle={t("approve.subtitle")} />
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-6">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4 text-rose-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <p className="text-slate-800 font-semibold text-base mb-1">{t("error.title")}</p>
          <p className="text-slate-400 text-sm mb-4">{t("common.errorRetry")}</p>
          <Button onClick={() => query.refetch()} variant="outline">
            {t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("approve.title")} subtitle={t("approve.subtitle")} />

      <RoleBanner role={userRole} />

      {query.isLoading ? (
        <ApproveSkeleton />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">{t("approve.totalPending")}</p>
                <p className="text-3xl font-bold text-primary">{data?.totalPending ?? 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">{t("approve.pendingDar")}</p>
                <p className="text-3xl font-bold text-amber-600">{data?.pendingDarCount ?? 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <FileCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">{t("approve.pendingKpi")}</p>
                <p className="text-3xl font-bold text-sky-600">{totalKpi}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                <ClipboardList className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Queue Tabs */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
            <Tabs.Root value={activeTab} onValueChange={(val) => setParam("tab", val)} className="space-y-6">
              <Tabs.List className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                <Tabs.Trigger
                  value="dar"
                  className="px-4 py-2 text-sm font-medium rounded-lg text-slate-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                >
                  <span>DAR</span>
                  {data && data.pendingDarCount > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                      {data.pendingDarCount}
                    </span>
                  )}
                </Tabs.Trigger>

                <Tabs.Trigger
                  value="kpi-review"
                  className="px-4 py-2 text-sm font-medium rounded-lg text-slate-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                >
                  <span>KPI ({t("kpi.form.reviewer")})</span>
                  {data && data.pendingKpiReviewCount > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-sky-50 text-sky-600 border border-sky-200">
                      {data.pendingKpiReviewCount}
                    </span>
                  )}
                </Tabs.Trigger>

                <Tabs.Trigger
                  value="kpi-approve"
                  className="px-4 py-2 text-sm font-medium rounded-lg text-slate-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                >
                  <span>KPI ({t("kpi.form.approver")})</span>
                  {data && data.pendingKpiApproveCount > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                      {data.pendingKpiApproveCount}
                    </span>
                  )}
                </Tabs.Trigger>
              </Tabs.List>

              {/* DAR Tab */}
              <Tabs.Content value="dar" className="space-y-4 outline-none">
                <FilterBar
                  searchValue={rawValues.search}
                  onSearchChange={(v) => setParam("search", v)}
                  searchPlaceholder={t("common.search")}
                  hasActiveFilters={hasFilters}
                  onClearAll={clearAll}
                  resultCount={filteredDarItems.length}
                  totalCount={data?.pendingDarCount ?? 0}
                  countLabel={t("approve.totalPending").toLowerCase()}
                />

                {filteredDarItems.length > 0 ? (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("dar.field.darNo")}</TableHead>
                            <TableHead>{t("approve.requester")}</TableHead>
                            <TableHead>{t("approve.role")}</TableHead>
                            <TableHead className="text-center">{t("approve.date")}</TableHead>
                            {privileged && <TableHead>{t("approve.accessLevel")}</TableHead>}
                            <TableHead className="text-right">{t("approve.action")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredDarItems.map((item) => (
                            <TableRow key={`${item.darId}-${item.stepRole}`}>
                              <TableCell className="font-semibold text-primary">
                                {item.darNo ?? item.darId}
                              </TableCell>
                              <TableCell className="text-slate-700">{item.requesterName ?? "-"}</TableCell>
                              <TableCell>
                                <Badge variant={item.stepRole === "REVIEWER" ? "warning" : "info"}>
                                  {item.stepRole === "REVIEWER"
                                    ? t("approve.stepReview")
                                    : t("approve.stepApprove")}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center font-mono text-slate-600">
                                {fmtDate(item.requestDate, locale)}
                              </TableCell>
                              {privileged && (
                                <TableCell>
                                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                                    <ShieldCheck className="w-3 h-3" />
                                    {t("approve.fullAccess")}
                                  </span>
                                </TableCell>
                              )}
                              <TableCell className="text-right">
                                <Button asChild size="sm">
                                  <Link
                                    href={`/approve/${item.darId}/${
                                      item.stepRole === "REVIEWER" ? "reviewer" : "approver"
                                    }?type=dar`}
                                  >
                                    {t("approve.openAction")}
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-3">
                      {filteredDarItems.map((item) => (
                        <div
                          key={`${item.darId}-${item.stepRole}`}
                          className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 space-y-3"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-sm font-semibold text-primary">{item.darNo ?? item.darId}</p>
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                              <Badge variant={item.stepRole === "REVIEWER" ? "warning" : "info"}>
                                {item.stepRole === "REVIEWER"
                                  ? t("approve.stepReview")
                                  : t("approve.stepApprove")}
                              </Badge>
                              {privileged && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                                  <ShieldCheck className="w-3 h-3" />
                                  {t("approve.fullAccess")}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1 text-xs text-slate-500">
                            <p>
                              <span className="font-medium text-slate-600">{t("approve.requester")}:</span>{" "}
                              {item.requesterName ?? "-"}
                            </p>
                            <p>
                              <span className="font-medium text-slate-600">{t("approve.date")}:</span>{" "}
                              {fmtDate(item.requestDate, locale)}
                            </p>
                          </div>
                          <div className="flex justify-end pt-1">
                            <Button asChild size="sm" className="w-full sm:w-auto">
                              <Link
                                href={`/approve/${item.darId}/${
                                  item.stepRole === "REVIEWER" ? "reviewer" : "approver"
                                }?type=dar`}
                              >
                                {t("approve.openAction")}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState label={t("approve.empty")} />
                )}
              </Tabs.Content>

              {/* KPI Review Tab */}
              <Tabs.Content value="kpi-review" className="space-y-4 outline-none">
                <FilterBar
                  searchValue={rawValues.search}
                  onSearchChange={(v) => setParam("search", v)}
                  searchPlaceholder={t("common.search")}
                  hasActiveFilters={hasFilters}
                  onClearAll={clearAll}
                  resultCount={filteredKpiReviewItems.length}
                  totalCount={data?.pendingKpiReviewCount ?? 0}
                  countLabel={t("approve.totalPending").toLowerCase()}
                />

                {filteredKpiReviewItems.length > 0 ? (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("approve.department")}</TableHead>
                            <TableHead>{t("approve.type")}</TableHead>
                            <TableHead className="text-center">{t("approve.period")}</TableHead>
                            {privileged && <TableHead>{t("approve.accessLevel")}</TableHead>}
                            <TableHead className="text-right">{t("approve.action")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredKpiReviewItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-semibold text-slate-800">{item.department}</TableCell>
                              <TableCell>
                                <Badge variant={item.source === "OBJECTIVE" ? "info" : "secondary"}>
                                  {item.source === "OBJECTIVE"
                                    ? t("approve.typeObjective")
                                    : t("approve.typeMonthly")}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center font-mono text-slate-600">
                                {item.month ? `${item.month} ${item.year}` : String(item.year)}
                              </TableCell>
                              {privileged && (
                                <TableCell>
                                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                                    <ShieldCheck className="w-3 h-3" />
                                    {t("approve.fullAccess")}
                                  </span>
                                </TableCell>
                              )}
                              <TableCell className="text-right">
                                <Button asChild size="sm">
                                  <Link
                                    href={
                                      item.source === "OBJECTIVE"
                                        ? `/approve/${item.kpiId}/reviewer?type=kpi`
                                        : `/approve/${item.id}/reviewer?type=kpi-monthly&kpiId=${item.kpiId}&year=${item.year}${item.month ? `&month=${item.month}` : ""}`
                                    }
                                  >
                                    {t("approve.openAction")}
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-3">
                      {filteredKpiReviewItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 space-y-3"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-sm font-semibold text-slate-800">{item.department}</p>
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                              <Badge variant={item.source === "OBJECTIVE" ? "info" : "secondary"}>
                                {item.source === "OBJECTIVE"
                                  ? t("approve.typeObjective")
                                  : t("approve.typeMonthly")}
                              </Badge>
                              {privileged && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                                  <ShieldCheck className="w-3 h-3" />
                                  {t("approve.fullAccess")}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            <span className="font-medium text-slate-600 font-sans">{t("approve.period")}:</span>{" "}
                            {item.month ? `${item.month} ${item.year}` : String(item.year)}
                          </div>
                          <div className="flex justify-end pt-1">
                            <Button asChild size="sm" className="w-full sm:w-auto">
                              <Link
                                href={
                                  item.source === "OBJECTIVE"
                                    ? `/approve/${item.kpiId}/reviewer?type=kpi`
                                    : `/approve/${item.id}/reviewer?type=kpi-monthly&kpiId=${item.kpiId}&year=${item.year}${item.month ? `&month=${item.month}` : ""}`
                                }
                              >
                                {t("approve.openAction")}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState label={t("approve.emptyKpiReview")} />
                )}
              </Tabs.Content>

              {/* KPI Approve Tab */}
              <Tabs.Content value="kpi-approve" className="space-y-4 outline-none">
                <FilterBar
                  searchValue={rawValues.search}
                  onSearchChange={(v) => setParam("search", v)}
                  searchPlaceholder={t("common.search")}
                  hasActiveFilters={hasFilters}
                  onClearAll={clearAll}
                  resultCount={filteredKpiApproveItems.length}
                  totalCount={data?.pendingKpiApproveCount ?? 0}
                  countLabel={t("approve.totalPending").toLowerCase()}
                />

                {filteredKpiApproveItems.length > 0 ? (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("approve.department")}</TableHead>
                            <TableHead>{t("approve.type")}</TableHead>
                            <TableHead className="text-center">{t("approve.period")}</TableHead>
                            {privileged && <TableHead>{t("approve.accessLevel")}</TableHead>}
                            <TableHead className="text-right">{t("approve.action")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredKpiApproveItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-semibold text-slate-800">{item.department}</TableCell>
                              <TableCell>
                                <Badge variant={item.source === "OBJECTIVE" ? "info" : "secondary"}>
                                  {item.source === "OBJECTIVE"
                                    ? t("approve.typeObjective")
                                    : t("approve.typeMonthly")}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center font-mono text-slate-600">
                                {item.month ? `${item.month} ${item.year}` : String(item.year)}
                              </TableCell>
                              {privileged && (
                                <TableCell>
                                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                                    <ShieldCheck className="w-3 h-3" />
                                    {t("approve.fullAccess")}
                                  </span>
                                </TableCell>
                              )}
                              <TableCell className="text-right">
                                <Button asChild size="sm">
                                  <Link
                                    href={
                                      item.source === "OBJECTIVE"
                                        ? `/approve/${item.kpiId}/approver?type=kpi`
                                        : `/approve/${item.id}/approver?type=kpi-monthly&kpiId=${item.kpiId}&year=${item.year}${item.month ? `&month=${item.month}` : ""}`
                                    }
                                  >
                                    {t("approve.openAction")}
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-3">
                      {filteredKpiApproveItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 space-y-3"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-sm font-semibold text-slate-800">{item.department}</p>
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                              <Badge variant={item.source === "OBJECTIVE" ? "info" : "secondary"}>
                                {item.source === "OBJECTIVE"
                                  ? t("approve.typeObjective")
                                  : t("approve.typeMonthly")}
                              </Badge>
                              {privileged && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                                  <ShieldCheck className="w-3 h-3" />
                                  {t("approve.fullAccess")}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            <span className="font-medium text-slate-600 font-sans">{t("approve.period")}:</span>{" "}
                            {item.month ? `${item.month} ${item.year}` : String(item.year)}
                          </div>
                          <div className="flex justify-end pt-1">
                            <Button asChild size="sm" className="w-full sm:w-auto">
                              <Link
                                href={
                                  item.source === "OBJECTIVE"
                                    ? `/approve/${item.kpiId}/approver?type=kpi`
                                    : `/approve/${item.id}/approver?type=kpi-monthly&kpiId=${item.kpiId}&year=${item.year}${item.month ? `&month=${item.month}` : ""}`
                                }
                              >
                                {t("approve.openAction")}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState label={t("approve.emptyKpiApprove")} />
                )}
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </>
      )}
    </div>
  );
}
