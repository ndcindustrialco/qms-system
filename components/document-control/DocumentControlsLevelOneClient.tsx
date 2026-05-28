'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';
import { useLocale } from '@/lib/locale-context';
import PageHeader from '@/components/common/PageHeader';
import FilterBar from '@/components/common/FilterBar';
import { DepartmentFolderGrid } from './DepartmentFolderGrid';
import { DepartmentDrawer } from './DepartmentDrawer';
import ConfirmModal from '@/components/common/ConfirmModal';

interface DepartmentCard {
  id: string;
  name: string;
  categoryCount: number;
  documentCount: number;
  emailGroup?: string | null;
  isActive?: boolean;
}

interface Props {
  departments: DepartmentCard[];
  canManage: boolean;
}

export function DocumentControlsLevelOneClient({ departments, canManage }: Props) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentCard | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DepartmentCard | null>(null);

  const isTh = locale === 'th';

  const sortOptions = [
    { value: 'name-asc', label: isTh ? 'ชื่อ (ก-ฮ)' : 'Name (A-Z)' },
    { value: 'name-desc', label: isTh ? 'ชื่อ (ฮ-ก)' : 'Name (Z-A)' },
    { value: 'cat-desc', label: isTh ? 'จำนวนหมวดหมู่ (มาก-น้อย)' : 'Categories (High-Low)' },
    { value: 'doc-desc', label: isTh ? 'จำนวนเอกสาร (มาก-น้อย)' : 'Documents (High-Low)' },
  ];

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return departments.filter((d) => {
      if (q && !d.name.toLowerCase().includes(q)) return false;
      if (statusFilter === 'active' && d.isActive === false) return false;
      if (statusFilter === 'inactive' && d.isActive !== false) return false;
      return true;
    });
  }, [departments, search, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name, 'th');
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name, 'th');
      if (sortBy === 'cat-desc') return b.categoryCount - a.categoryCount;
      if (sortBy === 'doc-desc') return b.documentCount - a.documentCount;
      return 0;
    });
  }, [filtered, sortBy]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/it/departments/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Failed to delete department');
      }
    },
    onSuccess: () => {
      toast.success(t('documentDepartment.messages.deleteSuccess'));
      setDeleteTarget(null);
      router.refresh();
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setDeleteTarget(null);
    },
  });

  const handleAdd = () => {
    setEditingDepartment(null);
    setDrawerOpen(true);
  };

  const handleEdit = (dept: DepartmentCard) => {
    setEditingDepartment(dept);
    setDrawerOpen(true);
  };

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title={t('documentControl.title')}
          subtitle={t('documentControl.list')}
        />

        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={isTh ? 'ค้นหาแผนก...' : 'Search departments...'}
          searchLabel={t('common.search')}
          filters={[
            {
              key: 'status',
              label: t('documentControl.field.status'),
              options: [
                { value: 'active', label: t('it.departments.active') },
                { value: 'inactive', label: t('it.departments.inactive') },
              ],
              allLabel: t('documentControl.filterBar.allStatuses'),
              minWidth: '10rem',
            },
            {
              key: 'sort',
              label: isTh ? 'จัดเรียงตาม' : 'Sort By',
              options: sortOptions,
              allLabel: isTh ? 'ชื่อ (ก-ฮ)' : 'Name (A-Z)',
              minWidth: '14rem',
            },
          ]}
          filterValues={{ status: statusFilter, sort: sortBy }}
          onFilterChange={(key, val) => {
            if (key === 'status') setStatusFilter(val);
            if (key === 'sort') setSortBy(val || 'name-asc');
          }}
          hasActiveFilters={!!search || !!statusFilter || sortBy !== 'name-asc'}
          onClearAll={() => {
            setSearch('');
            setStatusFilter('');
            setSortBy('name-asc');
          }}
          resultCount={sorted.length}
          totalCount={departments.length}
          countLabel={isTh ? 'แผนก' : 'departments'}
        />

        <DepartmentFolderGrid
          departments={sorted}
          canManage={canManage}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={(dept) => setDeleteTarget(dept)}
        />
      </div>

      {/* Department Drawer */}
      <DepartmentDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingDepartment(null);
        }}
        department={editingDepartment}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <ConfirmModal
          title={t('documentDepartment.deleteConfirm')}
          message={t('documentDepartment.deleteMsg')}
          confirmLabel={t('common.delete')}
          cancelLabel={t('common.cancel')}
          danger
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
