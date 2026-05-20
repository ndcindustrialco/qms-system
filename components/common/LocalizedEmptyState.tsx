"use client";

import EmptyState from "./EmptyState";
import { useT } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";

type Props = {
  titleKey: TranslationKey;
  descriptionKey?: TranslationKey;
  ctaLabelKey?: TranslationKey;
  ctaHref?: string;
};

export default function LocalizedEmptyState({ titleKey, descriptionKey, ctaLabelKey, ctaHref }: Props) {
  const t = useT();
  return (
    <EmptyState
      title={t(titleKey)}
      description={descriptionKey ? t(descriptionKey) : undefined}
      ctaLabel={ctaLabelKey ? t(ctaLabelKey) : undefined}
      ctaHref={ctaHref}
    />
  );
}
