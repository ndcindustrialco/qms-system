# NDC UI Design System — Audit Report
**Date:** 2026-05-26  
**Scope:** All files under `/app` and `/components`  
**Standard Reference:** NDC Design System Skill (ndc-design)

---

## Audit Legend
- ✓ Correct — matches NDC standard
- ✗ Deviation — does not match NDC standard (corrected value shown)

---

## 1. Page Layout Files (`/app`)

### 1.1 `app/(dashboard)/qms/announcements/page.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| L1 | Max-width | ✓ | `max-w-7xl mx-auto` |
| L2 | Padding | ✓ | `px-4 md:px-6 lg:px-8 py-6` |
| L3 | Background | ✗ | No `bg-slate-100` wrapper on page shell — should be `min-h-screen bg-slate-100` (likely delegated to layout shell; verify layout file) |

---

### 1.2 `app/(dashboard)/(user)/dar/[id]/page.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| L1 | Max-width | ✓ | `max-w-7xl mx-auto` |
| L2 | Padding | ✓ | `px-4 md:px-6 lg:px-8 py-6` |
| L3 | Breadcrumb text | ✓ | `text-sm text-slate-400` for nav, `text-slate-600 font-medium` for current item |
| T1 | Breadcrumb color | ✓ | `text-slate-400` → `hover:text-slate-600` |

---

### 1.3 `app/(dashboard)/page.tsx` (Dashboard Root)

| # | Check | Result | Details |
|---|-------|--------|---------|
| L1 | Max-width | ✗ | Uses `max-w-350` (custom/non-standard) — should be `max-w-7xl` |
| L2 | Padding | ✓ | `px-4 md:px-8` via layout shell |
| S1 | Section gap | ✗ | `gap-5` — should be `gap-6` |

---

## 2. Dashboard Components (`/components/dashboard`)

### 2.1 `DashboardClientView.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| L1 | Max-width | ✗ | `max-w-350` — non-standard, should be `max-w-7xl mx-auto` |
| L2 | Grid gap | ✗ | `gap-5` — should be `gap-6` |
| C1 | Card background | ✓ | `bg-white` |
| C2 | Card radius | ✗ | `rounded-xl` — should be `rounded-2xl` |
| C3 | Card border | ✗ | `border-base-300` (DaisyUI token) — should be `border-slate-100` |
| C4 | Card shadow | ✗ | `shadow-sm` — should be `shadow-[0_8px_30px_rgb(0,0,0,0.04)]` |
| C5 | Card header border | ✗ | `border-base-200` (DaisyUI) — should be `border-slate-100` |
| T1 | Section title | ✗ | `text-sm font-bold text-primary` — should be `text-xl font-semibold text-slate-800`; also `text-primary` is a DaisyUI token, should be explicit `text-[#0F1059]` |
| T2 | Caption text color | ✗ | `text-gray-400` — should be `text-slate-400` |
| T3 | Caption font size | ✗ | `text-[11px]` (arbitrary) — should use `text-xs` |
| S1 | Left col gap | ✗ | `gap-5` — should be `gap-6` |
| S2 | Card inner padding | ✗ | `p-5` (header `px-5 py-4`) — should be `p-6` for standard card or `p-4` for compact |

---

### 2.2 `HeroBanner.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| C1 | Card radius | ✓ | `rounded-2xl` |
| C2 | Background | ✗ | Uses `linear-gradient` with custom hex colors — acceptable for a hero/banner component as it is decorative, but brand primary `#0F1059` is present ✓ |
| T1 | Page title in banner | ✗ | `text-xl md:text-[1.6rem] font-bold` — `text-[1.6rem]` is an arbitrary size, should use `text-2xl` |
| T2 | Badge text | ✗ | `text-[10px] font-black uppercase tracking-[0.18em]` — arbitrary sizes; should use `text-xs font-bold uppercase tracking-wide` |
| B1 | Button styling | ✗ | Banner buttons use custom inline styles — missing `h-11 min-w-[44px]` minimum touch target |

---

### 2.3 `DashboardKpiWidget.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| T1 | KPI count | ✓ | `text-2xl font-black font-mono text-primary` (primary maps to `#0F1059`) |
| C1 | Ring colors | ✗ | Uses hardcoded hex `#10B981`, `#EF4444`, `#F59E0B` in JS — should use NDC tokens `emerald-600`, `rose-600`, `amber-600` in Tailwind classes instead |
| C2 | Center hole | ✓ | `bg-white` |

