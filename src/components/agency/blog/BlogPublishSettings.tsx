"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/context/theme";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ImageIcon from "@mui/icons-material/Image";
import Image from "next/image";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Modal } from "@/components/ui/modal";

interface GalleryImage {
  id: string;
  url: string;
  title?: string;
  owner?: string;
}

interface BlogPublishSettingsProps {
  category: string;
  setCategory: (val: string) => void;

  status: string;
  setStatus: (val: string) => void;

  publishDate: string;
  setPublishDate: (val: string) => void;

  tag: string;
  setTag: (val: string) => void;

  photoOption: "local" | "gallery";
  setPhotoOption: (val: "local" | "gallery") => void;

  errors: {
    category: string;
    publishDate: string;
    photo: string;
  };

  setErrors: React.Dispatch<
    React.SetStateAction<{
      title: string;
      subtitle: string;
      content: string;
      category: string;
      publishDate: string;
      photo: string;
    }>
  >;
  onSelectGalleryImage?: (img: GalleryImage | null) => void;
  selectedGalleryImage?: GalleryImage | null;
}

export function BlogPublishSettings({
  category,
  setCategory,
  status,
  setStatus,
  publishDate,
  setPublishDate,
  tag,
  setTag,
  photoOption,
  setPhotoOption,
  errors,
  setErrors,
  onSelectGalleryImage,
  // selectedGalleryImage: selectedGalleryImageProp,
}: BlogPublishSettingsProps) {
  const { isDark } = useTheme();

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [selectedGalleryImage, setSelectedGalleryImage] =
    useState<GalleryImage | null>(null);

  const [tagsList, setTagsList] = useState<string[]>(
    tag
      ? tag
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
      : []
  );

  const [tagInput, setTagInput] = useState("");

  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [gallerySearch, setGallerySearch] = useState("");

  useEffect(() => {
    let mounted = true;

    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;

        if (Array.isArray(data)) {
          setGalleryImages(data as GalleryImage[]);
        }
      })
      .catch((err) => {
        console.error("Failed to load gallery from API:", err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;

        if (Array.isArray(data)) {
          setGalleryImages(data as GalleryImage[]);
        }
      })
      .catch((err) => {
        console.error("Failed to load gallery from API:", err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const cardClass = isDark
    ? "bg-neutral-900 text-neutral-50 border-neutral-700"
    : "bg-white text-neutral-900 border-neutral-200";

  const inputClass = isDark
    ? "border-neutral-700 bg-neutral-800 text-neutral-50 placeholder-neutral-500"
    : "border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500";

  const selectClass = isDark
    ? "border-neutral-700 bg-neutral-800 text-neutral-200"
    : "border-neutral-300 bg-white text-neutral-700";

  const secondaryText = isDark
    ? "text-neutral-400"
    : "text-neutral-500";

  const handleCategoryChange = (value: string) => {
    setCategory(value);

    if (value.trim()) {
      setErrors((prev) => ({
        ...prev,
        category: "",
      }));
    }
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);

    if (value !== "Scheduled") {
      setErrors((prev) => ({
        ...prev,
        publishDate: "",
      }));
    } else if (!publishDate.trim()) {
      setErrors((prev) => ({
        ...prev,
        publishDate:
          "Publish date and time are required for scheduled posts.",
      }));
    }
  };

  const handlePublishDateChange = (value: string) => {
    setPublishDate(value);

    if (value.trim()) {
      setErrors((prev) => ({
        ...prev,
        publishDate: "",
      }));
    }
  };

  const handleAddTag = (newTag: string) => {
    const trimmed = newTag.trim();

    if (trimmed && !tagsList.includes(trimmed)) {
      const updated = [...tagsList, trimmed];

      setTagsList(updated);
      setTag(updated.join(", "));
    }

    setTagInput("");
  };

  const handleRemoveTag = (indexToRemove: number) => {
    const updated = tagsList.filter(
      (_, index) => index !== indexToRemove
    );

    setTagsList(updated);
    setTag(updated.join(", "));
  };

  /*
   * Validate local image
   */
  const validateFile = (file: File) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return "Only JPG, JPEG, PNG, and WEBP images are allowed.";
    }

    if (file.size > maxSize) {
      return "Image size must not exceed 2MB.";
    }

    return "";
  };

  /*
   * Local file selection
   */
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      setErrors((prev) => ({
        ...prev,
        photo: "",
      }));
      return;
    }

    const fileError = validateFile(file);

    if (fileError) {
      setSelectedFile(null);
      setErrors((prev) => ({
        ...prev,
        photo: fileError,
      }));
      return;
    }

    setSelectedFile(file);
    
    // Clear gallery selection via parent callback
    if (typeof onSelectGalleryImage === 'function') {
      onSelectGalleryImage(null);
    }

    setErrors((prev) => ({
      ...prev,
      photo: "",
    }));
  };

  /*
   * Switch photo source
   */
  const handlePhotoOptionChange = (
    option: "local" | "gallery"
  ) => {
    setPhotoOption(option);

    /*
     * Clear previous selections
     */
    setSelectedFile(null);
    setSelectedGalleryImage(null);

    /*
     * Clear photo error
     */
    setErrors((prev) => ({
      ...prev,
      photo: "",
    }));
  };

  /*
   * Gallery image selection
   */
  const handleGalleryImageSelect = (
    image: GalleryImage
  ) => {
    setSelectedGalleryImage(image);

    if (typeof onSelectGalleryImage === 'function') {
      onSelectGalleryImage(image);
    }

    /*
     * Clear local file because gallery is now selected.
     */
    setSelectedFile(null);

    setErrors((prev) => ({
      ...prev,
      photo: "",
    }));
  };

  return (
    <Card
      className={`${cardClass} rounded-2xl border p-6 shadow-sm space-y-5 h-fit`}
    >
      <h2 className="text-sm font-bold">
        Publish Settings
      </h2>

      {/* ================= CATEGORY ================= */}

      <div className="space-y-1.5">
        <label className="block font-bold text-xs">
          Select Category{" "}
          <span className="text-danger-500">*</span>
        </label>

        <select
          value={category}
          onChange={(e) =>
            handleCategoryChange(e.target.value)
          }
          className={`w-full rounded-xl border px-3.5 py-3 text-xs shadow-sm focus:outline-none focus:ring-2 ${errors.category
              ? "border-danger-500 focus:ring-danger-500"
              : `${selectClass} focus:border-primary-500 focus:ring-primary-500`
            }`}
        >
          <option value="" disabled>
            Select Category
          </option>

          <option value="tech">
            Technology
          </option>

          <option value="marketing">
            Marketing
          </option>

          <option value="lifestyle">
            Lifestyle
          </option>
        </select>

        {errors.category && (
          <p className="text-xs text-danger-500">
            {errors.category}
          </p>
        )}
      </div>

      {/* ================= STATUS ================= */}

      <div className="space-y-1.5">
        <label className="block font-bold text-xs">
          Status
        </label>

        <select
          value={status}
          onChange={(e) =>
            handleStatusChange(e.target.value)
          }
          className={`w-full rounded-xl border px-3.5 py-3 text-xs shadow-sm focus:outline-none focus:ring-2 ${selectClass} focus:border-primary-500 focus:ring-primary-500`}
        >
          <option value="Draft">
            Draft
          </option>

          <option value="Published">
            Published
          </option>

          <option value="Scheduled">
            Scheduled
          </option>
        </select>
      </div>

      {/* ================= PUBLISH DATE ================= */}

      {status === "Scheduled" && (
        <div className="space-y-1.5 animate-fadeIn">
          <label className="block font-bold text-xs">
            Publish Date{" "}
            <span className="text-danger-500">*</span>
          </label>

          <div className="relative flex items-center">
            <input
              type="text"
              value={publishDate}
              onChange={(e) =>
                handlePublishDateChange(
                  e.target.value
                )
              }
              placeholder="Enter publish date and time"
              className={`w-full rounded-xl border px-3.5 py-3 pr-10 text-xs shadow-sm focus:outline-none focus:ring-2 ${errors.publishDate
                  ? "border-danger-500 focus:ring-danger-500"
                  : `${inputClass} focus:border-primary-500 focus:ring-primary-500`
                }`}
            />

            <CalendarTodayIcon
              className="absolute right-3.5 w-4 h-4 text-neutral-400 pointer-events-none"
            />
          </div>

          {errors.publishDate ? (
            <p className="text-xs text-danger-500">
              {errors.publishDate}
            </p>
          ) : (
            <p
              className={`text-[11px] ${secondaryText} mt-1`}
            >
              Set the date and time to publish the blog.
            </p>
          )}
        </div>
      )}

      {/* ================= TAGS ================= */}

      <div className="space-y-1.5">
        <label className="block font-bold text-xs">
          Tags
        </label>

        <div
          className={`w-full rounded-xl border px-3 py-2 text-xs shadow-sm ${inputClass}`}
        >
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {tagsList.map((t, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 bg-primary-500 text-white text-[11px] px-2 py-0.5 rounded-md"
              >
                {t}

                <button
                  type="button"
                  onClick={() =>
                    handleRemoveTag(index)
                  }
                  className="hover:text-danger-200 font-bold ml-0.5 transition-colors"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) =>
                setTagInput(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag(tagInput);
                }
              }}
              placeholder="Type a tag and press add..."
              className={`w-full bg-transparent focus:outline-none text-xs py-1 ${isDark
                  ? "text-neutral-50 placeholder-neutral-500"
                  : "text-neutral-900 placeholder-neutral-500"
                }`}
            />

            <button
              type="button"
              onClick={() => handleAddTag(tagInput)}
              className="shrink-0 rounded-lg bg-primary-900 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-800"
            >
              Add
            </button>
          </div>
        </div>

        <p
          className={`text-[11px] ${secondaryText} mt-1`}
        >
          Example: Marketing, SEO, tips
        </p>
      </div>

      {/* ================= PHOTOS ================= */}

      <div className="space-y-3 pt-2">
        <label className="block font-bold text-xs">
          Photos
        </label>

        {/* PHOTO SOURCE */}
        <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:gap-5">
          {/* LOCAL */}
          <label
            className={`flex cursor-pointer items-center gap-1.5 ${
              isDark ? "text-neutral-200" : "text-neutral-700"
            }`}
          >
            <input
              type="radio"
              name="photoSource"
              checked={photoOption === "local"}
              onChange={() =>
                handlePhotoOptionChange("local")
              }
              className="accent-primary-500"
            />

            <span>
              Upload from Local Drive
            </span>
          </label>

          {/* GALLERY */}
          <label
            className={`flex cursor-pointer items-center gap-1.5 ${
              isDark ? "text-neutral-200" : "text-neutral-700"
            }`}
          >
            <input
              type="radio"
              name="photoSource"
              checked={photoOption === "gallery"}
              onChange={() =>
                handlePhotoOptionChange("gallery")
              }
              className="accent-primary-500"
            />

            <span>
              Add from Gallery
            </span>
          </label>
        </div>

        {/* ================================================= */}
        {/* LOCAL DRIVE */}
        {/* ================================================= */}

        {photoOption === "local" && (
          <>
            <div
              className={`border border-dashed rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-3 ${errors.photo
                  ? "border-danger-500"
                  : isDark
                    ? "border-neutral-700 bg-neutral-800/50"
                    : "border-neutral-300 bg-neutral-50"
                }`}
            >
              <div className="w-12 h-12 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center">
                <UploadFileIcon className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium">
                  Drag & drop Image here
                </p>

                <p
                  className={`text-[11px] ${secondaryText}`}
                >
                  Or
                </p>
              </div>

              <label className="cursor-pointer rounded-xl bg-primary-900 px-4 py-2 text-xs font-medium text-white shadow-md shadow-primary-900/20 transition-colors hover:bg-primary-800">
                Upload Image

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {selectedFile && !errors.photo && (
                <div className="flex items-center gap-2 max-w-full">
                  <CheckCircleIcon className="w-4 h-4 text-success-600 shrink-0" />

                  <p className="text-xs text-success-600 break-all">
                    {selectedFile.name}
                  </p>
                </div>
              )}

              {errors.photo && (
                <p className="text-xs text-danger-500">
                  {errors.photo}
                </p>
              )}
            </div>

            <p
              className={`text-[10px] ${secondaryText} text-center mt-1`}
            >
              Recommended size: 1200*628px (Max, 2MB)
            </p>
          </>
        )}

        {/* ================================================= */}
        {/* GALLERY */}
        {/* ================================================= */}

        {photoOption === "gallery" && (
          <div
            className={`rounded-2xl border p-4 ${isDark
                ? "border-neutral-700 bg-neutral-800/50"
                : "border-neutral-200 bg-neutral-50"
              }`}
          >
            <div className="flex justify-end mb-3">
              <button
                type="button"
                onClick={() => setShowGalleryModal(true)}
                className="rounded-lg bg-primary-900 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-800"
              >
                Open Gallery
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="w-4 h-4 text-primary-500" />

              <p className="text-xs font-semibold">
                Select an image from Gallery
              </p>
            </div>

            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {galleryImages.map((image) => {
                  const isSelected =
                    selectedGalleryImage?.id ===
                    image.id;

                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() =>
                        handleGalleryImageSelect(image)
                      }
                      className={`relative overflow-hidden rounded-xl border-2 text-left transition-all ${isSelected
                          ? "border-primary-500 ring-2 ring-primary-500/20"
                          : isDark
                            ? "border-neutral-700 hover:border-primary-400"
                            : "border-neutral-200 hover:border-primary-400"
                        }`}
                    >
                      <Image
                        src={image.url}
                        alt={image.title || 'Gallery image'}
                        width={800}
                        height={450}
                        className="w-full h-28 object-cover"
                      />

                      <div
                        className={`px-2 py-1.5 text-[10px] ${isDark
                            ? "bg-neutral-900 text-neutral-200"
                            : "bg-white text-neutral-700"
                          }`}
                      >
                        {image.title}
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-500 text-white flex items-center justify-center">
                          <CheckCircleIcon className="w-4 h-4" />
                        </div>
                      )}

                      
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <ImageIcon className="w-8 h-8 mx-auto text-neutral-400 mb-2" />

                <p
                  className={`text-xs ${secondaryText}`}
                >
                  No images available in the gallery.
                </p>
              </div>
            )}

            {selectedGalleryImage && (
              <div
                className={`mt-3 rounded-lg px-3 py-2 text-xs ${isDark
                    ? "bg-primary-500/10 text-primary-300"
                    : "bg-primary-50 text-primary-700"
                  }`}
              >
                Selected:{" "}
                <span className="font-semibold">
                  {selectedGalleryImage.title}
                </span>
              </div>
            )}

            {errors.photo && (
              <p className="text-xs text-danger-500 mt-2">
                {errors.photo}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Gallery Modal (uses shared Modal pattern) */}
      <Modal isOpen={showGalleryModal} onClose={() => setShowGalleryModal(false)} title="Select Image from Gallery" size="xl">
        <div className="flex items-center justify-between mb-4 gap-4">
          <div>
            <p className="text-sm text-neutral-500">Search and pick an image to use in your blog post.</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={gallerySearch}
              onChange={(e) => setGallerySearch(e.target.value)}
              placeholder="Search by user or filename..."
              className={`rounded-lg border px-3 py-2 text-xs shadow-sm ${isDark ? 'border-neutral-700 bg-neutral-800 text-neutral-50' : 'border-neutral-300 bg-white text-neutral-900'}`}
            />

            <button onClick={() => setGallerySearch("")} className="text-xs text-neutral-500 hover:text-neutral-700">Clear</button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {((galleryImages || []).filter((img) => {
            if (!gallerySearch.trim()) return true;
            const q = gallerySearch.toLowerCase();
            return (img.title || "").toLowerCase().includes(q) || (img.url || "").toLowerCase().includes(q) || (img.owner || "").toLowerCase().includes(q);
          })).length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <p className="text-sm text-neutral-500">No images match your search.</p>
            </div>
          ) : (
            (galleryImages || []).filter((img) => {
              if (!gallerySearch.trim()) return true;
              const q = gallerySearch.toLowerCase();
              return (img.title || "").toLowerCase().includes(q) || (img.url || "").toLowerCase().includes(q) || (img.owner || "").toLowerCase().includes(q);
            }).map((image) => {
              const isSelected = selectedGalleryImage?.id === image.id;

              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => {
                    handleGalleryImageSelect(image);
                    setShowGalleryModal(false);
                  }}
                  className={`relative overflow-hidden rounded-xl border-2 text-left transition-all ${isSelected ? 'border-primary-500 ring-2 ring-primary-500/20' : (isDark ? 'border-neutral-700 hover:border-primary-400' : 'border-neutral-200 hover:border-primary-400')}`}
                >
                                  <Image src={image.url} alt={image.title || 'Gallery image'} width={800} height={450} className="w-full h-40 object-cover" />

                  <div className={`px-2 py-1.5 text-[11px] ${isDark ? 'bg-neutral-900 text-neutral-200' : 'bg-white text-neutral-700'}`}>{image.title}</div>

                  {image.owner && (
                    <div className="px-2 py-0.5 text-[10px] text-neutral-500">
                      Uploaded by: <span className="font-medium">{image.owner}</span>
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-500 text-white flex items-center justify-center">
                      <CheckCircleIcon className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </Modal>
    </Card>
  );
}