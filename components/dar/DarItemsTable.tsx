"use client";

import type { DarItemInput } from "@/types/dar";
import { useT } from "@/lib/i18n";

export default function DarItemsTable({ items }: { items: DarItemInput[] }) {
  const t = useT();

  if (items.length === 0) {
    return <p className="text-[14px] text-neutral">{t("emptyItemsTable")}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm w-full">
        <thead>
          <tr className="bg-base-200 text-[14px] text-neutral border-b border-base-300">
            <th className="py-3 px-4 font-medium w-16">{t("colNo")}</th>
            <th className="py-3 px-4 font-medium">{t("colDocNum")}</th>
            <th className="py-3 px-4 font-medium">{t("colDocName")}</th>
            <th className="py-3 px-4 font-medium w-28">{t("colRevision")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.itemNo} className="border-b border-base-300 text-[14px] hover:bg-base-200 transition-colors duration-100">
              <td className="py-3 px-4 text-neutral">{item.itemNo}</td>
              <td className="py-3 px-4">{item.docNumber}</td>
              <td className="py-3 px-4">{item.docName}</td>
              <td className="py-3 px-4">{item.revision}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
