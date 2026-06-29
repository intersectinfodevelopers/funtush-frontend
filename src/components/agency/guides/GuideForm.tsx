"use client";

import { useState } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import type { NewGuide } from "@/hooks/useGuides";

interface Certification {
  name: string;
  issuingBody: string;
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
  initialData?: Guide; //pre-fill data when editing
  onSave: (data: NewGuide) => void; //called when form is submitted
  isNew?: boolean; //changes the submit button text
}

export default function GuideForm({
  initialData,
  onSave,
  isNew = false,
}: GuideFormProps) {
  const getInitialCertifications = () =>
    initialData?.certifications?.length
      ? initialData.certifications
      : [{ name: "", issuingBody: "", number: "", expiry: "" }];

  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [photo, setPhoto] = useState(initialData?.photo || "");
  const [bio, setBio] = useState(initialData?.bio || "");
  const [languages, setLanguages] = useState<string[]>(initialData?.languages || []);
  const [certifications, setCertifications] = useState<Certification[]>(getInitialCertifications);

  const languageOptions = [
    "English",
    "Nepali",
    "Hindi",
    "French",
    "German",
    "Chinese",
  ];
  // Certification row
  const addCertificationRow = () => {
    setCertifications([
      ...certifications,
      { name: "", issuingBody: "", number: "", expiry: "" },
    ]);
  };

  const removeCertificationRow = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const updateCertification = (
    index: number,
    field: keyof Certification,
    value: string,
  ) => {
    const updated = [...certifications];
    updated[index][field] = value;
    setCertifications(updated);
  };

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build the guide object
    const guideData = {
      name,
      email,
      phone,
      photo: photo || "/images/guides/default.jpg", // fallback image
      bio,
      languages,
      certifications,
      // Defaults for fields that might be missing
      status: initialData?.status || "available",
      rating: initialData?.rating || 0,
      totalTreks: initialData?.totalTreks || 0,
      upcomingAssignments: initialData?.upcomingAssignments || [],
    };

    onSave(guideData);
  };

  // ---------- Render ----------
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isNew ? "Add New Guide" : "Edit Guide"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ---- Name ---- */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full border border-neutral-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* ---- Email ---- */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-neutral-300 rounded px-3 py-1.5 text-sm"
            />
          </div>

          {/* ---- Phone ---- */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full border border-neutral-300 rounded px-3 py-1.5 text-sm"
            />
          </div>

          {/* ---- Photo URL ---- */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Photo URL
            </label>
            <input
              type="text"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              placeholder="e.g. /images/guides/suresh.jpg"
              className="mt-1 block w-full border border-neutral-300 rounded px-3 py-1.5 text-sm"
            />
          </div>

          {/* ---- Bio ---- */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-neutral-300 rounded px-3 py-1.5 text-sm"
            />
          </div>

          {/* ---- Languages (multi‑select) ---- */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Languages
            </label>
            <select
              multiple
              value={languages}
              onChange={(e) => {
                const selected = Array.from(
                  e.target.selectedOptions,
                  (opt) => opt.value,
                );
                setLanguages(selected);
              }}
              className="mt-1 block w-full border border-neutral-300 rounded px-3 py-1.5 text-sm h-auto min-h-20"
            >
              {languageOptions.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500 mt-1">
              Hold Ctrl (Cmd on Mac) to select multiple
            </p>
          </div>

          {/* ---- Certifications ---- */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-700">
                Certifications
              </h3>
              <button
                type="button"
                onClick={addCertificationRow}
                className="text-sm text-blue-600 hover:underline"
              >
                + Add Row
              </button>
            </div>
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="border border-neutral-200 rounded p-3 mt-2 space-y-2"
              >
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-neutral-600">
                      Cert Name
                    </label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) =>
                        updateCertification(index, "name", e.target.value)
                      }
                      className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-neutral-600">
                      Issuing Body
                    </label>
                    <input
                      type="text"
                      value={cert.issuingBody}
                      onChange={(e) =>
                        updateCertification(
                          index,
                          "issuingBody",
                          e.target.value,
                        )
                      }
                      className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-neutral-600">
                      Cert Number
                    </label>
                    <input
                      type="text"
                      value={cert.number}
                      onChange={(e) =>
                        updateCertification(index, "number", e.target.value)
                      }
                      className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-neutral-600">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={cert.expiry}
                      onChange={(e) =>
                        updateCertification(index, "expiry", e.target.value)
                      }
                      className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeCertificationRow(index)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {/* Document upload – optional */}
                <div>
                  <label className="block text-xs text-neutral-600">
                    Upload Document (optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        updateCertification(index, "document", file.name);
                      }
                    }}
                    className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                  />
                  {cert.document && (
                    <span className="text-xs text-neutral-500">
                      📄 {cert.document}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ---- Action Buttons ---- */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              {isNew ? "Create Guide" : "Update Guide"}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
