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
    <div className="max-w-4xl mx-auto p-6 bg-white border border-gray-200 shadow-sm rounded-xl my-8">
      {/* Dynamic Title Wrapper */}
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {packageId ? "Edit Package" : "Create Package"}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {packageId
            ? "Update your package details and publish your changes."
            : "Create a new travel package by completing the steps below."}
        </p>
      </div>

      {/* Progress Bar Header */}
      <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 mb-8">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`px-3 py-2 text-xs font-medium rounded-lg text-center border transition-all ${
              i === currentStep
                ? "bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-sm"
                : i < currentStep
                  ? "bg-[#6C5CE7]/10 text-[#6C5CE7] border-[#6C5CE7]/20"
                  : "bg-gray-50 text-gray-400 border-gray-200"
            }
            }`}
          >
            <div className="font-bold opacity-70 mb-0.5">Step {i + 1}</div>
            <div className="truncate">{step}</div>
          </div>
        ))}
      </div>

      {/* Step Container Board */}
      <div className="min-h-95 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
        {/* STEP 1: BASIC INFO */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Package Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Package Name
                </label>
                <input
                  type="text"
                  className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white"
                  placeholder="e.g., Manaslu Circuit Tour"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Destination
                </label>
                <select
                  className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white"
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
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Difficulty
                </label>
                <select
                  className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white"
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
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white"
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
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Maximum Group Size
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white"
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
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Short Description
              </label>
              <textarea
                rows={2}
                className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white"
                placeholder="Enter brief overview context..."
                value={formData.shortDesc}
                onChange={(e) =>
                  setFormData({ ...formData, shortDesc: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Full Description
              </label>
              <textarea
                rows={4}
                className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white"
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
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <h2 className="text-lg font-semibold text-gray-900">Itinerary</h2>
              <button
                type="button"
                onClick={addItineraryDay}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Append Day Card
              </button>
            </div>

            <div className="space-y-3 max-h-100 overflow-y-auto pr-2">
              {(formData.itinerary || []).map((day, i) => (
                <div
                  key={i}
                  className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs relative"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                      Day {day.day}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={i === 0}
                        className="p-1 border text-gray-500 rounded hover:bg-gray-50 disabled:opacity-30"
                        onClick={() => moveItineraryItem(i, "up")}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={i === formData.itinerary.length - 1}
                        className="p-1 border text-gray-500 rounded hover:bg-gray-50 disabled:opacity-30"
                        onClick={() => moveItineraryItem(i, "down")}
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 text-xs border border-red-200 text-red-600 rounded bg-red-50/50 hover:bg-red-50"
                        onClick={() => removeItineraryDay(i)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                    <input
                      className="w-full text-xs border p-2 rounded-lg"
                      placeholder="Target Stop Location"
                      value={day.location}
                      onChange={(e) =>
                        updateItineraryField(i, "location", e.target.value)
                      }
                    />
                    <input
                      className="w-full text-xs border p-2 rounded-lg"
                      placeholder="Target Elevation Altitude (m)"
                      value={day.altitude}
                      onChange={(e) =>
                        updateItineraryField(i, "altitude", e.target.value)
                      }
                    />
                  </div>
                  <textarea
                    className="w-full text-xs border p-2 rounded-lg mb-2"
                    placeholder="Describe tracking details and parameters..."
                    rows={2}
                    value={day.desc}
                    onChange={(e) =>
                      updateItineraryField(i, "desc", e.target.value)
                    }
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-gray-400 font-medium">
                      Mock Visual Banner URL:
                    </label>
                    <input
                      type="text"
                      className="border text-xs p-1 rounded flex-1"
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
            <h3 className="text-base font-semibold text-gray-700">
              Departure Scheduling Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 border rounded-xl shadow-sm space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Pick Allocation Date Target
                  </label>
                  <input
                    type="date"
                    className="w-full border p-2 text-sm rounded-lg"
                    value={calendarInput}
                    onChange={(e) => setCalendarInput(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Max Slots Target Allocation
                  </label>
                  <input
                    type="number"
                    className="w-full border p-2 text-sm rounded-lg"
                    value={defaultSlotAllocation}
                    onChange={(e) =>
                      setDefaultSlotAllocation(parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <button
                  type="button"
                  className="w-full py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800"
                  onClick={handleToggleCalendarDate}
                >
                  Register / Toggle Target Departure Batch
                </button>
              </div>

              <div className="bg-white p-4 border rounded-xl shadow-sm">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Active Registered Calendar Batches
                </h4>
                {!formData.dates || formData.dates.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">
                    No batches configured yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-62.5 overflow-y-auto">
                    {formData.dates.map((d, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-xs p-2 bg-gray-50 border rounded-lg"
                      >
                        <div>
                          <span className="font-semibold text-gray-700">
                            {d.date}
                          </span>
                          <span className="ml-2 text-gray-400">
                            (Slots: {d.slots})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-green-100 text-green-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                            Available
                          </span>
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700 font-bold px-1"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                dates: formData.dates.filter(
                                  (x) => x.date !== d.date,
                                ),
                              })
                            }
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
            <h3 className="text-base font-semibold text-gray-700">
              Financial Setup & Scaling Matrix
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Standard Price Base Metric
                </label>
                <input
                  type="number"
                  className="w-full text-sm border p-2 rounded-lg"
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
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Currency standard code
                </label>
                <select
                  className="w-full text-sm border p-2 rounded-lg"
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

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-gray-600">
                  Volume Discount Scaling Tiers
                </label>
                <button
                  type="button"
                  className="text-xs text-blue-600 font-medium hover:underline"
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
                    className="flex gap-2 items-center bg-white p-2 border rounded-lg"
                  >
                    <span className="text-xs text-gray-400">Min:</span>
                    <input
                      type="number"
                      className="border text-xs p-1 w-16 rounded"
                      value={tier.min}
                      onChange={(e) => {
                        const tiers = [...formData.pricing];
                        tiers[i].min = parseInt(e.target.value) || 0;
                        setFormData({ ...formData, pricing: tiers });
                      }}
                    />
                    <span className="text-xs text-gray-400">Max:</span>
                    <input
                      type="number"
                      className="border text-xs p-1 w-16 rounded"
                      value={tier.max}
                      onChange={(e) => {
                        const tiers = [...formData.pricing];
                        tiers[i].max = parseInt(e.target.value) || 0;
                        setFormData({ ...formData, pricing: tiers });
                      }}
                    />
                    <span className="text-xs text-gray-400 ml-auto">
                      Rate ({formData.currency || "NPR"}):
                    </span>
                    <input
                      type="number"
                      className="border text-xs p-1 w-24 font-medium rounded"
                      value={tier.price}
                      onChange={(e) => {
                        const tiers = [...formData.pricing];
                        tiers[i].price = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, pricing: tiers });
                      }}
                    />
                    <button
                      type="button"
                      className="text-red-500 px-1 hover:bg-gray-50 rounded"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          pricing: formData.pricing.filter(
                            (_, idx) => idx !== i,
                          ),
                        })
                      }
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
            <h3 className="text-base font-semibold text-gray-700">
              Media Assets Assets
            </h3>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Hero Image Pointer string URL
              </label>
              <input
                type="text"
                className="w-full text-xs border p-2 rounded-lg"
                placeholder="https://images.unsplash.com/... (Mock Crop Link)"
                value={formData.heroImage || ""}
                onChange={(e) =>
                  setFormData({ ...formData, heroImage: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Gallery Image Link Array (Comma Separated Strings)
              </label>
              <textarea
                rows={3}
                className="w-full text-xs border p-2 rounded-lg"
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
              <label className="block text-xs font-medium text-gray-500 mb-1">
                YouTube Promotional URL Track
              </label>
              <input
                type="text"
                className="w-full text-xs border p-2 rounded-lg"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.video || ""}
                onChange={(e) =>
                  setFormData({ ...formData, video: e.target.value })
                }
              />
            </div>
          </div>
        )}

        {/* STEP 5: ADD-ONS (Step 6 UI Array Position 5) */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-base font-semibold text-gray-700">
                Trip Ancillary & Service Addons
              </h3>
              <button
                type="button"
                className="px-3 py-1 bg-gray-900 text-white rounded text-xs"
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
                  className="flex gap-2 items-center bg-white p-2 border rounded-lg shadow-sm"
                >
                  <input
                    className="text-xs border p-1 flex-1 rounded"
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
                    className="text-xs border p-1 w-20 rounded"
                    placeholder="Cost"
                    value={addon.price || ""}
                    onChange={(e) => {
                      const arr = [...formData.addons];
                      arr[i].price = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, addons: arr });
                    }}
                  />
                  <label className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                    <input
                      type="checkbox"
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
                    className="text-red-500 px-1 font-bold"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        addons: formData.addons.filter((_, idx) => idx !== i),
                      })
                    }
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
            <h3 className="text-base font-bold text-gray-800">
              Final Verification Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-3 border rounded-xl">
                <h4 className="font-bold text-blue-600 mb-1">
                  Core Identity Metrics
                </h4>
                <p>
                  <span className="text-gray-400">Title:</span>{" "}
                  {formData.title || "Unspecified Plan"}
                </p>
                <p>
                  <span className="text-gray-400">Region Base:</span>{" "}
                  {formData.destination || "None Specified"}
                </p>
                <p>
                  <span className="text-gray-400">Difficulty Scale:</span>{" "}
                  {formData.difficulty}
                </p>
                <p>
                  <span className="text-gray-400">Duration Metrics:</span>{" "}
                  {formData.duration} Days (Max Group: {formData.maxGroup})
                </p>
              </div>

              <div className="bg-white p-3 border rounded-xl">
                <h4 className="font-bold text-blue-600 mb-1">
                  Financial Parameters
                </h4>
                <p>
                  <span className="text-gray-400">Standard Baseline:</span>{" "}
                  {formData.currency || "NPR"} {formData.basePrice}
                </p>
                <p>
                  <span className="text-gray-400">
                    Volume Scaling Tiers Mapped:
                  </span>{" "}
                  {formData.pricing?.length || 0} configurations
                </p>
                <p>
                  <span className="text-gray-400">Ancillary Items Added:</span>{" "}
                  {formData.addons?.length || 0} features
                </p>
              </div>
            </div>

            <div className="bg-white p-3 border rounded-xl text-xs">
              <h4 className="font-bold text-gray-700 mb-1">
                Itinerary Route Timeline ({formData.itinerary?.length || 0} Days
                Mapped)
              </h4>
              <div className="max-h-30 overflow-y-auto space-y-1">
                {formData.itinerary?.map((day, i) => (
                  <div key={i} className="text-gray-600">
                    <strong>Day {day.day}:</strong>{" "}
                    {day.location || "Acclimatization Station"} — {day.altitude}
                    m
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold bg-white text-gray-700 hover:bg-gray-50"
                onClick={() => handleSaveToStorage("Draft")}
              >
                Save Progress as Draft
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => handleSaveToStorage("Published")}
              >
                Publish live Package
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step Navigation Controls */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <button
          type="button"
          className="px-5 py-2.5 border border-gray-200 text-xs font-semibold rounded-xl bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-30"
          onClick={prev}
          disabled={currentStep === 0}
        >
          ◄ Back
        </button>
        <button
          type="button"
          className="px-5 py-2.5 bg-[#6C5CE7] text-white text-xs font-semibold rounded-xl hover:bg-[#5B4BC4] transition-colors disabled:opacity-30"
          onClick={next}
          disabled={currentStep === steps.length - 1}
        >
          Next Step ►
        </button>
      </div>
    </div>
  );
}