---

### 2.4 `DashboardQuickActions.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| C1 | Card radius | ✗ | `rounded-xl` — should be `rounded-2xl` for cards |
| C2 | Card border | ✗ | `border-base-300` (DaisyUI) — should be `border-slate-100` |
| C3 | Card shadow | ✗ | No explicit NDC shadow — should be `shadow-[0_8px_30px_rgb(0,0,0,0.04)]` |
| T1 | Label text | ✗ | `text-[13px] font-bold` — arbitrary size, should be `text-sm font-semibold` |
| T2 | Sub-label text | ✗ | `text-[11px] text-gray-400` — should be `text-xs text-slate-400` |
| S1 | Grid gap | ✗ | `gap-3` — acceptable for compact/dense mode |

---

### 2.5 `DashboardAnnouncementsFeed.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| T1 | Item title | ✗ | `text-sm font-semibold text-neutral` — `text-neutral` is DaisyUI, should be `text-slate-800` |
| T2 | Description | ✗ | `text-xs text-gray-500` — should be `text-slate-400` |
| C1 | Badge style | ✗ | `text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm text-white` — `rounded-sm` should be `rounded-full`, arbitrary `text-[10px]` should be `text-xs` |
| C2 | Source color map | ✗ | `SOURCE_COLORS` uses arbitrary hex values per system — NDC doesn't define per-system colors; acceptable as product decision, but format should use Tailwind classes |

---

## 3. Announcement Components (`/components/announcements`)

### 3.1 `AnnouncementsTableClient.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| L1 | Content wrapper | ✓ | `space-y-6` |
| T1 | Page title | ✗ | `text-2xl font-bold tracking-tight text-slate-800` — should be `text-[#0F1059]` per NDC page title spec |
| T2 | Subtitle | ✓ | `text-sm text-slate-400 mt-1` |
| B1 | Create button | ✓ | `bg-[#0F1059] hover:bg-[#161875] text-white rounded-xl px-4 py-2 text-sm font-medium` |
| B2 | Create button height | ✗ | No `h-11` — minimum touch target missing |
| C1 | Stat card | ✓ | `bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4` (compact card) |
| T3 | Stat label | ✗ | `text-xs text-slate-500` — should be `text-slate-400` for caption/metadata |
| S1 | Stat grid gap | ✗ | `gap-4` — standard bento gap should be `gap-6`; `gap-4` is acceptable for compact only |
| C2 | Toolbar card | ✓ | `bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]` |
| C3 | Toolbar padding | ✗ | `px-5 py-4` — non-standard; should be `p-4` (compact) or `p-6` (standard) |
| C4 | Filter tab (active) | ✓ | `bg-white shadow-sm text-[#0F1059]` |
| C5 | Filter tab (inactive) | ✓ | `text-slate-500 hover:text-slate-700` |
| I1 | Search input | ✓ | `bg-slate-50/50 border border-slate-200 rounded-xl focus:border-[#0F1059] focus:bg-white` |
| C6 | Table container | ✓ | `bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden` |
| C7 | Toast success | ✓ | `bg-white border-emerald-200 text-emerald-600` |
| C8 | Toast error | ✓ | `bg-white border-rose-200 text-rose-600` |

---

### 3.2 `AnnouncementsTable.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| C1 | Table header row | ✓ | `bg-slate-50 border-b border-slate-100` |
| C2 | Table header sticky | ✗ | No `sticky top-0 z-10` — should be sticky per NDC table spec |
| T1 | Header cells | ✓ | `text-slate-800 text-sm font-semibold px-4 py-3` |
| C3 | Empty state icon | ✓ | `w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center` |
| T2 | Empty state title | ✓ | `text-slate-800 font-semibold text-base mb-1` |
| T3 | Empty state desc | ✓ | `text-slate-400 text-sm` |

---

