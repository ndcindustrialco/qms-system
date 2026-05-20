"use client";

import type { DarDetail } from "@/types/dar";
import type { SignatureType } from "@/types/dar";
import { OBJECTIVE_LABELS, DOC_TYPE_LABELS } from "@/types/dar";
import { useT } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";
import DarStatusBadge from "./DarStatusBadge";
import DarItemsTable from "./DarItemsTable";
import DarApprovalPanelWrapper from "./DarApprovalPanelWrapper";
import DarAttachmentUpload from "./DarAttachmentUpload";
import DarDraftActions from "./DarDraftActions";

interface Props {
  dar: DarDetail;
  currentUserId?: string;
  savedSignatureUrl?: string | null;
  savedSignatureType?: SignatureType | null;
}

export default function DarReadOnlyDetail({ dar, currentUserId, savedSignatureUrl, savedSignatureType }: Props) {
  const t = useT();
  const locale = useLocale();
  const isDraft = dar.status === "DRAFT";

  return (
    <div className="flex flex-col gap-6">
      {/* Header card */}
      <div className="card-premium px-5 py-4 border border-base-300 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[11px] md:text-xs text-gray-500">{t("fieldDarNo")}</p>
            <p className="text-xl md:text-2xl font-bold text-primary mt-0.5">
              {dar.darNo ?? <span className="text-gray-500 text-base">{t("fieldDarNoDraft")}</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DarStatusBadge status={dar.status} />
            {isDraft && <DarDraftActions darId={dar.id} />}
          </div>
        </div>
      </div>

      {/* Requester info */}
      <div className="card-premium border border-base-300 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-base-200">
          <h2 className="text-sm md:text-base font-bold text-primary">{t("sectionRequester")}</h2>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs md:text-sm">
          <div>
            <p className="text-[11px] md:text-xs text-gray-500">{t("fieldFullName")}</p>
            <p className="mt-0.5 font-medium">{dar.requester.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] md:text-xs text-gray-500">{t("fieldEmpId")}</p>
            <p className="mt-0.5 font-medium">{dar.requester.employeeId ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] md:text-xs text-gray-500">{t("fieldDepartment")}</p>
            <p className="mt-0.5 font-medium">{dar.requester.department?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] md:text-xs text-gray-500">{t("fieldDate")}</p>
            <p className="mt-0.5 font-medium">
              {new Date(dar.requestDate).toLocaleDateString(
                locale === "en" ? "en-GB" : "th-TH",
                { day: "2-digit", month: "long", year: "numeric" },
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Objective & Doc type */}
      <div className="card-premium border border-base-300 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-base-200">
          <h2 className="text-sm md:text-base font-bold text-primary">{t("sectionObjective")}</h2>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
          <div>
            <p className="text-[11px] md:text-xs text-gray-500">{t("fieldObjective")}</p>
            <p className="mt-0.5 font-medium">{OBJECTIVE_LABELS[dar.objective]}</p>
          </div>
          <div>
            <p className="text-[11px] md:text-xs text-gray-500">{t("fieldDocType")}</p>
            <p className="mt-0.5 font-medium">
              {DOC_TYPE_LABELS[dar.docType]}
              {dar.docTypeOther && ` — ${dar.docTypeOther}`}
            </p>
          </div>
        </div>
      </div>

      {/* Reason */}
      <div className="card-premium border border-base-300 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-base-200">
          <h2 className="text-sm md:text-base font-bold text-primary">{t("sectionReason")}</h2>
        </div>
        <div className="p-5">
          <p className="text-xs md:text-sm text-neutral whitespace-pre-wrap">{dar.reason}</p>
        </div>
      </div>

      {/* Items */}
      <div className="card-premium border border-base-300 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-base-200">
          <h2 className="text-sm md:text-base font-bold text-primary">
            {t("sectionItems")} ({dar.items.length} {locale === "en" ? "items" : "รายการ"})
          </h2>
        </div>
        <div className="p-5">
          <DarItemsTable items={dar.items} />
        </div>
      </div>

      {/* Distribution */}
      <div className="card-premium border border-base-300 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-base-200">
          <h2 className="text-sm md:text-base font-bold text-primary">{t("sectionDistrib")}</h2>
        </div>
        <div className="p-5">
          {dar.distributions.length === 0 ? (
            <p className="text-xs md:text-sm text-gray-500">{t("noDeptFound")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {dar.distributions.map((d) => (
                <span key={d.departmentId} className="inline-block px-2.5 py-0.5 text-[11px] rounded-full font-bold border border-base-300 text-neutral bg-base-100">
                  {d.department.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Attachments */}
      <div className="card-premium border border-base-300 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-base-200">
          <h2 className="text-sm md:text-base font-bold text-primary">{t("sectionAttach")}</h2>
        </div>
        <div className="p-5">
          <DarAttachmentUpload
            mode="saved"
            darId={dar.id}
            initialAttachments={dar.attachments}
            canEdit={
              !!currentUserId &&
              dar.status !== "COMPLETED" &&
              dar.status !== "CANCELLED"
            }
          />
        </div>
      </div>

      {/* Approval panel */}
      {currentUserId && dar.status !== "DRAFT" && (
        <DarApprovalPanelWrapper
          initialDar={dar}
          currentUserId={currentUserId}
          savedSignatureUrl={savedSignatureUrl}
          savedSignatureType={savedSignatureType}
        />
      )}
    </div>
  );
}
