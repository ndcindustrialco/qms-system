"use client";

import type { DarAttachment } from "@/generated/prisma/client";
import { useT } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";

interface AttachmentsWidgetProps { recentAttachments: DarAttachment[] }

const CAR_ITEMS = [
  { dueTh: "31 พ.ค. 2569", dueEn: "31 May 2026" },
  { dueTh: "15 มิ.ย. 2569", dueEn: "15 Jun 2026" },
];

export function DashboardCarWidget() {
  const t = useT();
  const locale = useLocale();

  const deptKeys = ["dashboard.carWidget.production", "dashboard.carWidget.quality"] as const;

  return (
    <div className="bg-white border border-base-300 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-base-200">
        <h2 className="text-sm font-bold text-primary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          CAR
        </h2>
      </div>
      <div className="p-5 flex flex-col gap-2">
        {CAR_ITEMS.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-base-200 last:border-0">
            <div>
              <p className="text-xs font-semibold text-neutral">{t(deptKeys[i])}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {t("dashboard.carWidget.dueLabel")}: {locale === "th" ? item.dueTh : item.dueEn}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20">
              {t("dashboard.carWidget.openStatus")}
            </span>
          </div>
        ))}
        <p className="text-[11px] text-gray-400 text-center pt-1">{t("dashboard.carWidget.comingSoon")}</p>
      </div>
    </div>
  );
}

export function DashboardAttachmentsWidget({ recentAttachments }: AttachmentsWidgetProps) {
  const t = useT();
  const locale = useLocale();

  return (
    <div className="bg-white border border-base-300 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-base-200">
        <h2 className="text-sm font-bold text-primary">{t("dashboard.carWidget.recentDocsTitle")}</h2>
      </div>
      <div className="p-5 flex flex-col gap-3">
        {recentAttachments.length > 0 ? recentAttachments.map((doc) => (
          <a
            key={doc.id}
            href={doc.spWebUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-2.5 items-start group hover:bg-base-100 rounded-lg transition-colors p-1 -m-1"
          >
            <div className="mt-0.5 shrink-0">
              {doc.fileName.toLowerCase().endsWith(".pdf") ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-neutral group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {doc.fileName}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {new Date(doc.createdAt).toLocaleDateString(locale === "th" ? "th-TH" : "en-US")}
              </p>
            </div>
          </a>
        )) : (
          <p className="text-xs text-gray-400 text-center py-3">
            {t("dashboard.carWidget.recentDocsEmpty")}
          </p>
        )}
      </div>
    </div>
  );
}
