"use client";

import { createContext, useContext } from "react";

export type Locale = "th" | "en";

export const LocaleContext = createContext<Locale>("th");

export function useLocale(): Locale {
  return useContext(LocaleContext);
}
