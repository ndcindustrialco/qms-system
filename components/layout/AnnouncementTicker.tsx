"use client";

import { useEffect, useState } from "react";

type TickerItem = { id: string; title: string; sourceSystem: string };

type Props = {
  locale: "th" | "en";
};

export default function AnnouncementTicker({ locale }: Props) {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/announcements/ticker")
      .then((r) => r.json())
      .then((d: { data: TickerItem[] }) => {
        if (d.data) setItems(d.data);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || items.length === 0) return null;

  const tickerText = items.map((item) => item.title).join("   ·   ");

  return (
    <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
      {/* Label badge */}
      <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md bg-white/15 border border-white/20" style={{ color: "var(--sidebar-text-active)" }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
        {locale === "th" ? "ข่าวสาร" : "News"}
      </span>

      {/* Divider */}
      <span className="shrink-0 w-px h-4 bg-white/20" />

      {/* Scrolling text */}
      <div className="overflow-hidden flex-1 relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 z-10" style={{ background: "linear-gradient(to right, var(--sidebar-bg-from), transparent)" }} />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 z-10" style={{ background: "linear-gradient(to left, oklch(19% 0.115 264), transparent)" }} />

        {/* Ticker content — duplicated for seamless loop */}
        <div className="flex whitespace-nowrap animate-ticker">
          <span className="text-[13px] pr-16" style={{ color: "var(--sidebar-text)" }}>
            {tickerText}
          </span>
          <span className="text-[13px] pr-16" style={{ color: "var(--sidebar-text)" }}>
            {tickerText}
          </span>
        </div>
      </div>
    </div>
  );
}
