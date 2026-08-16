"use client";

import { ChangeEvent, DragEvent, useState, useEffect } from "react";
import Toggle from '@/components/ui/Toggle';
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ImagePlus, X } from "lucide-react";

type DestinationFormProps = {
  isNew?: boolean;
  initialData?: Partial<DestinationFormData> & { id?: string; featuredImage?: string } | null;
  destinationId?: string | null;
};

type DestinationFormData = {
  name: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  region: string;
  difficulty: string;
  activities: string[];
  durationMin: string;
  durationMax: string;
  altitudeMin: string;
  altitudeMax: string;
  bestTimeToVisit: string;
  published: boolean;
  featured: boolean;
};

// Same field/label styling constants used in PackageBuilderForm.tsx,
// kept identical here so every input across both forms matches exactly.
const fieldClassName =
  "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 hover:border-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-50";
const labelClassName = "block text-xs font-medium text-neutral-700 mb-1";

// Same section wrapper convention as PackageBuilderForm.tsx's <Section>.
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
          {description && (
            <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

// Toggle component imported from shared UI.

const initialFormState: DestinationFormData = {
  name: "",
  category: "",
  shortDescription: "",
  longDescription: "",
  region: "",
  difficulty: "",
  activities: [],
  durationMin: "",
  durationMax: "",
  altitudeMin: "",
  altitudeMax: "",
  bestTimeToVisit: "",
  published: false,
  featured: false,
};

const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB

export default function DestinationForm({
  isNew = true,
  initialData = null,
  destinationId = null,
}: DestinationFormProps) {
  const router = useRouter();

  const [formData, setFormData] =
    useState<DestinationFormData>(initialFormState);
  const [featuredImage, setFeaturedImage] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [newActivity, setNewActivity] = useState("");

  // hydrate initial data when editing
  useEffect(() => {
    if (initialData) {
      // handle activities which may be string or array in initialData
      const incoming = { ...(initialData as Partial<DestinationFormData>) } as any;
      if (incoming.activities && !Array.isArray(incoming.activities)) {
        incoming.activities = String(incoming.activities).split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      setFormData((prev) => ({ ...prev, ...incoming }));
      if (initialData.featuredImage) setFeaturedImage(initialData.featuredImage);
    }
  }, [initialData]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const ACTIVITY_OPTIONS = [
    "trekking",
    "hiking",
    "camping",
    "sightseeing",
    "photography",
    "wildlife",
  ];

  const addActivity = (val: string) => {
    const v = String(val).trim();
    if (!v) return;
    setFormData((prev) => {
      const list = Array.isArray(prev.activities) ? prev.activities : [];
      if (list.includes(v)) return prev;
      return { ...prev, activities: [...list, v] } as DestinationFormData;
    });
    setNewActivity("");
  };

  const removeActivity = (val: string) => {
    setFormData((prev) => ({ ...prev, activities: (prev.activities || []).filter((a) => a !== val) } as DestinationFormData));
  };

  const onActivityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newActivity.trim()) addActivity(newActivity.trim());
    }
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Unable to read image."));
        }
      };
      reader.onerror = () => reject(new Error(`Unable to read ${file.name}`));
      reader.readAsDataURL(file);
    });
  };

  const setImage = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image is too large (max 6MB).");
      return;
    }

    try {
      const url = await readFile(file);
      setFeaturedImage(url);
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error("Failed to upload image.");
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files);
    }
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      setImage(e.dataTransfer.files);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Destination name is required.");
      return;
    }
    if (!featuredImage) {
      toast.error("Add a featured image before saving.");
      return;
    }

    try {
      const stored = localStorage.getItem("destinations");
      const database: (DestinationFormData & { id: string; featuredImage: string })[] = stored
        ? JSON.parse(stored)
        : [];

      if (isNew) {
        const payload = {
          ...formData,
          featuredImage,
          id: `dest-${Date.now()}`,
        };
        localStorage.setItem("destinations", JSON.stringify([...database, payload]));
        toast.success("Destination created successfully.");
        router.push("/dashboard/destinations");
      } else {
        // update existing
        if (!destinationId) {
          toast.error("Missing destination id for update.");
          return;
        }
        const updated = database.map((item) => {
          if (item.id === destinationId) {
            return { ...(item as any), ...formData, featuredImage, id: destinationId };
          }
          return item;
        });
        localStorage.setItem("destinations", JSON.stringify(updated));
        toast.success("Destination updated successfully.");
        router.push("/dashboard/destinations");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save destination.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-6xl flex-col gap-5 py-2 sm:py-4"
    >
      {/* ============ FEATURED IMAGE ============ */}
      <Section
        title="Featured Image"
        description="This image represents the destination across the site."
      >
        {featuredImage ? (
          <div className="group relative aspect-[4/1] w-full overflow-hidden rounded-2xl border border-neutral-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featuredImage}
              alt="Featured destination"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => setFeaturedImage("")}
              title="Remove image"
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <label
            htmlFor="destination-featured-image"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            className={`flex aspect-[4/1] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-white transition ${
              isDragging
                ? "border-primary-400 bg-primary-50"
                : "border-neutral-200 hover:border-primary-300"
            }`}
          >
            <ImagePlus size={24} className="text-neutral-400" />
            <p className="text-xs text-neutral-500">
              Drag &amp; drop an image here
            </p>
            <span className="mt-1 inline-flex cursor-pointer items-center justify-center rounded-full bg-primary-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-800">
              Choose file
            </span>
          </label>
        )}

        <input
          id="destination-featured-image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </Section>

      {/* ============ DESTINATION INFORMATION ============ */}
      <Section
        title="Destination Information"
        description="Add the basic information for this destination."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="name" className={labelClassName}>
              Destination Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter destination name"
              className={fieldClassName}
            />
          </div>

          <div>
            <label htmlFor="category" className={labelClassName}>
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={fieldClassName}
            >
              <option value="">Select category</option>
              <option value="trekking">Trekking</option>
              <option value="tour">Tour</option>
              <option value="adventure">Adventure</option>
              <option value="cultural">Cultural</option>
              <option value="nature">Nature</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="shortDescription" className={labelClassName}>
            Short Description
          </label>
          <textarea
            id="shortDescription"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            rows={2}
            placeholder="Enter a short description"
            className={fieldClassName}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="longDescription" className={labelClassName}>
            Long Description (optional)
          </label>
          <textarea
            id="longDescription"
            name="longDescription"
            value={formData.longDescription}
            onChange={handleChange}
            rows={4}
            placeholder="Enter a detailed description"
            className={fieldClassName}
          />
        </div>
      </Section>

      {/* ============ LOCATION & DETAILS ============ */}
      <Section
        title="Location & Details"
        description="Add location and destination details."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="region" className={labelClassName}>
              Region (optional)
            </label>
            <input
              id="region"
              name="region"
              type="text"
              value={formData.region}
              onChange={handleChange}
              placeholder="Enter region"
              className={fieldClassName}
            />
          </div>

          <div>
            <label htmlFor="difficulty" className={labelClassName}>
              Difficulty (optional)
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className={fieldClassName}
            >
              <option value="">Select difficulty</option>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
              <option value="extreme">Extreme</option>
            </select>
          </div>

          <div>
            <label htmlFor="activities" className={labelClassName}>
              Activities (optional)
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {(formData.activities || []).map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs"
                    style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }}
                  >
                    <span>{a}</span>
                    <button type="button" onClick={() => removeActivity(a)} style={{ color: 'var(--color-primary-700)' }} className="ml-1">×</button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  onKeyDown={onActivityKeyDown}
                  placeholder="Add activity and press Enter"
                  className={fieldClassName}
                />
                <button type="button" onClick={() => newActivity.trim() && addActivity(newActivity.trim())} className="rounded-md bg-primary-900 px-3 py-2 text-sm text-white">Add</button>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                {ACTIVITY_OPTIONS.filter((o) => !(formData.activities || []).includes(o)).map((o) => (
                  <button key={o} type="button" onClick={() => addActivity(o)} className="rounded-full bg-neutral-50 px-2 py-1">{o}</button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="durationMin" className={labelClassName}>
              Duration Min (days, optional)
            </label>
            <input
              id="durationMin"
              name="durationMin"
              type="number"
              min="0"
              value={formData.durationMin}
              onChange={handleChange}
              placeholder="Minimum days"
              className={fieldClassName}
            />
          </div>

          <div>
            <label htmlFor="durationMax" className={labelClassName}>
              Duration Max (days, optional)
            </label>
            <input
              id="durationMax"
              name="durationMax"
              type="number"
              min="0"
              value={formData.durationMax}
              onChange={handleChange}
              placeholder="Maximum days"
              className={fieldClassName}
            />
          </div>

          <div>
            <label htmlFor="altitudeMin" className={labelClassName}>
              Altitude Min (m, optional)
            </label>
            <input
              id="altitudeMin"
              name="altitudeMin"
              type="number"
              min="0"
              value={formData.altitudeMin}
              onChange={handleChange}
              placeholder="Minimum altitude"
              className={fieldClassName}
            />
          </div>

          <div>
            <label htmlFor="altitudeMax" className={labelClassName}>
              Altitude Max (m, optional)
            </label>
            <input
              id="altitudeMax"
              name="altitudeMax"
              type="number"
              min="0"
              value={formData.altitudeMax}
              onChange={handleChange}
              placeholder="Maximum altitude"
              className={fieldClassName}
            />
          </div>

          <div>
            <label htmlFor="bestTimeToVisit" className={labelClassName}>
              Best Time to Visit (optional)
            </label>
            <input
              id="bestTimeToVisit"
              name="bestTimeToVisit"
              type="text"
              value={formData.bestTimeToVisit}
              onChange={handleChange}
              placeholder="e.g. March - May, September - November"
              className={fieldClassName}
            />
          </div>
        </div>
      </Section>

      {/* ============ PUBLISH ============ */}
      <Section
        title="Publish"
        description="Final settings before this destination goes live."
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-10">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-700">
                Published (optional)
              </label>
              <Toggle
                checked={formData.published}
                onChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    published: !prev.published,
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-700">
                Featured (optional)
              </label>
              <Toggle
                checked={formData.featured}
                onChange={() =>
                  setFormData((prev) => ({ ...prev, featured: !prev.featured }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-neutral-100 pt-5">
            <button
              type="submit"
              className="rounded-xl bg-primary-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800"
            >
              {isNew ? "Publish Destination" : "Update Destination"}
            </button>
          </div>
        </div>
      </Section>
    </form>
  );
}
