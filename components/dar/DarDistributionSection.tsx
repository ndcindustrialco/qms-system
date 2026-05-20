"use client";

import { useT } from "@/lib/i18n";

type Props = {
  departments: { id: string; name: string }[];
  selected: string[];
  onChange: (ids: string[]) => void;
};

export default function DarDistributionSection({ departments, selected, onChange }: Props) {
  const t = useT();

  function toggle(id: string) {
    onChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id],
    );
  }

  return (
    <div className="card-premium p-4">
      <h2 className="text-sm md:text-base font-bold text-primary mb-3">{t("sectionDistrib")}</h2>
      {departments.length === 0 ? (
        <p className="text-xs md:text-sm text-gray-500">{t("noDeptFound")}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {departments.map((dept) => (
            <label key={dept.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-primary"
                checked={selected.includes(dept.id)}
                onChange={() => toggle(dept.id)}
              />
              <span className="text-xs md:text-sm text-neutral">{dept.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