### 3.3 `AnnouncementTableRow.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| C1 | Table row | ✓ | `bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors` |
| T1 | Title text | ✗ | `text-sm font-medium text-slate-800` — table data body should be `text-slate-600`; `text-slate-800` is for primary identifiers/headings only |
| T2 | Date cells | ✓ | `text-xs font-mono text-slate-600 / text-slate-400` |
| C2 | HR system badge | ✗ | `bg-violet-50 text-violet-700` — `violet` is not an NDC token; should map to a defined state token (e.g. use `bg-sky-50 text-sky-600` or define in brand tokens) |
| C3 | SCROLLING badge | ✓ | `bg-sky-50 text-sky-600 rounded-full` |
| C4 | LIST badge | ✓ | `bg-slate-100 text-slate-500 rounded-full` |
| C5 | Status active text | ✓ | `text-emerald-600` |
| C6 | Status inactive text | ✓ | `text-slate-400` |
| B1 | Action icon buttons height | ✗ | `h-8 w-8` — must be `h-11 min-w-[44px]` per NDC accessibility rule |
| B2 | View button color | ✗ | `text-[#1D6A8A]` — non-NDC custom hex; should use `text-sky-600` |
| B3 | Edit button color | ✗ | `text-amber-500` — should be `text-amber-600` (NDC warning token) |
| C7 | Toggle (DaisyUI) | ✗ | `toggle toggle-sm toggle-success` — DaisyUI component not overridden with NDC tokens |

---

### 3.4 `AnnouncementCreateDrawer.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| C1 | Drawer container | ✓ | `fixed inset-0 z-50 flex items-end lg:items-stretch lg:justify-end` (mobile bottom sheet + desktop half panel) |
| C2 | Drawer width | ✓ | Mobile `w-full max-h-[92vh] rounded-t-2xl`, Desktop `lg:w-1/2` |
| C3 | Backdrop | ✓ | `bg-black/30` |
| C4 | Header border | ✓ | `px-6 py-4 border-b border-slate-100` |
| T1 | Drawer title | ✓ | `text-lg font-semibold text-slate-800` |
| T2 | Drawer subtitle | ✓ | `text-xs text-slate-400 mt-0.5` |
| B1 | Close button height | ✗ | `h-9 w-9` — must be `h-11 min-w-[44px]` |
| B2 | Close button focus ring | ✓ | `focus-visible:ring-2 focus-visible:ring-[#0F1059] focus-visible:ring-offset-2` |
| I1 | Input styling | ✓ | `bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:border-[#0F1059] focus:bg-white` |
| I2 | Label styling | ✓ | `text-slate-800 text-sm font-semibold mb-2 block` |
| I3 | Required indicator | ✓ | `text-rose-600 *` |
| I4 | Helper text | ✓ | `text-slate-400 text-xs mt-1` |
| C5 | Body spacing | ✓ | `px-6 py-6 space-y-4` |
| C6 | Footer border | ✓ | `px-6 py-4 border-t border-slate-100 flex justify-end gap-2` |
| B3 | Cancel button | ✓ | `bg-white text-slate-700 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium hover:bg-slate-50` |
| B4 | Cancel button height | ✗ | No `h-11` — minimum touch target missing |
| B5 | Save button | ✓ | `bg-[#0F1059] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#161875]` |
| B6 | Save button height | ✗ | No `h-11` — minimum touch target missing |
| C7 | Checkbox (DaisyUI) | ✗ | `checkbox checkbox-primary` — DaisyUI component not overridden with NDC tokens |
| C8 | File input (DaisyUI) | ✗ | `file-input file-input-bordered` — DaisyUI component not overridden |
| C9 | Mobile drag handle | ✓ | `w-10 h-1 rounded-full bg-slate-200` |

---

### 3.5 `AnnouncementEditDrawer.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| — | All checks | See 3.4 | Identical structure to CreateDrawer — same issues apply |
| B1 | Close button height | ✗ | `h-9 w-9` — must be `h-11 min-w-[44px]` |
| B2 | Cancel/Save buttons | ✗ | Missing `h-11` |
| I1 | Inputs/Labels | ✓ | Same NDC-compliant pattern as CreateDrawer |
| C1 | Checkbox | ✗ | `checkbox checkbox-primary` — DaisyUI not overridden |

---

### 3.6 `AnnouncementViewDrawer.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| C1 | Drawer structure | ✓ | Matches NDC drawer pattern |
| C2 | Width | ✗ | `lg:w-96` (384px) — NDC spec says `w-full md:w-1/2`; narrower view drawer is a product decision, acceptable for read-only view |
| T1 | Header title | ✓ | `text-lg font-semibold text-slate-800` |
| B1 | Close button height | ✗ | `h-9 w-9` — must be `h-11 min-w-[44px]` |
| B2 | Close/Edit buttons | ✗ | Missing `h-11` |
| B3 | Edit button | ✓ | `bg-[#0F1059] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#161875]` |

---

