"use client";

import type { DarItemInput } from "@/types/dar";
import { useT } from "@/lib/i18n";

type ItemRow = Omit<DarItemInput, "itemNo">;

type Props = {
  items: ItemRow[];
  onChange: (items: ItemRow[]) => void;
  errors?: Record<string, string>;
};

export default function DarItemsSection({ items, onChange, errors }: Props) {
  const t = useT();

  function addRow() {
    onChange([...items, { docNumber: "", docName: "", revision: "" }]);
  }

  function removeRow(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }

  function updateRow(idx: number, field: keyof ItemRow, value: string) {
    onChange(items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  }

  return (
    <div className="card-premium p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm md:text-base font-bold text-primary">{t("sectionItems")} <span className="text-error">*</span></h2>
        <button type="button" onClick={addRow} className="btn btn-ghost btn-xs gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t("addItem")}
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-[14px] text-neutral text-center py-4">{t("emptyItems")}</p>
      )}

      {items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr className="bg-base-200 text-[14px] text-neutral border-b border-base-300">
                <th className="py-2 px-2 font-medium w-12">{t("colNo")}</th>
                <th className="py-2 px-2 font-medium">{t("colDocNum")} <span className="text-error">*</span></th>
                <th className="py-2 px-2 font-medium">{t("colDocName")} <span className="text-error">*</span></th>
                <th className="py-2 px-2 font-medium w-28">{t("colRevision")} <span className="text-error">*</span></th>
                <th className="py-2 px-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-base-300">
                  <td className="py-2 px-2 text-neutral text-[14px]">{idx + 1}</td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      className={`input input-bordered input-xs w-full text-[14px] ${errors?.[`items.${idx}.docNumber`] ? "input-error" : ""}`}
                      value={item.docNumber}
                      onChange={(e) => updateRow(idx, "docNumber", e.target.value)}
                      placeholder={t("phDocNum")}
                      maxLength={100}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      className={`input input-bordered input-xs w-full text-[14px] ${errors?.[`items.${idx}.docName`] ? "input-error" : ""}`}
                      value={item.docName}
                      onChange={(e) => updateRow(idx, "docName", e.target.value)}
                      placeholder={t("phDocName")}
                      maxLength={255}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      className={`input input-bordered input-xs w-full text-[14px] ${errors?.[`items.${idx}.revision`] ? "input-error" : ""}`}
                      value={item.revision}
                      onChange={(e) => updateRow(idx, "revision", e.target.value)}
                      placeholder={t("phRevision")}
                      maxLength={50}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="btn btn-ghost btn-xs text-error"
                      disabled={items.length === 1}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {errors?.items && <p className="text-[12px] text-error mt-2">{errors.items}</p>}
    </div>
  );
}
