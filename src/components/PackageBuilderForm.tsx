"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

const steps = [
  "Basic Info",
  "Itinerary",
  "Dates",
  "Pricing",
  "Media",
  "Add-Ons",
  "Review",
];

interface ItineraryDay {
  day: number;
  location: string;
  desc: string;
  altitude: string;
  photoUrl: string; // Storing string references for local preview stability
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
  maxGroup: number;
  shortDesc: string;
  fullDesc: string;
  itinerary: ItineraryDay[];
  dates: DateSlot[];
  basePrice: number;
  currency: string;
  pricing: PriceTier[];
  heroImage: string;
  gallery: string[];
  video: string;
  addons: AddOnItem[];
}
interface PackageBuilderFormProps {
  initialData?: PackageForm | null;
  packageId?: string;
}

const initialFormState: PackageForm = {
  title: "",
  destination: "",
  difficulty: "Moderate",
  duration: 1,
  maxGroup: 12,
  shortDesc: "",
  fullDesc: "",
  itinerary: [],
  dates: [],
  basePrice: 0,
  currency: "NPR",
  pricing: [],
  heroImage: "",
  gallery: [],
  video: "",
  addons: [],
};

export default function PackageBuilderForm({
  initialData,
  packageId: propPackageId,
}: PackageBuilderFormProps) {
  const router = useRouter();
  const params = useParams();

  const packageId = propPackageId || (params?.id as string | undefined);

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PackageForm>(
    initialData || initialFormState,
  );

  const [calendarInput, setCalendarInput] = useState("");
  const [defaultSlotAllocation, setDefaultSlotAllocation] = useState(15);

  const next = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleSaveToStorage = (targetStatus: "Draft" | "Published") => {
    const stored = localStorage.getItem("packages");
    const database: PackageForm[] = stored ? JSON.parse(stored) : [];

    const payload: PackageForm = {
      ...formData,
      id: packageId || `pkg-${Date.now()}`,
      // Attaching standard metadata fields mapping back to core packages.json specs
      ...{ status: targetStatus },
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
    alert(`Success: Package securely recorded as ${targetStatus}!`);
    router.push("/dashboard/packages");
  };

  /* ==========================================
     STEP 2: IMMUTABLE ITINERARY CONTROLLERS
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
     STEP 3: DEPARTURE CONTROLLERS
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

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white border border-neutral-200 shadow-sm rounded-2xl my-8">
      {/* Dynamic Title Wrapper */}
      <div className="mb-6 border-b border-neutral-100 pb-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500 mb-1">
          <button
            type="button"
            onClick={() => router.push("/dashboard/packages")}
            className="transition hover:text-neutral-900"
          >
            Packages
          </button>
          <span className="text-neutral-300">/</span>
          <span className="font-semibold text-neutral-900">
            {packageId ? "Edit Package" : "Create Package"}
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-neutral-900">
          {packageId ? "Edit Package" : "Create Package"}
        </h1>
        <p className="mt-1 text-sm leading-6 text-neutral-600">
          {packageId
            ? "Update your package details and publish your changes."
            : "Create a new travel package by completing the steps below."}
        </p>
      </div>

      {/* Progress Bar Header */}
      <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 mb-6 sm:mb-8">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`px-3 py-2 text-xs font-semibold rounded-2xl text-center border transition-all ${
              i === currentStep
                ? "bg-primary-900 text-white border-primary-900 shadow-sm"
                : i < currentStep
                  ? "bg-primary-50 text-primary-900 border-primary-200"
                  : "bg-neutral-50 text-neutral-400 border-neutral-200"
            }`}
          >
            <div className="font-bold opacity-70 mb-0.5">Step {i + 1}</div>
            <div className="truncate">{step}</div>
          </div>
        ))}
      </div>

      {/* Step Container Board */}
      <div className="min-h-95 w-full min-w-0 overflow-hidden bg-white rounded-2xl p-3 sm:p-6 border border-neutral-200 shadow-sm mb-6">
        {/* STEP 1: BASIC INFO */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              Package Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Package Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 min-h-[44px] text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  placeholder="e.g., Manaslu Circuit Tour"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Destination
                </label>
                <select
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 min-h-[44px] text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData({ ...formData, destination: e.target.value })
                  }
                >
                  <option value="Everest">Everest Region</option>
                  <option value="Annapurna">Annapurna Region</option>
                  <option value="Langtang">Langtang Valley</option>
                  <option value="Manaslu">Manaslu Region</option>
                  <option value="Mardi">Mardi Himal</option>
                  <option value="Tansen">Tansen</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Difficulty
                </label>
                <select
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 min-h-[44px] text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      difficulty: e.target.value as
                        | "Easy"
                        | "Moderate"
                        | "Strenuous"
                        | "Extreme",
                    })
                  }
                >
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Strenuous">Strenuous</option>
                  <option value="Extreme">Extreme</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 min-h-[44px] text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    value={formData.duration || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">
                    Maximum Group Size
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 min-h-[44px] text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    value={formData.maxGroup || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxGroup: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                Short Description
              </label>
              <textarea
                rows={2}
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                placeholder="Enter brief overview context..."
                value={formData.shortDesc}
                onChange={(e) =>
                  setFormData({ ...formData, shortDesc: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                Full Description
              </label>
              <textarea
                rows={4}
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                placeholder="Write standard layout itinerary guidelines..."
                value={formData.fullDesc}
                onChange={(e) =>
                  setFormData({ ...formData, fullDesc: e.target.value })
                }
              />
            </div>
          </div>
        )}

        {/* STEP 2: ITINERARY BUILDER */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-neutral-200 pb-3">
              <h2 className="text-lg font-semibold text-neutral-900">
                Itinerary
              </h2>
              <button
                type="button"
                onClick={addItineraryDay}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-2xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800"
              >
                + Append Day Card
              </button>
            </div>

            <div className="space-y-3 max-h-100 overflow-y-auto pr-2">
              {(formData.itinerary || []).map((day, i) => (
                <div
                  key={i}
                  className="w-full min-w-0 bg-white border border-neutral-200 rounded-2xl p-3 sm:p-5 shadow-sm relative"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
                    <span className="text-xs font-semibold text-primary-900 bg-primary-50 px-2.5 py-1 rounded-full">
                      Day {day.day}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        disabled={i === 0}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center border border-neutral-200 text-neutral-500 rounded-xl hover:bg-neutral-50 disabled:opacity-30"
                        onClick={() => moveItineraryItem(i, "up")}
                        aria-label="Move day up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={i === formData.itinerary.length - 1}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center border border-neutral-200 text-neutral-500 rounded-xl hover:bg-neutral-50 disabled:opacity-30"
                        onClick={() => moveItineraryItem(i, "down")}
                        aria-label="Move day down"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        className="min-h-[44px] px-3 text-xs font-semibold border border-danger-200 text-danger-700 rounded-xl bg-danger-50 hover:bg-danger-100"
                        onClick={() => removeItineraryDay(i)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                    <input
                      className="w-full rounded-xl border border-neutral-200 px-3 py-2 min-h-[44px] text-xs outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                      placeholder="Target Stop Location"
                      value={day.location}
                      onChange={(e) =>
                        updateItineraryField(i, "location", e.target.value)
                      }
                    />
                    <input
                      className="w-full rounded-xl border border-neutral-200 px-3 py-2 min-h-[44px] text-xs outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                      placeholder="Target Elevation Altitude (m)"
                      value={day.altitude}
                      onChange={(e) =>
                        updateItineraryField(i, "altitude", e.target.value)
                      }
                    />
                  </div>
                  <textarea
                    className="w-full max-w-full resize-y rounded-xl border border-neutral-200 px-3 py-2 text-xs mb-2 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    placeholder="Describe tracking details and parameters..."
                    rows={2}
                    value={day.desc}
                    onChange={(e) =>
                      updateItineraryField(i, "desc", e.target.value)
                    }
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label className="text-[11px] text-neutral-400 font-medium whitespace-nowrap">
                      Mock Visual Banner URL:
                    </label>
                    <input
                      type="text"
                      className="rounded-xl border border-neutral-200 px-3 py-2 min-h-[44px] text-xs w-full sm:flex-1 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                      placeholder="https://image-path.jpg"
                      value={day.photoUrl || ""}
                      onChange={(e) =>
                        updateItineraryField(i, "photoUrl", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: DEPARTURE DATES MANAGEMENT */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-neutral-900">
              Departure Scheduling Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 border border-neutral-200 rounded-2xl shadow-sm space-y-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">
                    Pick Allocation Date Target
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-neutral-200 px-4 py-2.5 min-h-[44px] text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    value={calendarInput}
                    onChange={(e) => setCalendarInput(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">
                    Max Slots Target Allocation
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-neutral-200 px-4 py-2.5 min-h-[44px] text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    value={defaultSlotAllocation}
                    onChange={(e) =>
                      setDefaultSlotAllocation(parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <button
                  type="button"
                  className="w-full min-h-[44px] py-2 rounded-2xl bg-primary-900 text-white text-xs font-semibold hover:bg-primary-800"
                  onClick={handleToggleCalendarDate}
                >
                  Register / Toggle Target Departure Batch
                </button>
              </div>

              <div className="bg-white p-4 border border-neutral-200 rounded-2xl shadow-sm">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                  Active Registered Calendar Batches
                </h4>
                {!formData.dates || formData.dates.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">
                    No batches configured yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-62.5 overflow-y-auto">
                    {formData.dates.map((d, i) => (
                      <div
                        key={i}
                        className="flex flex-wrap justify-between items-center gap-2 text-xs p-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                      >
                        <div>
                          <span className="font-semibold text-neutral-700">
                            {d.date}
                          </span>
                          <span className="ml-2 text-neutral-400">
                            (Slots: {d.slots})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-success-50 text-success-700 font-semibold px-1.5 py-0.5 rounded-full text-[10px]">
                            Available
                          </span>
                          <button
                            type="button"
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-danger-700 hover:text-danger-800 font-bold"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                dates: formData.dates.filter(
                                  (x) => x.date !== d.date,
                                ),
                              })
                            }
                            aria-label="Remove date"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: FINANCIAL PRICE CONFIGURATION */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-neutral-900">
              Financial Setup & Scaling Matrix
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Standard Price Base Metric
                </label>
                <input
                  type="number"
                  className="w-full rounded-2xl border border-neutral-200 px-4 py-2.5 min-h-[44px] text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  placeholder="Cost"
                  value={formData.basePrice || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      basePrice: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Currency standard code
                </label>
                <select
                  className="w-full rounded-2xl border border-neutral-200 px-4 py-2.5 min-h-[44px] text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  value={formData.currency || "NPR"}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                >
                  <option value="NPR">NPR (रू)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                <label className="block text-xs font-semibold text-neutral-600">
                  Volume Discount Scaling Tiers
                </label>
                <button
                  type="button"
                  className="min-h-[44px] text-xs text-primary-900 font-semibold hover:underline text-left sm:text-right"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      pricing: [
                        ...(formData.pricing || []),
                        { min: 1, max: 5, price: 0 },
                      ],
                    })
                  }
                >
                  + Append Pricing Bracket Row
                </button>
              </div>
              <div className="space-y-2">
                {formData.pricing?.map((tier, i) => (
                  <div
                    key={i}
                    className="w-full min-w-0 flex flex-col sm:flex-row gap-2 sm:items-center bg-white p-3border border-neutral-200 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400 w-10 sm:w-auto">
                        Min:
                      </span>
                      <input
                        type="number"
                        className="border border-neutral-200 rounded-lg text-xs p-2 min-h-[44px] w-full sm:w-16"
                        value={tier.min}
                        onChange={(e) => {
                          const tiers = [...formData.pricing];
                          tiers[i].min = parseInt(e.target.value) || 0;
                          setFormData({ ...formData, pricing: tiers });
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400 w-10 sm:w-auto">
                        Max:
                      </span>
                      <input
                        type="number"
                        className="border border-neutral-200 rounded-lg text-xs p-2 min-h-[44px] w-full sm:w-16"
                        value={tier.max}
                        onChange={(e) => {
                          const tiers = [...formData.pricing];
                          tiers[i].max = parseInt(e.target.value) || 0;
                          setFormData({ ...formData, pricing: tiers });
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2 sm:ml-auto">
                      <span className="text-xs text-neutral-400 whitespace-nowrap">
                        Rate ({formData.currency || "NPR"}):
                      </span>
                      <input
                        type="number"
                        className="border border-neutral-200 rounded-lg text-xs p-2 min-h-[44px] w-full sm:w-24 font-medium"
                        value={tier.price}
                        onChange={(e) => {
                          const tiers = [...formData.pricing];
                          tiers[i].price = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, pricing: tiers });
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center self-end sm:self-auto text-danger-700 hover:bg-danger-50 rounded-lg"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          pricing: formData.pricing.filter(
                            (_, idx) => idx !== i,
                          ),
                        })
                      }
                      aria-label="Remove pricing tier"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: MEDIA ASSETS */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-neutral-900">
              Media Assets
            </h3>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                Hero Image Pointer string URL
              </label>
              <input
                type="text"
                className="w-full rounded-2xl border border-neutral-200 px-4 py-2.5 min-h-[44px] text-xs outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                placeholder="https://images.unsplash.com/... (Mock Crop Link)"
                value={formData.heroImage || ""}
                onChange={(e) =>
                  setFormData({ ...formData, heroImage: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                Gallery Image Link Array (Comma Separated Strings)
              </label>
              <textarea
                rows={3}
                className="w-full rounded-2xl border border-neutral-200 px-4 py-2.5 text-xs outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                placeholder="URL_1, URL_2, URL_3..."
                value={formData.gallery?.join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gallery: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                YouTube Promotional URL Track
              </label>
              <input
                type="text"
                className="w-full rounded-2xl border border-neutral-200 px-4 py-2.5 min-h-[44px] text-xs outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.video || ""}
                onChange={(e) =>
                  setFormData({ ...formData, video: e.target.value })
                }
              />
            </div>
          </div>
        )}

        {/* STEP 6: ADD-ONS */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-neutral-200 pb-3">
              <h3 className="text-base font-semibold text-neutral-900">
                Trip Ancillary & Service Addons
              </h3>
              <button
                type="button"
                className="inline-flex items-center justify-center min-h-[44px] rounded-2xl bg-primary-900 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-800"
                onClick={() =>
                  setFormData({
                    ...formData,
                    addons: [
                      ...(formData.addons || []),
                      { name: "", price: 0, perPerson: true },
                    ],
                  })
                }
              >
                + Append Service Row
              </button>
            </div>
            <div className="space-y-2">
              {formData.addons?.map((addon, i) => (
                <div
                  key={i}
                  className="w-full min-w-0 flex flex-col sm:flex-row gap-2 sm:items-center bg-white p-3border border-neutral-200 rounded-xl shadow-sm"
                >
                  <input
                    className="text-xs border border-neutral-200 rounded-lg p-2 min-h-[44px] w-full sm:flex-1"
                    placeholder="e.g., Porter Service, Travel Insurance"
                    value={addon.name}
                    onChange={(e) => {
                      const arr = [...formData.addons];
                      arr[i].name = e.target.value;
                      setFormData({ ...formData, addons: arr });
                    }}
                  />
                  <input
                    type="number"
                    className="text-xs border border-neutral-200 rounded-lg p-2 min-h-[44px] w-full sm:w-20"
                    placeholder="Cost"
                    value={addon.price || ""}
                    onChange={(e) => {
                      const arr = [...formData.addons];
                      arr[i].price = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, addons: arr });
                    }}
                  />
                  <label className="flex items-center gap-2 text-xs text-neutral-600 font-medium min-h-[44px] px-1">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-primary-900"
                      checked={addon.perPerson}
                      onChange={(e) => {
                        const arr = [...formData.addons];
                        arr[i].perPerson = e.target.checked;
                        setFormData({ ...formData, addons: arr });
                      }}
                    />
                    Per Pax
                  </label>
                  <button
                    type="button"
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center self-end sm:self-auto text-danger-700 font-bold"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        addons: formData.addons.filter((_, idx) => idx !== i),
                      })
                    }
                    aria-label="Remove addon"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: COMPREHENSIVE REVIEW SUMMARY BOARD */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-neutral-900">
              Final Verification Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-3 border border-neutral-200 rounded-xl">
                <h4 className="font-semibold text-primary-900 mb-1">
                  Core Identity Metrics
                </h4>
                <p className="break-words">
                  <span className="text-neutral-400">Title:</span>{" "}
                  {formData.title || "Unspecified Plan"}
                </p>
                <p className="break-words">
                  <span className="text-neutral-400">Region Base:</span>{" "}
                  {formData.destination || "None Specified"}
                </p>
                <p>
                  <span className="text-neutral-400">Difficulty Scale:</span>{" "}
                  {formData.difficulty}
                </p>
                <p>
                  <span className="text-neutral-400">Duration Metrics:</span>{" "}
                  {formData.duration} Days (Max Group: {formData.maxGroup})
                </p>
              </div>

              <div className="bg-white p-3 border border-neutral-200 rounded-xl">
                <h4 className="font-semibold text-primary-900 mb-1">
                  Financial Parameters
                </h4>
                <p>
                  <span className="text-neutral-400">Standard Baseline:</span>{" "}
                  {formData.currency || "NPR"} {formData.basePrice}
                </p>
                <p>
                  <span className="text-neutral-400">
                    Volume Scaling Tiers Mapped:
                  </span>{" "}
                  {formData.pricing?.length || 0} configurations
                </p>
                <p>
                  <span className="text-neutral-400">
                    Ancillary Items Added:
                  </span>{" "}
                  {formData.addons?.length || 0} features
                </p>
              </div>
            </div>

            <div className="bg-white p-3 border border-neutral-200 rounded-xl text-xs">
              <h4 className="font-semibold text-neutral-700 mb-1">
                Itinerary Route Timeline ({formData.itinerary?.length || 0} Days
                Mapped)
              </h4>
              <div className="max-h-30 overflow-y-auto space-y-1">
                {formData.itinerary?.map((day, i) => (
                  <div key={i} className="text-neutral-600 break-words">
                    <strong>Day {day.day}:</strong>{" "}
                    {day.location || "Acclimatization Station"} — {day.altitude}
                    m
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4">
              <button
                type="button"
                className="min-h-[44px] px-4 py-2 border border-neutral-200 rounded-2xl text-sm font-semibold bg-white text-neutral-900 hover:bg-neutral-50"
                onClick={() => handleSaveToStorage("Draft")}
              >
                Save Progress as Draft
              </button>
              <button
                type="button"
                className="min-h-[44px] px-4 py-2 rounded-2xl text-sm font-semibold bg-success-600 text-white hover:bg-success-700"
                onClick={() => handleSaveToStorage("Published")}
              >
                Publish live Package
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step Navigation Controls */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 pt-4 border-t border-neutral-100">
        <button
          type="button"
          className="min-h-[44px] w-full sm:w-auto px-5 py-2.5 border border-neutral-200 text-sm font-semibold rounded-2xl bg-white text-neutral-900 hover:bg-neutral-50 transition-colors disabled:opacity-30"
          onClick={prev}
          disabled={currentStep === 0}
        >
          ◄ Back
        </button>
        <button
          type="button"
          className="min-h-[44px] w-full sm:w-auto px-5 py-2.5 bg-primary-900 text-white text-sm font-semibold rounded-2xl hover:bg-primary-800 transition-colors disabled:opacity-30"
          onClick={next}
          disabled={currentStep === steps.length - 1}
        >
          Next Step ►
        </button>
      </div>
    </div>
  );
}
