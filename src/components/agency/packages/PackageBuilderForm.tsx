"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ChevronDown, Search, Star, X, Upload, Plus } from "lucide-react";
import categoriesData from "@/../data/categories.json";

interface ItineraryDay {
  day: number;
  location: string;
  desc: string;
  altitude: string;
  photoUrl: string;
}

interface DateSlot {
  date: string;
  slots: number;
}

interface PriceTier {
  min: number;
  max: number;
  price: number;
}

interface AddOnItem {
  name: string;
  price: number;
  perPerson: boolean;
}

export interface PackageForm {
  id?: string;
  title: string;
  destination: string;
  difficulty: "Easy" | "Moderate" | "Strenuous" | "Extreme";
  duration: number;
  durationMin?: number;
  durationMax?: number;
  maxGroup: number;
  shortDesc: string;
  fullDesc: string;
  categoryId?: string;
  itinerary: ItineraryDay[];
  dates: DateSlot[];
  basePrice: number;
  currency: string;
  pricing: PriceTier[];
  heroImage: string;
  gallery: string[];
  video: string;
  addons: AddOnItem[];
  region?: string;
  activities?: string[];
  altitudeMin?: number;
  altitudeMax?: number;
  bestTime?: string;
  routes?: string[];
  status?: "published" | "draft" | "unlisted" | "archived";
  featured?: boolean;
}

interface PackageBuilderFormProps {
  initialData?: PackageForm | null;
  packageId?: string;
  isNew?: boolean;
}

const initialFormState: PackageForm = {
  title: "",
  destination: "",
  difficulty: "Moderate",
  duration: 1,
  durationMin: undefined,
  durationMax: undefined,
  maxGroup: 12,
  shortDesc: "",
  fullDesc: "",
  categoryId: "",
  itinerary: [],
  dates: [],
  basePrice: 0,
  currency: "NPR",
  pricing: [],
  heroImage: "",
  gallery: [],
  video: "",
  addons: [],
  region: "",
  activities: [],
  altitudeMin: undefined,
  altitudeMax: undefined,
  bestTime: "",
  routes: [],
  status: "draft",
  featured: false,
};

const MAX_GALLERY_IMAGES = 5;
const fieldClassName =
  "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 hover:border-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-50";
const labelClassName = "block text-xs font-medium text-neutral-700 mb-1";

// One consistent style for every section's action button (Add Day, Add
// service, Add tier, etc.) so buttons stop looking different per section.
const sectionActionButtonClassName =
  "inline-flex items-center gap-1.5 rounded-lg bg-primary-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-800";

const CURRENCIES: { code: string; label: string; symbol: string }[] = [
  { code: "NPR", label: "Nepalese Rupee", symbol: "Rs" },
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
];

const currencySymbol = (code: string) =>
  CURRENCIES.find((c) => c.code === code)?.symbol ?? code;