### 3.7 `AnnouncementViewFields.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| T1 | Field label | ✓ | `text-xs text-slate-400 mb-1 font-medium tracking-wide uppercase block` |
| T2 | Field value | ✓ | `text-sm text-slate-800 font-medium` |
| T3 | Content body text | ✓ | `text-sm text-slate-600 whitespace-pre-wrap leading-relaxed` |
| T4 | Date values | ✓ | `text-sm font-mono text-slate-600` |
| C1 | Active badge | ✗ | `bg-emerald-50 text-emerald-600 rounded-full` — missing `border border-emerald-200` |
| C2 | Inactive badge | ✗ | `bg-slate-100 text-slate-500 rounded-full` — missing `border border-slate-200` |
| C3 | Source system badge | ✓ | `bg-[#0F1059]/10 text-[#0F1059]` |
| C4 | Display type badge | ✓ | `bg-sky-50 text-sky-600` (Scrolling) / `bg-slate-100 text-slate-500` (List) |
| T5 | No attachment text | ✓ | `text-sm text-slate-400` |
| C5 | Attachment link color | ✗ | `text-[#1D6A8A]` — non-NDC hex; should be `text-sky-600` |
| S1 | Body spacing | ✓ | `px-6 py-6 space-y-5` |

---

### 3.8 `AnnouncementDeleteModal.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| C1 | Modal element | ✓ | `dialog modal-open` |
| C2 | Modal box | ✓ | `modal-box rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-md w-full` |
| C3 | Icon container | ✗ | `w-10 h-10 rounded-full bg-rose-50` — NDC spec shows `rounded-xl` for icon containers in modals |
| T1 | Modal title | ✓ | `text-base font-semibold text-slate-800` |
| T2 | Subtitle (item name) | ✓ | `text-xs text-slate-400 mt-0.5` |
| T3 | Body text | ✓ | `text-sm text-slate-600 mb-6` |
| B1 | Cancel button | ✓ | `bg-white text-slate-700 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium hover:bg-slate-50` |
| B2 | Cancel button height | ✗ | Missing `h-11` |
| B3 | Delete button | ✓ | `bg-rose-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-rose-700` |
| B4 | Delete button height | ✗ | Missing `h-11` |
| C4 | Backdrop | ✓ | `modal-backdrop` with `onClick` |

---

## 4. DAR Components (`/components/dar`)

### 4.1 `DarListHeader.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| C1 | Container | ✓ | `bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]` |
| C2 | Padding | ✗ | `px-6 py-5` — non-standard; NDC says `p-6` for standard cards |
| T1 | Page title | ✓ | `text-2xl font-bold text-[#0F1059] leading-tight tracking-tight` |
| T2 | Subtitle | ✗ | `text-xs text-slate-400 mt-1` — `text-xs` is caption size; page subtitle should be `text-sm text-slate-400` |
| B1 | Create button | ✓ | `bg-[#0F1059] hover:bg-[#161875] text-white rounded-xl px-4 py-2 text-sm font-medium` |
| B2 | Create button height | ✗ | Missing `h-11 min-w-[44px]` |

---

### 4.2 `DarListClient.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| C1 | Toolbar card | ✓ | `bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]` |
| C2 | Toolbar padding | ✗ | `px-5 py-4` — non-standard; should be `p-4` (compact) or `p-6` (standard) |
| I1 | Search input | ✓ | `bg-slate-50/50 border border-slate-200 rounded-xl focus:border-[#0F1059] focus:bg-white` |
| I2 | Filter selects | ✓ | `bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-sm focus:border-[#0F1059]` |
| C3 | Sort toggle button | ✓ | `p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#0F1059]` |
| C4 | Empty state container | ✓ | `bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-16 text-center` |
| T1 | Empty state title | ✓ | `text-slate-800 font-semibold text-base mb-1` |
| T2 | Empty state desc | ✓ | `text-slate-400 text-sm mb-4` |
| B1 | Empty state CTA | ✓ | `bg-[#0F1059] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#161875]` |
| B2 | Empty state CTA height | ✗ | Missing `h-11` |
| C5 | Result count | ✓ | `text-xs text-slate-400 ml-auto shrink-0` |

---

