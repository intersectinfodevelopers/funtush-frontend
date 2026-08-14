"use client";

import Link from "next/link";
import { FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import type { NewGuide } from "@/hooks/useGuides";

interface Certification {
  name: string;
  issuingBody?: string;
  number: string;
  expiry: string;
  document?: string;
}

interface UpcomingAssignment {
  id: string;
  title?: string;
  date?: string;
  status?: string;
}

interface Guide {
  name: string;
  email?: string;
  phone?: string;
  photo?: string;
  bio?: string;
  languages?: string[];
  certifications?: Certification[];
  status?: string;
  rating?: number;
  totalTreks?: number;
  upcomingAssignments?: UpcomingAssignment[];
}

interface GuideFormProps {
  initialData?: Guide;
  onSave: (data: NewGuide) => void;
  isNew?: boolean;
}


const emptyCertification = (): Certification => ({
  name: "",
  issuingBody: "",
  number: "",
  expiry: "",
});
const fieldClassName =
  "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-50";

export default function GuideForm({
  initialData,
  onSave,
  isNew = false,
}: GuideFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [photo, setPhoto] = useState(initialData?.photo ?? "");
  const [bio, setBio] = useState(initialData?.bio ?? "");
  const [languages, setLanguages] = useState<string[]>(
    initialData?.languages ?? [],
  );
  const [languageInput, setLanguageInput] = useState("");
  const [photoFileName, setPhotoFileName] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const [certifications, setCertifications] = useState<Certification[]>(
    initialData?.certifications?.length
      ? initialData.certifications
      : [emptyCertification()],
  );

  const addLanguage = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const normalized = trimmed.replace(/,$/, "");
    if (languages.includes(normalized)) return;
    setLanguages((current) => [...current, normalized]);
  };

  const handleLanguageKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addLanguage(languageInput);
      setLanguageInput("");
    }

    if (event.key === "Backspace" && !languageInput && languages.length > 0) {
      setLanguages((current) => current.slice(0, -1));
    }
  };

  const removeLanguage = (language: string) => {
    setLanguages((current) => current.filter((item) => item !== language));
  };

  const updateCertification = (
    index: number,
    field: keyof Certification,
    value: string,
  ) => {
    setCertifications((current) =>
      current.map((certification, itemIndex) =>
        itemIndex === index
          ? { ...certification, [field]: value }
          : certification,
      ),
    );
  };

  const processFile = (file: File | null | undefined) => {
    if (!file) return;

    setPhotoFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    processFile(file);
  };

  const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    processFile(event.dataTransfer.files?.[0]);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSave({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      photo: photo.trim() || "/images/guides/default.jpg",
      bio: bio.trim(),
      languages,
      certifications: certifications.filter((certification) =>
        Object.values(certification).some(Boolean),
      ),
      status: initialData?.status ?? "available",
      rating: initialData?.rating ?? 0,
      totalTreks: initialData?.totalTreks ?? 0,
      upcomingAssignments: initialData?.upcomingAssignments ?? [],
    });
  };

  return (
    <form
      className="w-full rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6"
      onSubmit={handleSubmit}
    >
      <div className="border-b border-neutral-200 pb-5">
        <h1 className="text-xl font-bold text-neutral-900">
          {isNew ? "Add new guide" : "Edit guide"}
        </h1>
      </div>

      <section className="pt-5" aria-labelledby="guide-details-heading">
        <div className="mb-4">
          <h2
            id="guide-details-heading"
            className="text-base font-bold text-neutral-900"
          >
            Guide details
          </h2>
        
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="guide-name" required>
            <input
              id="guide-name"
              className={fieldClassName}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Suresh Gurung"
              required
            />
          </Field>
          <Field label="Phone" htmlFor="guide-phone">
            <input
              id="guide-phone"
              className={fieldClassName}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+977 98…"
              type="tel"
            />
          </Field>

          <div className="space-y-4">
            <Field label="Email address" htmlFor="guide-email">
              <input
                id="guide-email"
                className={fieldClassName}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="guide@example.com"
                type="email"
              />
            </Field>
            <Field label="Languages" htmlFor="guide-languages">
              <div className="space-y-2">
                <input
                  id="guide-languages"
                  className={fieldClassName}
                  value={languageInput}
                  onChange={(event) => setLanguageInput(event.target.value)}
                  onKeyDown={handleLanguageKeyDown}
                  placeholder="Type a language and press Enter"
                  type="text"
                />
                <div className="flex flex-wrap gap-2">
                  {languages.map((language) => (
                    <button
                      key={language}
                      type="button"
                      onClick={() => removeLanguage(language)}
                      className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700 transition hover:bg-neutral-200"
                    >
                      <span>{language}</span>
                      <span className="text-neutral-400">×</span>
                    </button>
                  ))}
                </div>
              </div>
            </Field>
          </div>

          <Field label="Upload photo" htmlFor="guide-photo">
            <div
              className={`rounded-3xl border-2 border-dashed bg-white p-4 transition ${
                dragActive ? "border-primary-400 bg-primary-50" : "border-neutral-200"
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center gap-3 text-center text-sm text-neutral-600">
                <div className="relative flex h-36 w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt="Guide preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-neutral-500">Drag & drop an image here</span>
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
                  <label
                    htmlFor="guide-photo"
                    className="inline-flex cursor-pointer items-center justify-center rounded-full bg-primary-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-800"
                  >
                    Choose file
                  </label>
                  <span className="text-xs text-neutral-500">
                    {photoFileName || "No file chosen"}
                  </span>
                </div>
                <input
                  id="guide-photo"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handlePhotoFile}
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-neutral-500">
              Drag and drop a photo or choose one from your device. If you skip this, a default avatar will be used.
            </p>
          </Field>
          <Field
            label="Short bio"
            htmlFor="guide-bio"
            className="sm:col-span-2"
          >
            <textarea
              id="guide-bio"
              className={`${fieldClassName} min-h-28 resize-y`}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Experience, specialties, and local knowledge…"
              rows={4}
            />
          </Field>
        </div>
      </section>

      <section
        className="mt-7 border-t border-neutral-200 pt-5"
        aria-labelledby="certifications-heading"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="certifications-heading"
              className="text-base font-bold text-neutral-900"
            >
              Certifications
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Keep license and safety certification details up to date.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-800 hover:bg-primary-100"
            type="button"
            onClick={() =>
              setCertifications((current) => [...current, emptyCertification()])
            }
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Add certification
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {certifications.map((certification, index) => (
            <div
              key={index}
              className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-neutral-700">
                  Certification {index + 1}
                </p>
                {certifications.length > 1 && (
                  <button
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-danger-700 hover:bg-danger-50"
                    type="button"
                    onClick={() =>
                      setCertifications((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
                  </button>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Certification name"
                  htmlFor={`cert-name-${index}`}
                >
                  <input
                    id={`cert-name-${index}`}
                    className={fieldClassName}
                    value={certification.name}
                    onChange={(event) =>
                      updateCertification(index, "name", event.target.value)
                    }
                    placeholder="e.g. Wilderness First Aid"
                  />
                </Field>
                <Field label="Issuing body" htmlFor={`cert-issuer-${index}`}>
                  <input
                    id={`cert-issuer-${index}`}
                    className={fieldClassName}
                    value={certification.issuingBody}
                    onChange={(event) =>
                      updateCertification(
                        index,
                        "issuingBody",
                        event.target.value,
                      )
                    }
                    placeholder="Organization name"
                  />
                </Field>
                <Field
                  label="Certificate number"
                  htmlFor={`cert-number-${index}`}
                >
                  <input
                    id={`cert-number-${index}`}
                    className={fieldClassName}
                    value={certification.number}
                    onChange={(event) =>
                      updateCertification(index, "number", event.target.value)
                    }
                    placeholder="Certificate ID"
                  />
                </Field>
                <Field label="Expiry date" htmlFor={`cert-expiry-${index}`}>
                  <input
                    id={`cert-expiry-${index}`}
                    className={fieldClassName}
                    value={certification.expiry}
                    onChange={(event) =>
                      updateCertification(index, "expiry", event.target.value)
                    }
                    type="date"
                  />
                </Field>
                <Field
                  label="Supporting document"
                  htmlFor={`cert-document-${index}`}
                  className="sm:col-span-2"
                >
                  <input
                    id={`cert-document-${index}`}
                    className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary-800 hover:file:bg-primary-50"
                    type="file"
                    onChange={(event) =>
                      updateCertification(
                        index,
                        "document",
                        event.target.files?.[0]?.name ?? "",
                      )
                    }
                  />
                  {certification.document && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                      {certification.document}
                    </p>
                  )}
                </Field>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-end">
        <Link
          href="/dashboard/guides"
          className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-center text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          Cancel
        </Link>
        <button
          className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-100"
          type="submit"
        >
          {isNew ? "Create guide" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required = false,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label
        className="mb-1.5 block text-sm font-semibold text-neutral-700"
        htmlFor={htmlFor}
      >
        {label}
        {required && (
          <span className="ml-1 text-danger-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
