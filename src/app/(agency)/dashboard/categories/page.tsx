'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Eye,
  FolderOpen,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  XCircle,
} from 'lucide-react';

import { AnalyticsSummaryCard } from '@/components/shared/AnalyticsSummaryCard';
import { Pagination } from '@/components/ui/pagination';
import categoriesData from '../../../../../data/categories.json';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  postCount: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'agency-categories';

const normalizeCategories = (value: unknown): Category[] => {
  if (Array.isArray(value)) {
    return value as Category[];
  }

  if (value && typeof value === 'object' && Array.isArray((value as { categories?: Category[] }).categories)) {
    return (value as { categories: Category[] }).categories;
  }

  return [];
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(() => normalizeCategories(categoriesData));
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'order'>('newest');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ category: Category } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const savedCategories = normalizeCategories(parsed);
          if (savedCategories.length > 0) {
            setCategories(savedCategories);
          }
        } else {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeCategories(categoriesData)));
        }
      } catch {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeCategories(categoriesData)));
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const matches = categories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query),
    );

    const sorted = [...matches];
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'order') {
      sorted.sort((a, b) => a.order - b.order);
    } else {
      sorted.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    }

    return sorted;
  }, [categories, searchTerm, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / 6));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageItems = filteredCategories.slice((safeCurrentPage - 1) * 6, safeCurrentPage * 6);

  const stats = useMemo(
    () => ({
      total: categories.length,
      active: categories.filter((category) => category.isActive).length,
      inactive: categories.filter((category) => !category.isActive).length,
    }),
    [categories],
  );

  const handleDeleteCategory = (id: string) => {
    const category = categories.find((item) => item.id === id);

    if (category) {
      setDeleteDialog({ category });
    }
  };

  const confirmDeleteCategory = () => {
    if (!deleteDialog) return;

    setCategories((current) => current.filter((item) => item.id !== deleteDialog.category.id));
    setDeleteDialog(null);
  };

  const handleToggleStatus = (id: string) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === id
          ? {
              ...category,
              isActive: !category.isActive,
              updatedAt: new Date().toISOString(),
            }
          : category,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <button type="button" onClick={() => router.push('/dashboard')} className="hover:text-neutral-900">
              Dashboard
            </button>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-neutral-900">Categories</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">Categories</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Manage blog sections and topic groups used across the site.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push('/dashboard/categories/new')}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800"
        >
          <Plus size={18} />
          Add category
        </button>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AnalyticsSummaryCard label="Total Categories" value={stats.total} tone="primary" icon={Tag} />
        <AnalyticsSummaryCard label="Active" value={stats.active} tone="success" icon={CheckCircle2} />
        <AnalyticsSummaryCard label="Inactive" value={stats.inactive} tone="warning" icon={XCircle} />
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_180px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search categories"
            className="w-full rounded-2xl border border-neutral-200 bg-white py-2.5 pl-9 pr-3 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <select
          value={sortBy}
          onChange={(event) => {
            setSortBy(event.target.value as 'newest' | 'name' | 'order');
            setCurrentPage(1);
          }}
          className="rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        >
          <option value="newest">Newest</option>
          <option value="name">Name A–Z</option>
          <option value="order">Display order</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Posts</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {pageItems.map((category) => (
              <tr key={category.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-3.5 w-3.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: category.color }} />
                    <div>
                      <div className="font-semibold text-neutral-900">{category.name}</div>
                      <div className="mt-1 text-xs text-neutral-500">Order #{category.order}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                    {category.slug}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  <p className="max-w-md leading-6">{category.description || 'No description provided.'}</p>
                </td>
                <td className="px-4 py-3 font-semibold text-neutral-900">{category.postCount}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(category.id)}
                    className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                      category.isActive ? 'bg-success-50 text-success-700 hover:bg-success-100' : 'bg-danger-50 text-danger-700 hover:bg-danger-100'
                    }`}
                  >
                    {category.isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {category.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} className="text-neutral-400" />
                    {formatDate(category.updatedAt)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <ActionButton label="Preview" tone="primary" onClick={() => setSelectedCategory(category)}>
                      <Eye size={16} />
                    </ActionButton>
                    <ActionButton label="Edit" tone="warning" onClick={() => router.push(`/dashboard/categories/${category.id}/edit`)}>
                      <Pencil size={16} />
                    </ActionButton>
                    <ActionButton label="Delete" tone="danger" onClick={() => handleDeleteCategory(category.id)}>
                      <Trash2 size={16} />
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pageItems.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <FolderOpen className="mb-3 text-neutral-300" size={36} />
            <h3 className="text-lg font-semibold text-neutral-900">No categories found</h3>
            <p className="mt-1 max-w-md text-sm text-neutral-500">
              {searchTerm ? 'Try another keyword or clear the search.' : 'Create your first category to organize content.'}
            </p>
          </div>
        )}
      </div>

      <Pagination currentPage={safeCurrentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {deleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-neutral-900">Delete category?</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Remove {deleteDialog.category.name} from the category list?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteDialog(null)}
                className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCategory}
                className="rounded-2xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Delete category
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">Preview</p>
                <h2 className="mt-1 text-xl font-bold text-neutral-900">{selectedCategory.name}</h2>
              </div>
              <button type="button" onClick={() => setSelectedCategory(null)} className="rounded-lg border border-neutral-200 p-2 text-neutral-500 hover:text-neutral-700">
                <XCircle size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: selectedCategory.color }} />
                <span className="text-sm font-medium text-neutral-700">{selectedCategory.slug}</span>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Description</p>
                <p className="text-sm leading-6 text-neutral-600">{selectedCategory.description || 'No description provided.'}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Posts</p>
                  <p className="mt-2 text-2xl font-bold text-neutral-900">{selectedCategory.postCount}</p>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Status</p>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-700">
                    {selectedCategory.isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {selectedCategory.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-neutral-500" />
                  Updated on {formatDate(selectedCategory.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({
  label,
  tone,
  onClick,
  children,
}: {
  label: string;
  tone: 'primary' | 'warning' | 'danger';
  onClick: () => void;
  children: React.ReactNode;
}) {
  const styles = {
    primary: 'bg-primary-50 text-primary-700 hover:bg-primary-100',
    warning: 'bg-warning-50 text-warning-700 hover:bg-warning-100',
    danger: 'bg-danger-50 text-danger-700 hover:bg-danger-100',
  };

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${styles[tone]}`}
    >
      {children}
    </button>
  );
}