### 4.3 `DarTable.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| C1 | Table container | ✓ | `hidden lg:block bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden` |
| C2 | Header row | ✓ | `bg-slate-50 border-b border-slate-100` |
| C3 | Header sticky | ✗ | No `sticky top-0 z-10` — should be sticky per NDC spec |
| T1 | Header cells | ✓ | `text-slate-800 text-sm font-semibold px-4 py-3` |
| C4 | Data rows | ✓ | `bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors` |
| T2 | DAR No. text | ✓ | `text-sm font-semibold text-[#0F1059]` |
| T3 | Date text | ✓ | `text-sm font-mono text-slate-600` |
| T4 | Objective/Doc type | ✓ | `text-sm text-slate-600` |
| C5 | Draft badge | ✓ | `bg-slate-100 text-slate-500 rounded-full` |
| C6 | Item count circle | ✓ | `bg-slate-100 text-slate-500 rounded-full` |
| B1 | View button | ✗ | `text-[#1D6A8A] border border-[#1D6A8A]/30 hover:bg-sky-50` — uses non-NDC hex `#1D6A8A`; should be `text-sky-600 border border-sky-200 hover:bg-sky-50` |
| B2 | Edit button | ✓ | `text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl` |
| B3 | Action button height | ✗ | `px-3 py-1.5 text-xs` — does not meet `h-11` minimum touch target |

---

### 4.4 `DarCardList.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| C1 | Container | ✓ | `lg:hidden space-y-3` |
| C2 | Mobile card | ✓ | `bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4` (compact card) |
| T1 | DAR No. / title | ✓ | `text-slate-800 font-semibold text-sm` |
| T2 | Date | ✓ | `text-xs font-mono text-slate-400 mt-0.5` |
| T3 | Field labels | ✓ | `text-xs text-slate-400 w-24 shrink-0` |
| T4 | Field values | ✓ | `text-xs text-slate-600 font-medium` |
| C3 | Item count circle | ✓ | `bg-slate-100 text-slate-500 rounded-full` |
| B1 | Edit button | ✓ | `text-white bg-[#0F1059] hover:bg-[#161875] rounded-xl` |
| B2 | View button | ✗ | `text-[#1D6A8A] border border-[#1D6A8A]/30 hover:bg-sky-50` — same non-NDC hex issue as DarTable |
| B3 | Button height | ✗ | `px-3 py-1.5 text-xs` — does not meet `h-11` minimum touch target |
| C4 | Divider | ✓ | `border-t border-slate-100 pt-3` |
| S1 | Action row | ✓ | `flex gap-2 mt-4 justify-end` |

---

### 4.5 `DarStatusBadge.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| C1 | Badge base | ✓ | `inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full` |
| C2 | DRAFT | ✗ | `bg-slate-100 text-slate-500` — missing `border border-slate-200` |
| C3 | PENDING_REVIEW | ✗ | `bg-sky-50 text-sky-600` — missing `border border-sky-200` |
| C4 | PENDING_APPROVE | ✗ | `bg-sky-50 text-sky-600` — missing `border border-sky-200` |
| C5 | QMS_PROCESSING | ✗ | `bg-amber-50 text-amber-500` — (1) missing `border border-amber-200`; (2) text should be `text-amber-600` not `text-amber-500` |
| C6 | COMPLETED | ✗ | `bg-emerald-50 text-emerald-600` — missing `border border-emerald-200`, also missing `✓` symbol for screen reader support |
| C7 | CANCELLED | ✗ | `bg-slate-50 text-slate-400 line-through` — `line-through` is not an NDC token; also missing `border border-slate-200` |

---

### 4.6 `DarDrawer.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| C1 | Drawer structure | ✓ | Same NDC-compliant pattern (bottom sheet mobile, half-panel desktop) |
| C2 | Backdrop animation | ✓ | `bg-black/30 transition-opacity duration-300` |
| C3 | Slide animation | ✓ | `translate-y-0 / translate-y-full` with `transition-transform duration-300 ease-out` |
| T1 | Drawer title | ✓ | `text-lg font-semibold text-slate-800` |
| T2 | Subtitle | ✓ | `text-xs text-slate-400 mt-0.5` |
| B1 | Close button height | ✗ | `h-9 w-9` — must be `h-11 min-w-[44px]` |
| B2 | Close button focus | ✓ | `focus-visible:ring-2 focus-visible:ring-[#0F1059] focus-visible:ring-offset-2` |
| C4 | Loading spinner | ✓ | `border-t-[#0F1059] animate-spin` with `text-slate-400 text-sm` label |
| C5 | Error state icon | ✓ | `w-12 h-12 rounded-full bg-rose-50` with `text-rose-600` icon |
| T3 | Error state title | ✓ | `text-slate-800 font-semibold text-base` |
| T4 | Error state desc | ✓ | `text-slate-400 text-sm` |
| B3 | Error retry button | ✓ | `bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50` |

