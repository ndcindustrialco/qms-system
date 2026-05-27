# รายการงานปรับปรุงระบบ (Refactoring Tasks) - Phase 6 & Compiler Fixes

## 1. การแก้ไขข้อผิดพลาดประเภทข้อมูลและ API Utilities (TypeScript Fixes)
- [x] แก้ไข [lib/apiErrorHandler.ts](file:///d:/NDC_042/NextJS/qms-system/lib/apiErrorHandler.ts) (เปลี่ยน `error.errors` เป็น `error.issues` และระบุ type callback)
- [x] แก้ไข [repositories/userRepository.ts](file:///d:/NDC_042/NextJS/qms-system/repositories/userRepository.ts) (เปลี่ยน `UserCreateInput` เป็น `UserUncheckedCreateInput` เพื่อรองรับ `departmentId`)
- [x] แก้ไข [types/department.ts](file:///d:/NDC_042/NextJS/qms-system/types/department.ts) (ประกาศและส่งออก `DepartmentDetail`)
- [x] แก้ไข implicit any ใน [services/userService.ts](file:///d:/NDC_042/NextJS/qms-system/services/userService.ts)
- [x] แก้ไข implicit any ใน [services/departmentService.ts](file:///d:/NDC_042/NextJS/qms-system/services/departmentService.ts)
- [x] แก้ไข implicit any ใน [services/darService.ts](file:///d:/NDC_042/NextJS/qms-system/services/darService.ts)

## 2. อัปเดตการนำเข้า Service (Refactor Broken Imports)
- [x] อัปเดต API Routes:
  - [x] `/api/it/sync-users/route.ts`
  - [x] `/api/it/users/route.ts`
  - [x] `/api/qms/mr/route.ts`
  - [x] `/api/it/departments/route.ts`
  - [x] `/api/it/departments/[id]/route.ts`
  - [x] `/api/it/departments/[id]/members/route.ts`
  - [x] `/api/departments/route.ts`
  - [x] `/api/dar/reviewer-candidates/route.ts`
- [x] อัปเดต Dashboard Pages:
  - [x] `app/(dashboard)/qms/mr/page.tsx`
  - [x] `app/(dashboard)/(user)/dar/new/page.tsx`
  - [x] `app/(dashboard)/(user)/dar/[id]/page.tsx`
  - [x] `app/(dashboard)/(user)/dar/page.tsx`
  - [x] `app/(dashboard)/(user)/dar/[id]/review/page.tsx`
  - [x] `app/(dashboard)/qms/dar/page.tsx`
  - [x] `app/(dashboard)/(user)/dar/[id]/edit/page.tsx`
  - [x] `app/(dashboard)/qms/announcements/page.tsx`
  - [x] `app/(dashboard)/it/users/page.tsx`
  - [x] `app/(dashboard)/it/departments/page.tsx`
  - [x] `app/(dashboard)/it/departments/[id]/page.tsx`
- [x] อัปเดต Components & Hooks:
  - [x] `components/it/SyncUsersButton.tsx`
  - [x] `components/it/SyncActions.tsx`
  - [x] `components/announcements/` components (AnnouncementDeleteModal, AnnouncementTableRow, AnnouncementViewFields, AnnouncementViewDrawer, AnnouncementsTableClient, AnnouncementsTable, AnnouncementEditDrawer)
  - [x] `hooks/use-edit-announcement.ts`

## 3. การปรับปรุงระบบฟอร์ม DAR (DAR Form Refactoring)
- [x] ปรับปรุง [hooks/use-dar-form.ts](file:///d:/NDC_042/NextJS/qms-system/hooks/use-dar-form.ts) ให้ใช้ react-hook-form และ Zod
- [x] ปรับปรุง [components/dar/DarForm.tsx](file:///d:/NDC_042/NextJS/qms-system/components/dar/DarForm.tsx) เพื่อเชื่อมต่อกับ react-hook-form และจัดสไตล์ฟิลด์ที่จำเป็น

## 4. ปรับการเรียก API มาใช้ TanStack Query (Query Integration)
- [x] ปรับสเตตและการดึงข้อมูลใน [components/dar/(user)/DarListClient.tsx](file:///d:/NDC_042/NextJS/qms-system/components/dar/(user)/DarListClient.tsx)
- [x] ปรับสเตตและการดึงข้อมูล in [components/dar/QmsDarListClient.tsx](file:///d:/NDC_042/NextJS/qms-system/components/dar/QmsDarListClient.tsx)
- [x] ปรับสเตตและการดึงข้อมูลใน [components/announcements/AnnouncementsTableClient.tsx](file:///d:/NDC_042/NextJS/qms-system/components/announcements/AnnouncementsTableClient.tsx)

## 5. ปรับปรุง Accessibility / Keyboard Navigation
- [x] ปรับ [components/common/FilterBar.tsx](file:///d:/NDC_042/NextJS/qms-system/components/common/FilterBar.tsx) และ sort select ให้ใช้ Radix Select primitives

## 6. Localization ปรับย้ายข้อความภาษาไทยเข้า i18n
- [x] แปลง hardcoded text ใน dashboard pages ทั้งหมดที่เกี่ยวข้อง
