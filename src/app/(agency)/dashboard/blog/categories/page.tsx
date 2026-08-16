"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  DeleteOutlined, 
  EditOutlined, 
  VisibilityOutlined, 
  FolderOutlined, 
  CheckCircleOutlined, 
  LayersOutlined, 
  RefreshOutlined ,
  NorthEastOutlined
} from "@mui/icons-material";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "react-hot-toast";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  postsCount: number;
  status: "Active" | "Inactive";
};

const initialCategories: CategoryItem[] = [
  { id: "1", name: "Tourism", slug: "tourism", description: "db.categories.find().pretty()", postsCount: 186, status: "Active" },
  { id: "2", name: "Corporate", slug: "corporate", description: "-", postsCount: 1, status: "Active" },
  { id: "3", name: "Sports Tourism", slug: "sports-tourism", description: "-", postsCount: 1, status: "Active" },
];

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialog, setDialog] = useState<{ type: "edit" | "delete"; category: CategoryItem } | null>(null);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const query = search.toLowerCase();
      return (
        (cat.name.toLowerCase().includes(query) || cat.slug.toLowerCase().includes(query) || cat.description.toLowerCase().includes(query)) &&
        (status === "all" || cat.status === status)
      );
    });
  }, [categories, search, status]);

  const perPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / perPage));
  const pageCategories = filteredCategories.slice((currentPage - 1) * perPage, currentPage * perPage);

  const activeCount = categories.filter((cat) => cat.status === "Active").length;
  const inactiveCount = categories.filter((cat) => cat.status === "Inactive").length;

  const toggleStatus = (id: string, name: string, currentStatus: "Active" | "Inactive") => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, status: newStatus } : cat))
    );
    toast.success(`Category "${name}" is now ${newStatus}`);
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <button type="button" onClick={() => router.push("/dashboard")} className="hover:text-neutral-900">Dashboard</button>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-neutral-900">Manage Categories</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Manage Categories</h1>
          <p className="mt-1 text-sm text-neutral-600">Create, manage, and maintain blog categories.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            toast.success("Redirecting to create category...");
            router.push("/dashboard/blog/categories/new");
          }}
          className="w-fit rounded-2xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
        >
          + Add Category
        </button>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Total Categories" value={categories.length} tone="primary" />
        <SummaryCard label="Active" value={activeCount} tone="success" />
        <SummaryCard label="Inactive" value={inactiveCount} tone="danger" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3 sm:max-w-md">
          <input
            value={search}
            onChange={(event) => { setSearch(event.target.value); setCurrentPage(1); }}
            placeholder="Search by name or slug..."
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatus("all");
              setCurrentPage(1);
              toast.success("Filters cleared successfully!");
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <RefreshOutlined className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border-t border-neutral-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Posts</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageCategories.map((cat) => (
              <tr key={cat.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                <td className="px-4 py-3 font-semibold text-neutral-900">{cat.name}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-neutral-100 px-2 py-1 font-mono text-xs text-neutral-800">{cat.slug}</span>
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-neutral-700">{cat.description}</td>
                <td className="px-4 py-3 font-semibold text-primary-700">{cat.postsCount}</td>
                <td className="px-4 py-3">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={cat.status === "Active"}
                      onChange={() => toggleStatus(cat.id, cat.name, cat.status)}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-neutral-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-900 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                  </label>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ActionButton
                      label="View"
                      tone="primary"
                      onClick={() => {
                        toast.success(`Viewing category: ${cat.name}`);
                        router.push(`/dashboard/category/${cat.id}`);
                      }}
                    >
                      <VisibilityOutlined sx={{ fontSize: 18 }} />
                    </ActionButton>
                    <ActionButton
                      label="Edit"
                      tone="warning"
                      onClick={() => setDialog({ type: "edit", category: cat })}
                    >
                      <EditOutlined sx={{ fontSize: 18 }} />
                    </ActionButton>
                    <ActionButton
                      label="Delete"
                      tone="danger"
                      onClick={() => setDialog({ type: "delete", category: cat })}
                    >
                      <DeleteOutlined sx={{ fontSize: 18 }} />
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pageCategories.length === 0 && <p className="px-4 py-8 text-center text-sm text-neutral-500">No categories found.</p>}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-neutral-900">
              {dialog.type === "delete" ? "Delete category?" : "Edit category?"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {dialog.type === "delete" ? `Remove ${dialog.category.name} from the category list?` : `Open ${dialog.category.name} in the editor?`}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDialog(null);
                  toast.dismiss();
                }}
                className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (dialog.type === "edit") {
                    toast.success(`Opening editor for ${dialog.category.name}...`);
                    router.push(`/dashboard/category/${dialog.category.id}/edit`);
                  } else {
                    setCategories((items) => items.filter((item) => item.id !== dialog.category.id));
                    toast.success(`Category "${dialog.category.name}" deleted successfully!`);
                  }
                  setDialog(null);
                }}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold text-white ${dialog.type === "delete" ? "bg-danger-600" : "bg-primary-900"}`}
              >
                {dialog.type === "delete" ? "Delete category" : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number | string; tone: "primary" | "success" | "danger" }) {
  const styles = {
    primary: { card: "border-primary-100 bg-primary-50", icon: "bg-primary-900 text-white", Icon: FolderOutlined },
    success: { card: "border-success-100 bg-success-50", icon: "bg-success-600 text-white", Icon: CheckCircleOutlined },
    danger: { card: "border-danger-100 bg-danger-50", icon: "bg-danger-600 text-white", Icon: LayersOutlined },
  };
  const style = styles[tone];
  const Icon = style.Icon;

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${style.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${style.icon}`}><Icon className="h-4 w-4" /></div>
        <NorthEastOutlined className="h-4 w-4 text-success-600" />
      </div>
      <p className="mt-3 text-sm font-semibold text-neutral-700">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-neutral-900">{value}</p>
      <p className="mt-2 flex items-center gap-1 text-xs text-neutral-600"><span className="font-semibold text-success-700">12.5%</span> from last month</p>
    </div>
  );
}

function ActionButton({ label, tone, onClick, children }: { label: string; tone: "primary" | "warning" | "danger"; onClick: () => void; children: React.ReactNode }) {
  const styles = {
    primary: "bg-primary-50 text-primary-700 hover:bg-primary-100",
    warning: "bg-warning-50 text-warning-700 hover:bg-warning-100",
    danger: "bg-danger-50 text-danger-700 hover:bg-danger-100",
  };
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition ${styles[tone]}`}>
      {children}
    </button>
  );
}