---

### 4.7 `DarForm.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| C1 | Section cards | ✓ | `bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6` |
| T1 | Section title | ✓ | `text-slate-800 text-base font-semibold mb-4` |
| I1 | Textarea | ✓ | `bg-slate-50/50 border rounded-xl px-4 py-2.5 text-slate-700 text-sm resize-none focus:outline-none focus:bg-white transition-colors` |
| I2 | Default border | ✓ | `border-slate-200 focus:border-[#0F1059]` |
| I3 | Error border | ✓ | `border-rose-400 focus:border-rose-500` |
| I4 | Error message | ✓ | `text-rose-600 text-xs mt-1` |
| I5 | Required indicator | ✓ | `text-rose-600 *` |
| S1 | Form gap | ✓ | `flex flex-col gap-4` |
| T2 | Attachment description | ✓ | `text-slate-400 text-sm mb-4` |

---

### 4.8 `DarReadOnlyDetail.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| C1 | All cards | ✓ | `bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden` |
| C2 | Card header | ✓ | `px-6 py-4 border-b border-slate-100 flex items-center justify-between` |
| C3 | Card body | ✓ | `p-6` |
| T1 | DAR No. | ✓ | `text-2xl font-bold text-[#0F1059] leading-tight tracking-tight` |
| T2 | Draft fallback | ✓ | `text-lg font-semibold text-slate-400` |
| T3 | Date (mono) | ✓ | `text-xs text-slate-400 mt-1 font-mono` |
| T4 | Section titles | ✓ | `text-base font-semibold text-slate-800` |
| T5 | Field labels | ✓ | `text-xs text-slate-400 mb-1` |
| T6 | Field values | ✓ | `text-sm font-medium text-slate-800` |
| T7 | Body text | ✓ | `text-sm text-slate-600 whitespace-pre-wrap leading-relaxed` |
| T8 | Item count caption | ✓ | `text-xs text-slate-400` |
| C4 | Distribution tag | ✓ | `bg-slate-50 text-slate-600 border border-slate-200 rounded-full px-3 py-1 text-xs` |
| S1 | Section gap | ✓ | `space-y-4` |

---

### 4.9 `DarDraftActions.tsx`

| # | Check | Result | Details |
|---|-------|--------|---------|
| B1 | Delete trigger | ✓ | `text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-xl` (outline-danger variant) |
| B2 | Delete trigger focus | ✓ | `focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2` |
| B3 | Button height | ✗ | `px-3 py-1.5 text-sm` — missing `h-11` |
| C1 | Confirm modal | ✓ | `modal-box rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-md w-full` |
| C2 | Modal icon container | ✗ | `w-10 h-10 rounded-full bg-rose-50` — NDC spec shows `rounded-xl` for icon containers |
| T1 | Modal title | ✓ | `text-base font-semibold text-slate-800` |
| T2 | Modal body text | ✓ | `text-sm text-slate-600 mb-4` |
| C3 | Inline error | ✓ | `text-sm text-rose-600 bg-rose-50 rounded-xl px-3 py-2 mb-4` |
| B4 | Cancel button | ✓ | `bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50` |
| B5 | Cancel height | ✗ | Missing `h-11` |
| B6 | Delete confirm button | ✓ | `bg-rose-600 text-white rounded-xl hover:bg-rose-700` |
| B7 | Delete confirm height | ✗ | Missing `h-11` |

---

## 5. Summary of All Deviations

### 5.1 Color Token Violations

