"use client";

import type { DarObjective, DarDocType } from "@/types/dar";
import { OBJECTIVE_LABELS, DOC_TYPE_LABELS } from "@/types/dar";
import { useT } from "@/lib/i18n";

type Props = {
  objective: DarObjective | "";
  docType: DarDocType | "";
  docTypeOther: string;
  onObjectiveChange: (v: DarObjective) => void;
  onDocTypeChange: (v: DarDocType) => void;
  onDocTypeOtherChange: (v: string) => void;
  errors?: { objective?: string; docType?: string; docTypeOther?: string };
};

export default function DarObjectiveSection({
  objective, docType, docTypeOther,
  onObjectiveChange, onDocTypeChange, onDocTypeOtherChange,
  errors,
}: Props) {
  const t = useT();

  return (
    <div className="card-premium p-5">
      <h2 className="text-sm md:text-base font-bold text-primary mb-3">{t("sectionObjective")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control gap-1">
          <label className="label py-0">
            <span className="label-text text-[14px]">{t("fieldObjective")} <span className="text-error">*</span></span>
          </label>
          <select
            className={`select select-bordered select-sm w-full text-[14px] ${errors?.objective ? "select-error" : ""}`}
            value={objective}
            onChange={(e) => onObjectiveChange(e.target.value as DarObjective)}
          >
            <option value="" disabled>{t("phSelectObjective")}</option>
            {(Object.entries(OBJECTIVE_LABELS) as [DarObjective, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          {errors?.objective && <p className="text-[12px] text-error">{errors.objective}</p>}
        </div>

        <div className="form-control gap-1">
          <label className="label py-0">
            <span className="label-text text-[14px]">{t("fieldDocType")} <span className="text-error">*</span></span>
          </label>
          <select
            className={`select select-bordered select-sm w-full text-[14px] ${errors?.docType ? "select-error" : ""}`}
            value={docType}
            onChange={(e) => onDocTypeChange(e.target.value as DarDocType)}
          >
            <option value="" disabled>{t("phSelectDocType")}</option>
            {(Object.entries(DOC_TYPE_LABELS) as [DarDocType, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          {errors?.docType && <p className="text-[12px] text-error">{errors.docType}</p>}
        </div>

        {docType === "OTHER" && (
          <div className="form-control gap-1 md:col-span-2">
            <label className="label py-0">
              <span className="label-text text-[14px]">{t("fieldDocTypeOther")} <span className="text-error">*</span></span>
            </label>
            <input
              type="text"
              className={`input input-bordered input-sm w-full text-[14px] ${errors?.docTypeOther ? "input-error" : ""}`}
              placeholder={t("phSpecifyDocType")}
              value={docTypeOther}
              onChange={(e) => onDocTypeOtherChange(e.target.value)}
              maxLength={100}
            />
            {errors?.docTypeOther && <p className="text-[12px] text-error">{errors.docTypeOther}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
