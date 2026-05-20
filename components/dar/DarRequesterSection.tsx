"use client";

import { useT } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";

type Props = {
  name: string | null;
  employeeId: string | null;
  department: string | null;
  requestDate: string;
};

export default function DarRequesterSection({ name, employeeId, department, requestDate }: Props) {
  const t = useT();
  const locale = useLocale();

  const fields = [
    { label: t("fieldFullName"),   value: name ?? "—" },
    { label: t("fieldEmpId"),      value: employeeId ?? "—" },
    { label: t("fieldDepartment"), value: department ?? "—" },
    {
      label: t("fieldDate"),
      value: new Date(requestDate).toLocaleDateString(
        locale === "en" ? "en-GB" : "th-TH",
        { day: "2-digit", month: "long", year: "numeric" },
      ),
    },
  ];

  return (
    <div className="card-premium p-5">
      <h2 className="text-sm md:text-base font-bold text-primary mb-3">{t("sectionRequester")}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {fields.map((f) => (
          <div key={f.label}>
            <p className="text-[11px] text-gray-500">{f.label}</p>
            <p className="text-xs md:text-sm text-neutral mt-0.5">{f.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
