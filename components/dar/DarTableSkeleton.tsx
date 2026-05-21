"use client";

import { useT } from "@/lib/i18n";

export default function DarTableSkeleton() {
  const t = useT();

  return (
    <>
      {/* Hero banner skeleton */}
      <div className="rounded-xl h-18 mb-6 skeleton" />

      {/* Desktop table skeleton */}
      <div className="hidden md:block card-premium overflow-hidden">
        <table className="table w-full">
          <thead>
            <tr className="border-b border-base-200">
              <th className="th-pro">{t("fieldDarNo")}</th>
              <th className="th-pro">{t("fieldDate")}</th>
              <th className="th-pro">{t("fieldObjective")}</th>
              <th className="th-pro">{t("fieldDocType")}</th>
              <th className="th-pro">{t("sectionItems")}</th>
              <th className="th-pro">Status</th>
              <th className="py-3.5 px-4" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-base-200">
                <td className="py-3.5 px-4"><div className="skeleton h-4 w-28 rounded" /></td>
                <td className="py-3.5 px-4"><div className="skeleton h-4 w-20 rounded" /></td>
                <td className="py-3.5 px-4"><div className="skeleton h-4 w-36 rounded" /></td>
                <td className="py-3.5 px-4"><div className="skeleton h-4 w-20 rounded" /></td>
                <td className="py-3.5 px-4"><div className="skeleton h-6 w-6 rounded-full mx-auto" /></td>
                <td className="py-3.5 px-4"><div className="skeleton h-5 w-24 rounded-full" /></td>
                <td className="py-3.5 px-4"><div className="skeleton h-7 w-20 rounded-md ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card skeleton */}
      <div className="md:hidden flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-premium p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex flex-col gap-1.5">
                <div className="skeleton h-4 w-28 rounded" />
                <div className="skeleton h-3 w-20 rounded" />
              </div>
              <div className="skeleton h-5 w-20 rounded-full" />
            </div>
            <div className="flex flex-col gap-2 border-t border-base-200 pt-3">
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-4/5 rounded" />
              <div className="skeleton h-3 w-3/5 rounded" />
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <div className="skeleton h-8 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