| Location | Found | Should Be |
|----------|-------|-----------|
| `AnnouncementsTableClient` — page title | `text-slate-800` | `text-[#0F1059]` |
| `AnnouncementsTableClient` — stat label | `text-slate-500` | `text-slate-400` |
| `AnnouncementTableRow` — view button | `text-[#1D6A8A]` | `text-sky-600` |
| `AnnouncementTableRow` — edit button | `text-amber-500` | `text-amber-600` |
| `AnnouncementTableRow` — HR system badge | `bg-violet-50 text-violet-700` | No NDC token for violet; use `bg-sky-50 text-sky-600` or define a brand token |
| `AnnouncementViewFields` — attachment link | `text-[#1D6A8A]` | `text-sky-600` |
| `DarTable` — view button | `text-[#1D6A8A] border-[#1D6A8A]/30` | `text-sky-600 border-sky-200` |
| `DarCardList` — view button | `text-[#1D6A8A] border-[#1D6A8A]/30` | `text-sky-600 border-sky-200` |
| `DarStatusBadge` — QMS_PROCESSING | `text-amber-500` | `text-amber-600` |
| `DashboardClientView` — card border | `border-base-300` (DaisyUI) | `border-slate-100` |
| `DashboardClientView` — card header border | `border-base-200` (DaisyUI) | `border-slate-100` |
| `DashboardClientView` — section title | `text-primary` (DaisyUI) | `text-[#0F1059]` |
| `DashboardClientView` — caption | `text-gray-400` | `text-slate-400` |
| `DashboardQuickActions` — sub-label | `text-gray-400` | `text-slate-400` |
| `DashboardAnnouncementsFeed` — item title | `text-neutral` (DaisyUI) | `text-slate-800` |
| `DashboardAnnouncementsFeed` — description | `text-gray-500` | `text-slate-400` |

### 5.2 Typography Scale Violations

| Location | Found | Should Be |
|----------|-------|-----------|
| `DashboardClientView` — section title | `text-sm font-bold` | `text-xl font-semibold` (section title) |
| `DashboardClientView` — caption | `text-[11px]` | `text-xs` |
| `DashboardQuickActions` — label | `text-[13px]` | `text-sm` |
| `DashboardQuickActions` — sub-label | `text-[11px]` | `text-xs` |
| `DashboardAnnouncementsFeed` — badge | `text-[10px]` | `text-xs` |
| `HeroBanner` — title | `text-[1.6rem]` | `text-2xl` |
| `HeroBanner` — badge | `text-[10px] font-black` | `text-xs font-bold` |
| `DarListHeader` — subtitle | `text-xs` | `text-sm` |

### 5.3 Layout / Spacing Violations

| Location | Found | Should Be |
|----------|-------|-----------|
| `DashboardClientView` | `max-w-350` | `max-w-7xl` |
| `DashboardClientView` | `gap-5` (section/grid) | `gap-6` |
| `DashboardClientView` — cards | `rounded-xl` | `rounded-2xl` |
| `DashboardClientView` — cards | `shadow-sm` | `shadow-[0_8px_30px_rgb(0,0,0,0.04)]` |
| `DashboardClientView` — card padding | `p-5`, `px-5 py-4` | `p-6` (standard) or `p-4` (compact) |
| `AnnouncementsTableClient` — toolbar | `px-5 py-4` | `p-4` or `p-6` |
| `DarListHeader` — card padding | `px-6 py-5` | `p-6` |
| `DarListClient` — toolbar | `px-5 py-4` | `p-4` or `p-6` |
| `AnnouncementsTableClient` — stats grid | `gap-4` | `gap-6` (standard) |

### 5.4 Component-Level Violations

| Location | Issue |
|----------|-------|
| All buttons (most files) | Missing `h-11 min-w-[44px]` minimum touch target |
| All drawers — close button | `h-9 w-9` instead of `h-11 min-w-[44px]` |
| `DarStatusBadge` — all statuses | Missing `border border-{color}-200` on every badge |
| `DarStatusBadge` — CANCELLED | Using `line-through` decoration — non-NDC pattern |
| `DarStatusBadge` — COMPLETED | Missing `✓` symbol (accessibility: color alone) |
| `AnnouncementViewFields` — badges | Missing `border border-{color}-200` |
| `AnnouncementsTable` — header | Missing `sticky top-0 z-10` |
| `DarTable` — header | Missing `sticky top-0 z-10` |
| `AnnouncementTableRow` — toggle | `toggle toggle-success` DaisyUI not overridden with NDC tokens |
| `AnnouncementCreateDrawer` — checkbox | `checkbox checkbox-primary` not overridden |
| `AnnouncementCreateDrawer` — file input | `file-input file-input-bordered` not overridden |
| `AnnouncementDeleteModal` — icon | `rounded-full` on icon container (NDC shows `rounded-xl`) |
| `DarDraftActions` — modal icon | `rounded-full` on icon container (NDC shows `rounded-xl`) |
| Dashboard cards | Use DaisyUI `card-premium` class not NDC card pattern |

### 5.5 DaisyUI Override Violations (NDC Rule: always override DaisyUI with NDC tokens)

