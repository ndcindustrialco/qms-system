"use client";

import { useT } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";

type Props = {
  titleKey: TranslationKey;
  subtitleKey?: TranslationKey;
};

export default function LocalizedPageTitle({ titleKey, subtitleKey }: Props) {
  const t = useT();
  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-primary">{t(titleKey)}</h1>
      {subtitleKey && (
        <p className="text-xs md:text-sm text-gray-500 mt-0.5">{t(subtitleKey)}</p>
      )}
    </div>
  );
}