// Consistent section wrapper used throughout the page
function Section({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-neutral-100 pb-3">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-neutral-500">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function PackageBuilderForm({
  initialData,
  packageId,
}: PackageBuilderFormProps) {
  const router = useRouter();
  const isEditing = Boolean(packageId);

  const [formData, setFormData] = useState<PackageForm>(
    initialData || initialFormState,
  );

  const [calendarInput, setCalendarInput] = useState("");
  const [defaultSlotAllocation, setDefaultSlotAllocation] = useState(15);
  const [dragActive, setDragActive] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const dragOverIndexRef = useRef<number | null>(null);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");

  const galleryCount = (formData.gallery || []).length;
  const hasMinimumPhoto = galleryCount >= 1;

  const handlePublish = () => {
    if (!hasMinimumPhoto) {
      toast.error("Add at least 1 photo before saving.");
      return;
    }

    const stored = localStorage.getItem("packages");
    const database: PackageForm[] = stored ? JSON.parse(stored) : [];

    const payload: PackageForm = {
      ...formData,
      id: packageId || `pkg-${Date.now()}`,
      status: "published",
    };

    let synchronizedList: PackageForm[];
    if (packageId) {
      synchronizedList = database.map((item) =>
        String(item.id) === String(packageId) ? payload : item,
      );
    } else {
      synchronizedList = [...database, payload];
    }

    localStorage.setItem("packages", JSON.stringify(synchronizedList));
    toast.success(`Package ${packageId ? "updated" : "created"} successfully.`);
    router.push("/dashboard/packages");
  };

  /* ==========================================
     ITINERARY CONTROLLERS
     ========================================== */
  const addItineraryDay = () => {
    const currentDays = formData.itinerary || [];
    const newDay: ItineraryDay = {
      day: currentDays.length + 1,
      location: "",
      desc: "",
      altitude: "",
      photoUrl: "",
    };
    setFormData({ ...formData, itinerary: [...currentDays, newDay] });
  };

  const updateItineraryField = (
    index: number,
    key: keyof ItineraryDay,
    value: string | number,
  ) => {
    const updatedDays = formData.itinerary.map((d, i) =>
      i === index ? { ...d, [key]: value } : d,
    );
    setFormData({ ...formData, itinerary: updatedDays });
  };

  const removeItineraryDay = (index: number) => {
    const filtered = formData.itinerary.filter((_, i) => i !== index);
    const reindexed = filtered.map((d, i) => ({ ...d, day: i + 1 }));
    setFormData({ ...formData, itinerary: reindexed });
  };

  const moveItineraryItem = (index: number, direction: "up" | "down") => {
    const list = [...formData.itinerary];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const reindexed = list.map((d, i) => ({ ...d, day: i + 1 }));
    setFormData({ ...formData, itinerary: reindexed });
  };

  /* ==========================================
     DEPARTURE DATE CONTROLLERS
     ========================================== */
  const handleToggleCalendarDate = () => {
    if (!calendarInput) return;
    const existingDates = formData.dates || [];
    const matched = existingDates.find((d) => d.date === calendarInput);

    if (matched) {
      setFormData({
        ...formData,
        dates: existingDates.filter((d) => d.date !== calendarInput),
      });
    } else {
      setFormData({
        ...formData,
        dates: [
          ...existingDates,
          { date: calendarInput, slots: defaultSlotAllocation },
        ].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
      });
    }
    setCalendarInput("");
  };

  /* ==========================================
     GALLERY / PHOTO UPLOAD
     ========================================== */
  const toDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => {
        console.debug("toDataUrl: reader error for", file.name);
        reject(new Error(`Failed to read file ${file.name}`));
      };
      try {
        console.debug("toDataUrl: reading", file.name, file.type, file.size);
        reader.readAsDataURL(file);
      } catch (err) {
        console.debug("toDataUrl: readAsDataURL threw for", file.name, err);
        reject(err);
      }
    });

  const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB per file
  type ReadResult = { ok: true; data: string } | { ok: false; reason: string };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files).slice(0, MAX_GALLERY_IMAGES);

    console.debug("handleFiles: received files", list.map(f => ({ name: f.name, type: f.type, size: f.size })));
    // Validate and read files individually so a single bad file doesn't fail all
    const readPromises: Promise<ReadResult>[] = list.map(async (file): Promise<ReadResult> => {
      if (!file.type.startsWith("image/")) {
        console.debug("handleFiles: unsupported type", file.name, file.type);
        return { ok: false, reason: `Unsupported file type: ${file.name}` };
      }
      if (file.size > MAX_FILE_SIZE) {
        console.debug("handleFiles: file too large", file.name, file.size);
        return { ok: false, reason: `File too large: ${file.name} (max 6MB)` };
      }
      try {
        const data = await toDataUrl(file);
        console.debug("handleFiles: read success", file.name);
        return { ok: true, data };
      } catch (err) {
        console.debug("handleFiles: read failed", file.name, err);
        return { ok: false, reason: `Failed to read ${file.name}` };
      }
    });

    const results = await Promise.all(readPromises) as ReadResult[];
    const successful = results.filter((r): r is { ok: true; data: string } => r.ok).map((r) => r.data);
    const errors = results.filter((r): r is { ok: false; reason: string } => !r.ok).map((r) => r.reason);

    if (errors.length > 0) {
      console.warn("Gallery upload errors:", errors);
      toast.error(errors[0]);
    }

    if (successful.length === 0) return;

    setFormData((prev) => {
      const merged = Array.from(new Set([...(prev.gallery || []), ...successful])).slice(0, MAX_GALLERY_IMAGES);
      return {
        ...prev,
        gallery: merged,
        heroImage: prev.heroImage && merged.includes(prev.heroImage) ? prev.heroImage : merged[0] || "",
      };
    });
  }, [toDataUrl, setFormData, MAX_FILE_SIZE]);

  // Expose handler for debugging/testing in dev environment
  useEffect(() => {
      try {
      // @ts-expect-error Expose debug handler to window for integration tests
      window.__funtush_handleFiles = handleFiles;
    } catch (e) {
      // ignore
    }
    return () => {
      try {
        // @ts-expect-error Remove debug handler during cleanup
        delete window.__funtush_handleFiles;
      } catch (e) {}
    };
  }, [handleFiles]);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const onThumbDragStart = (index: number, e: React.DragEvent<HTMLImageElement>) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const onThumbDragOver = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragOverIndexRef.current = index;
  };

  const onThumbDrop = () => {
    const from = dragIndex;
    const to = dragOverIndexRef.current;
    if (from == null || to == null) return;
    const gallery = Array.from(formData.gallery || []);
    const [moved] = gallery.splice(from, 1);
    gallery.splice(to, 0, moved);
    const heroStillPresent = gallery.includes(formData.heroImage || "");
    setFormData({ ...formData, gallery, heroImage: heroStillPresent ? formData.heroImage : gallery[0] || "" });
    setDragIndex(null);
    dragOverIndexRef.current = null;
  };

  const removeGalleryImage = (index: number) => {
    const removed = formData.gallery[index];
    const remaining = formData.gallery.filter((_, idx) => idx !== index);
    setFormData({
      ...formData,
      gallery: remaining,
      heroImage: formData.heroImage === removed ? remaining[0] || "" : formData.heroImage,
    });
  };

  const setFeaturedImage = (image: string) => {
    setFormData({ ...formData, heroImage: image });
  };

  /* ==========================================
     CATEGORY PICKER
     ========================================== */
  const allCategories: { id: string; name: string }[] =
    (((categoriesData as unknown) as { categories?: { id: string; name: string }[] }).categories) || [];

  const selectedCategory = allCategories.find((c) => c.id === formData.categoryId);

  const filteredCategories = allCategories.filter((c) =>
    c.name.toLowerCase().includes(categoryFilter.toLowerCase()),
  );

  const selectCategory = (id: string) => {
    setFormData({ ...formData, categoryId: id });
    setCategoryOpen(false);
    setCategoryFilter("");
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 min-h-0">
      <Section title="Package Builder" description="All package settings.">
        {/* ============ BASIC INFO ============ */}
        <div className="mb-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-neutral-900">Basic Information</h3>
            <p className="mt-0.5 text-xs text-neutral-500">Core details that identify this package.</p>
          </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClassName}>Trek Title</label>
            <input
              type="text"
              className={fieldClassName}
              placeholder="e.g., Manaslu Circuit Tour"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClassName}>Destination</label>
            <input
              type="text"
              list="destinations"
              className={fieldClassName}
              placeholder="Type or choose a destination"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            />
            <datalist id="destinations">
              <option value="Everest" />
              <option value="Annapurna" />
              <option value="Langtang" />
              <option value="Manaslu" />
            </datalist>
          </div>

          {/* Category */}
          <div>
            <label className={labelClassName}>Category</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setCategoryOpen((o) => !o);
                  setCategoryFilter("");
                }}
                className={`${fieldClassName} flex items-center justify-between gap-2 text-left`}
              >
                <span className={selectedCategory ? "text-neutral-900" : "text-neutral-400"}>
                  {selectedCategory ? selectedCategory.name : "Select a category"}
                </span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-neutral-400 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
                />
              </button>

              {categoryOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setCategoryOpen(false)} />
                  <div className="absolute z-20 mt-1 w-full rounded-xl border border-neutral-200 bg-white shadow-lg">
                    <div className="relative border-b border-neutral-100 p-2">
                      <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        autoFocus
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        placeholder="Search categories..."
                        className="w-full rounded-lg border border-neutral-200 py-1.5 pl-8 pr-2 text-sm outline-none focus:border-primary-400"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto py-1">
                      {filteredCategories.length === 0 ? (
                        <p className="px-3 py-3 text-center text-sm text-neutral-400">No categories found</p>
                      ) : (
                        filteredCategories.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => selectCategory(c.id)}
                            className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-neutral-50 ${
                              formData.categoryId === c.id
                                ? "bg-primary-50 font-medium text-primary-700"
                                : "text-neutral-900"
                            }`}
                          >
                            {c.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <label className={labelClassName}>Difficulty</label>
            <select
              className={fieldClassName}
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({ ...formData, difficulty: e.target.value as PackageForm["difficulty"] })
              }
            >
              <option value="Easy">Easy</option>
              <option value="Moderate">Moderate</option>
              <option value="Strenuous">Strenuous</option>
              <option value="Extreme">Extreme</option>
            </select>
          </div>

          <div>
            <label className={labelClassName}>Duration (Days)</label>
            <input
              type="number"
              min={1}
              className={fieldClassName}
              value={formData.duration || ""}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className={labelClassName}>Max Group Size</label>
            <input
              type="number"
              min={1}
              className={fieldClassName}
              value={formData.maxGroup || ""}
              onChange={(e) => setFormData({ ...formData, maxGroup: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className={labelClassName}>Duration Min (days, optional)</label>
            <input
              type="number"
              min={0}
              className={fieldClassName}
              value={formData.durationMin ?? ""}
              onChange={(e) => setFormData({ ...formData, durationMin: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>
          <div>
            <label className={labelClassName}>Duration Max (days, optional)</label>
            <input
              type="number"
              min={0}
              className={fieldClassName}
              value={formData.durationMax ?? ""}
              onChange={(e) => setFormData({ ...formData, durationMax: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>
          <div>
            <label className={labelClassName}>Altitude Min (m, optional)</label>
            <input
              type="number"
              min={0}
              className={fieldClassName}
              value={formData.altitudeMin ?? ""}
              onChange={(e) => setFormData({ ...formData, altitudeMin: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>
          <div>
            <label className={labelClassName}>Altitude Max (m, optional)</label>
            <input
              type="number"
              min={0}
              className={fieldClassName}
              value={formData.altitudeMax ?? ""}
              onChange={(e) => setFormData({ ...formData, altitudeMax: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>
          <div>
            <label className={labelClassName}>Region (optional)</label>
            <input
              className={fieldClassName}
              value={formData.region || ""}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClassName}>Best Time to Visit (optional)</label>
            <input
              className={fieldClassName}
              value={formData.bestTime || ""}
              onChange={(e) => setFormData({ ...formData, bestTime: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClassName}>Activities (optional)</label>
            <input
              className={fieldClassName}
              placeholder="Comma separated (trekking, camping)"
              value={(formData.activities || []).join(", ")}
              onChange={(e) => setFormData({ ...formData, activities: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
            />
          </div>
          <div>
            <label className={labelClassName}>Routes & Trails (optional)</label>
            <input
              className={fieldClassName}
              placeholder="Comma separated route names"
              value={(formData.routes || []).join(", ")}
              onChange={(e) => setFormData({ ...formData, routes: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClassName}>Short Summary Pitch</label>
          <textarea
            rows={2}
            className={fieldClassName}
            placeholder="Enter brief overview context..."
            value={formData.shortDesc}
            onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
          />
        </div>
        <div className="mt-4">
          <label className={labelClassName}>Full Description</label>
          <textarea
            rows={4}
            className={fieldClassName}
            placeholder="Write the full itinerary overview..."
            value={formData.fullDesc}
            onChange={(e) => setFormData({ ...formData, fullDesc: e.target.value })}
          />
        </div>
        </div>

        {/* ============ PHOTOS ============ */}
        <div className="mb-6">
          <div className="mb-4 flex items-start justify-between gap-3 border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">Photos</h3>
              <p className="mt-0.5 text-xs text-neutral-500">Up to 5 photos. The first one you upload becomes the featured photo — hover any other to change it.</p>
            </div>
            <div>
              <span className={`text-[11px] font-medium ${hasMinimumPhoto ? "text-neutral-500" : "text-red-600"}`}>
                {galleryCount}/{MAX_GALLERY_IMAGES} photos
              </span>
            </div>
          </div>
        <div
          className={`rounded-2xl border-2 border-dashed bg-white p-4 transition ${
            dragActive ? "border-primary-400 bg-primary-50" : "border-neutral-200"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          {galleryCount === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <Upload size={24} className="text-neutral-400" />
              <p className="text-xs text-neutral-500">Drag & drop up to 5 photos here</p>
              <label
                htmlFor="package-gallery"
                className="mt-1 inline-flex cursor-pointer items-center justify-center rounded-full bg-primary-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-800"
              >
                Choose files
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {formData.gallery.map((g, i) => {
                const isFeatured = formData.heroImage === g;
                return (
                  <div
                    key={i}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200"
                    onDragOver={(e) => onThumbDragOver(i, e)}
                    onDrop={onThumbDrop}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      draggable
                      onDragStart={(e) => onThumbDragStart(i, e)}
                      src={g}
                      alt={`Photo ${i + 1}`}
                      className="h-full w-full cursor-move object-cover"
                    />
                    {isFeatured && (
                      <span className="absolute left-1 top-1 flex items-center gap-1 rounded-full bg-primary-900 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                        <Star size={9} className="fill-white" /> Featured
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {!isFeatured && (
                        <button
                          type="button"
                          onClick={() => setFeaturedImage(g)}
                          title="Set as featured photo"
                          className="rounded p-1 text-white hover:bg-white/20"
                        >
                          <Star size={12} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(i)}
                        title="Remove photo"
                        className="ml-auto rounded p-1 text-white hover:bg-white/20"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {galleryCount < MAX_GALLERY_IMAGES && (
                <label
                  htmlFor="package-gallery"
                  className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-neutral-200 text-neutral-400 transition hover:border-primary-300 hover:text-primary-500"
                >
                  <Upload size={16} />
                  <span className="text-[10px] font-medium">Add</span>
                </label>
              )}
            </div>
          )}

          <input
            id="package-gallery"
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files || [])}
          />
        </div>

        </div>

        {/* ============ ITINERARY ============ */}
        <div className="mb-6">
          <div className="mb-4 flex items-start justify-between gap-3 border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">Itinerary</h3>
              <p className="mt-0.5 text-xs text-neutral-700">Day-by-day route plan.</p>
            </div>
            <div>
              <button type="button" className={sectionActionButtonClassName} onClick={addItineraryDay}>
                <Plus size={14} /> Add Day
              </button>
            </div>
          </div>
        {(formData.itinerary || []).length === 0 ? (
          <p className="py-6 text-center text-xs text-neutral-400">No itinerary days added yet.</p>
        ) : (
          <div className="space-y-3">
              {formData.itinerary.map((day, i) => (
                <div key={i} className="relative rounded-xl border border-neutral-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                    Day {day.day}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={i === 0}
                      className="rounded border p-1 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30"
                      onClick={() => moveItineraryItem(i, "up")}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={i === formData.itinerary.length - 1}
                      className="rounded border p-1 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30"
                      onClick={() => moveItineraryItem(i, "down")}
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      className="rounded border border-red-200 bg-red-50/50 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      onClick={() => removeItineraryDay(i)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="mb-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <input
                    className={`${fieldClassName} text-xs`}
                    placeholder="Stop / location"
                    value={day.location}
                    onChange={(e) => updateItineraryField(i, "location", e.target.value)}
                  />
                  <input
                    className={`${fieldClassName} text-xs`}
                    placeholder="Altitude (m)"
                    value={day.altitude}
                    onChange={(e) => updateItineraryField(i, "altitude", e.target.value)}
                  />
                </div>
                <textarea
                  className={`${fieldClassName} mb-2`}
                  placeholder="Describe this day's route and highlights..."
                  rows={2}
                  value={day.desc}
                  onChange={(e) => updateItineraryField(i, "desc", e.target.value)}
                />
                <input
                  type="text"
                  className={`${fieldClassName} text-xs`}
                  placeholder="Optional banner image URL for this day"
                  value={day.photoUrl || ""}
                  onChange={(e) => updateItineraryField(i, "photoUrl", e.target.value)}
                />
              </div>
            ))}
          </div>
        )}
        </div>

        {/* ============ DEPARTURE DATES ============ */}
        <div className="mb-6">
          <div className="mb-4 flex items-start justify-between gap-3 border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">Departure Dates</h3>
              <p className="mt-0.5 text-xs text-neutral-500">Scheduled batches and available slots.</p>
            </div>
            <div>
              <button type="button" className={sectionActionButtonClassName} onClick={handleToggleCalendarDate}>
                <Plus size={14} /> Add Departure
              </button>
            </div>
          </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
            <div>
              <label className={labelClassName}>Departure date</label>
              <input
                type="date"
                className={`${fieldClassName} py-2`}
                value={calendarInput}
                onChange={(e) => setCalendarInput(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClassName}>Slots for this date</label>
              <input
                type="number"
                className={`${fieldClassName} py-2`}
                value={defaultSlotAllocation}
                onChange={(e) => setDefaultSlotAllocation(parseInt(e.target.value) || 0)}
              />
            </div>
            <p className="text-[11px] text-neutral-400">
              Picking a date already on the list removes it — use the &quot;Add Departure&quot; button above.
            </p>
          </div>
        </div>
        </div>

        {/* ============ PRICING ============ */}
        <div className="mb-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-neutral-900">Pricing</h3>
            <p className="mt-0.5 text-xs text-neutral-500">Base price and optional group-size discounts.</p>
          </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_160px]">
          <div>
            <label className={labelClassName}>Base Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-400">
                {currencySymbol(formData.currency)}
              </span>
              <input
                type="number"
                min={0}
                className={`${fieldClassName} pl-9`}
                value={formData.basePrice || ""}
                onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div>
            <label className={labelClassName}>Currency</label>
            <select
              className={fieldClassName}
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 border-t border-neutral-100 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-xs font-semibold text-neutral-600">Volume Discount Tiers (optional)</label>
            <button
              type="button"
              className={sectionActionButtonClassName}
              onClick={() =>
                setFormData({ ...formData, pricing: [...(formData.pricing || []), { min: 1, max: 5, price: 0 }] })
              }
            >
              <Plus size={14} /> Add tier
            </button>
          </div>
          <div className="space-y-2">
            {formData.pricing?.map((tier, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border bg-white p-2">
                <span className="text-xs text-neutral-400">Min:</span>
                <input
                  type="number"
                  className="w-16 rounded border p-1 text-xs"
                  value={tier.min}
                  onChange={(e) => {
                    const tiers = [...formData.pricing];
                    tiers[i].min = parseInt(e.target.value) || 0;
                    setFormData({ ...formData, pricing: tiers });
                  }}
                />
                <span className="text-xs text-neutral-400">Max:</span>
                <input
                  type="number"
                  className="w-16 rounded border p-1 text-xs"
                  value={tier.max}
                  onChange={(e) => {
                    const tiers = [...formData.pricing];
                    tiers[i].max = parseInt(e.target.value) || 0;
                    setFormData({ ...formData, pricing: tiers });
                  }}
                />
                <span className="ml-auto text-xs text-neutral-400">
                  Rate ({currencySymbol(formData.currency)}):
                </span>
                <input
                  type="number"
                  className="w-24 rounded border p-1 text-xs font-medium"
                  value={tier.price}
                  onChange={(e) => {
                    const tiers = [...formData.pricing];
                    tiers[i].price = parseFloat(e.target.value) || 0;
                    setFormData({ ...formData, pricing: tiers });
                  }}
                />
                <button
                  type="button"
                  className="rounded px-1 text-red-500 hover:bg-neutral-50"
                  onClick={() => setFormData({ ...formData, pricing: formData.pricing.filter((_, idx) => idx !== i) })}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        </div>

        {/* Add-Ons removed as requested */}

        {/* ============ PUBLISH — toggles + single action ============ */}
        <div className="mb-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-neutral-900">Publish</h3>
            <p className="mt-0.5 text-xs text-neutral-500">Final settings before this package goes live.</p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-10">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-700">Published</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: formData.status === 'published' ? 'draft' : 'published' })}
                  className={`relative inline-flex h-6 w-12 items-center rounded-full transition ${formData.status === 'published' ? 'bg-primary-900' : 'bg-neutral-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${formData.status === 'published' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-700">Featured</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                  className={`relative inline-flex h-6 w-12 items-center rounded-full transition ${formData.featured ? 'bg-primary-900' : 'bg-neutral-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${formData.featured ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className="flex justify-end border-t border-neutral-100 pt-5">
              <button
                type="button"
                className="rounded-xl bg-primary-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800"
                onClick={handlePublish}
              >
                {isEditing ? "Update & Publish" : "Publish Package"}
              </button>
            </div>
          </div>
        </div>

      </Section>
    </div>
  );
}