| Component | DaisyUI Class Used | Required NDC Override |
|-----------|-------------------|----------------------|
| `DashboardClientView` | `border-base-300`, `border-base-200`, `text-primary` | `border-slate-100`, `text-[#0F1059]` |
| `DashboardAnnouncementsFeed` | `text-neutral`, `divide-base-200`, `hover:bg-base-200/50` | `text-slate-800`, `divide-slate-100`, `hover:bg-slate-50/50` |
| `AnnouncementCreateDrawer` | `checkbox checkbox-primary` | Custom checkbox or explicit color override |
| `AnnouncementEditDrawer` | `checkbox checkbox-primary` | Custom checkbox or explicit color override |
| `AnnouncementTableRow` | `toggle toggle-sm toggle-success` | Override with NDC emerald tokens |
| Dashboard widgets | `card-premium`, `btn btn-primary`, `btn-ghost` | NDC button pattern `bg-[#0F1059]` |

---

## 6. Files with Highest NDC Compliance

These files closely follow the NDC design system:

| File | Compliance Level |
|------|-----------------|
| `DarReadOnlyDetail.tsx` | ✅ Excellent — consistent card, typography, spacing |
| `DarForm.tsx` | ✅ Excellent — correct inputs, labels, error states, cards |
| `AnnouncementCreateDrawer.tsx` | ✅ Good — correct drawer pattern, inputs, labels; only missing `h-11` |
| `AnnouncementEditDrawer.tsx` | ✅ Good — same as CreateDrawer |
| `AnnouncementDeleteModal.tsx` | ✅ Good — correct modal pattern; only missing `h-11` and icon border-radius |
| `DarDraftActions.tsx` | ✅ Good — correct modal, danger button, inline error |
| `DarCardList.tsx` | ✅ Good — correct mobile card pattern |

---

## 7. Files Requiring Most Attention

| File | Priority | Key Issues |
|------|----------|-----------|
| `DashboardClientView.tsx` | 🔴 High | Wrong max-w, DaisyUI borders/shadows, wrong section title size, gray-* colors |
| `DarStatusBadge.tsx` | 🔴 High | Missing borders on all badges, wrong amber shade, CANCELLED decoration |
| `DashboardQuickActions.tsx` | 🟠 Medium | DaisyUI card tokens, arbitrary font sizes, gray-* colors |
| `DashboardAnnouncementsFeed.tsx` | 🟠 Medium | DaisyUI tokens, gray-* colors, badge rounded-sm |
| `AnnouncementTableRow.tsx` | 🟠 Medium | Action buttons too small (h-8), violet badge color, wrong title text color |
| `AnnouncementsTableClient.tsx` | 🟡 Low | Page title color (slate-800 vs #0F1059), stat label (slate-500 vs slate-400), missing h-11 |
| `DarListHeader.tsx` | 🟡 Low | Subtitle size (text-xs vs text-sm), padding non-standard, missing h-11 |
| `HeroBanner.tsx` | 🟡 Low | Arbitrary font sizes, buttons missing h-11 |

---

## 8. Global Issues Across All Files

1. **Missing `h-11 min-w-[44px]` on buttons** — Affects every button across all files. NDC accessibility rule §25.1 requires all clickable elements to be at least 44×44px. This is the most widespread single issue.

2. **`gray-*` used instead of `slate-*`** — Appears in `DashboardClientView`, `DashboardQuickActions`, `DashboardAnnouncementsFeed`, and other dashboard components. NDC §2 Color Tokens specifies `slate-*` exclusively.

3. **DaisyUI token leakage** — Dashboard components use `text-primary`, `text-neutral`, `border-base-*`, `bg-base-*` (DaisyUI semantic tokens) instead of explicit NDC Tailwind classes. NDC rule §4 requires DaisyUI components to be overridden with NDC tokens.

4. **Status badges missing `border`** — The NDC badge spec §11 requires `border border-{color}-200` on every status badge. No badge in `DarStatusBadge.tsx` has this border.

5. **Attachment link color `#1D6A8A`** — Appears in `DarTable`, `DarCardList`, `AnnouncementTableRow`, `AnnouncementViewFields`. This custom hex is not an NDC token. Replace with `text-sky-600`.

6. **Arbitrary font sizes** — `text-[10px]`, `text-[11px]`, `text-[13px]`, `text-[1.6rem]` used across dashboard components. NDC §3 Typography Scale requires the standard Tailwind size ladder only.
