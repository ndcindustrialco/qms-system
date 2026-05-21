"use client";

import { useLocale } from "@/lib/locale-context";

type Props = { userCount: number };

export default function ItUsersPageHeader({ userCount }: Props) {
  const locale = useLocale();

  const t = {
    title:       locale === "th" ? "จัดการผู้ใช้งาน"                                               : "Manage Users",
    description: locale === "th"
      ? `ผู้ใช้ทั้งหมดที่เข้าสู่ระบบผ่าน Microsoft 365 (${userCount} คน)`
      : `All users signed in via Microsoft 365 (${userCount})`,
  };

  return (
    <h1 className="text-xl md:text-2xl font-bold text-primary">{t.title}</h1>
  );
}
