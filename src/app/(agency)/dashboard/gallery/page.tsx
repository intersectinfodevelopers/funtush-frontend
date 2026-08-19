"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  FilePen,
  Globe,
  Plus,
} from "lucide-react";
import {
  DeleteOutlined,
  EditOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { useGallery, type GalleryImage } from "@/hooks/useGallery";

export default function GalleryPage() {
  const router = useRouter();
  const { gallery, deleteImage } = useGallery();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewing, setViewing] = useState<GalleryImage | null>(null);
  const [viewingPhotoIndex, setViewingPhotoIndex] = useState(0);
  const [deleting, setDeleting] = useState<GalleryImage | null>(null);
  const rows = useMemo(
    () => gallery.slice().sort((a, b) => a.order - b.order),
    [gallery],
  );
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter(
      (item) =>
        (!query ||
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)) &&
        (statusFilter === "all" || item.status === statusFilter),
    );
  }, [rows, search, statusFilter]);
  const perPage = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * perPage,
    safePage * perPage,
  );
  const openViewer = (post: GalleryImage) => {
    setViewing(post);
    setViewingPhotoIndex(0);
  };
  const displayedPhoto = viewing?.images[viewingPhotoIndex] || "";
  const changePhoto = (direction: number) => {
    if (viewing)
      setViewingPhotoIndex(
        (index) =>
          (index + direction + viewing.images.length) % viewing.images.length,
      );
  };

  return (
    <div className="min-h-screen w-full space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="hover:text-neutral-900"
            >
              Dashboard
            </button>
            <span className="text-neutral-300">/</span>
            <strong className="text-neutral-900">Gallery</strong>
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Manage Gallery
          </h1>
          <p className="text-sm text-neutral-600">
            Create and manage gallery posts with up to five photos each.
          </p>
        </div>
        <Link
          href="/dashboard/gallery/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Plus size={18} /> Upload Image
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <AnalyticsSummaryCard
          label="Gallery Posts"
          value={rows.length}
          tone="primary"
          icon={Camera}
        />
        <AnalyticsSummaryCard
          label="Published"
          value={rows.filter((item) => item.status === "published").length}
          tone="success"
          icon={Globe}
        />
        <AnalyticsSummaryCard
          label="Drafts"
          value={rows.filter((item) => item.status === "draft").length}
          tone="warning"
          icon={FilePen}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_180px]">
        <input
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          placeholder="Search gallery posts"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          className="rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">All status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>
      <section className="overflow-x-auto border-t border-neutral-200 bg-white">
        <table className="min-w-full border-collapse text-left text-sm text-neutral-700">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
            <tr>
              <th className="px-4 py-3">S.No</th>
              <th className="px-4 py-3">Post</th>
              <th className="px-4 py-3">Photos</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-neutral-500"
                >
                  No gallery posts found.
                </td>
              </tr>
            ) : (
              paginated.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-neutral-200 hover:bg-neutral-50"
                >
                  <td className="px-4 py-3">
                    {(safePage - 1) * perPage + index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.featuredImage}
                        alt={item.title}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-xs text-neutral-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-800">
                      {item.images.length} photo
                      {item.images.length === 1 ? "" : "s"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3 capitalize">{item.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`View ${item.title}`}
                        onClick={() => openViewer(item)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-100 text-primary-600 hover:bg-primary-200"
                      >
                        <VisibilityOutlined sx={{ fontSize: 16 }} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Edit ${item.title}`}
                        onClick={() =>
                          router.push(`/dashboard/gallery/${item.id}/edit`)
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-warning-100 text-warning-600 hover:bg-warning-200"
                      >
                        <EditOutlined sx={{ fontSize: 16 }} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${item.title}`}
                        onClick={() => setDeleting(item)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-danger-100 text-danger-500 hover:bg-danger-200"
                      >
                        <DeleteOutlined sx={{ fontSize: 16 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
      <div className="flex justify-end">
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
      <Modal
        isOpen={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title="Gallery post"
        size="lg"
      >
        {viewing && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={displayedPhoto}
                alt={`${viewing.title} ${viewingPhotoIndex + 1}`}
                className="h-72 w-full rounded-xl object-cover"
              />
              {viewing.images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous photo"
                    onClick={() => changePhoto(-1)}
                    className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-950/70 text-white hover:bg-neutral-950"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    type="button"
                    aria-label="Next photo"
                    onClick={() => changePhoto(1)}
                    className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-950/70 text-white hover:bg-neutral-950"
                  >
                    <ChevronRight />
                  </button>
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-neutral-950/70 px-3 py-1 text-xs text-white">
                    {viewingPhotoIndex + 1} of {viewing.images.length}
                  </span>
                </>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {viewing.images.map((photo, index) => (
                <button
                  key={photo}
                  type="button"
                  onClick={() => setViewingPhotoIndex(index)}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${index === viewingPhotoIndex ? "border-primary-600" : "border-transparent"}`}
                >
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
            <h2 className="text-xl font-semibold text-neutral-900">
              {viewing.title}
            </h2>
            <p className="text-sm text-neutral-600">
              {viewing.description || "No description provided."}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  router.push(`/dashboard/gallery/${viewing.id}/edit`)
                }
                className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
              >
                Edit post
              </button>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete gallery post"
      >
        {deleting && (
          <div>
            <p className="text-sm text-neutral-600">
              Delete “{deleting.title}” and all of its photos? This cannot be
              undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteImage(deleting.id);
                  setDeleting(null);
                }}
                className="rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700"
              >
                Delete post
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
