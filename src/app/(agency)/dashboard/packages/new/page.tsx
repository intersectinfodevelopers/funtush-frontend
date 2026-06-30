"use client";

import { useState } from "react";

// Step 1 interface
interface BasicInfo {
  title: string;
  destination: string;
  difficulty: string;
  duration: string;
  maxGroupSize: string;
  shortDesc: string;
  fullDesc: string;
}

// Step 2 interface
interface ItineraryDay {
  day: number;
  location: string;
  desc: string;
  altitude: string;
  photo: string;
}

// Step 3 interface
interface DateSlot {
  date: string;
  slots: number;
}

export default function PackageBuilderPage() {
  const steps = [
    "Basic Info",
    "Itinerary",
    "Dates",
    "Pricing",
    "Media",
    "Add-Ons",
    "Review",
  ];
  const [currentStep, setCurrentStep] = useState(0);

  // Step 1 state
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    title: "",
    destination: "",
    difficulty: "",
    duration: "",
    maxGroupSize: "",
    shortDesc: "",
    fullDesc: "",
  });

  // Step 2 state
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);

  // Step 3 state
  const [dates, setDates] = useState<DateSlot[]>([]);

  return (
    <div className="p-6">
      {/* Progress Bar */}
      <div className="flex space-x-4 mb-6">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`px-3 py-1 rounded ${
              idx === currentStep ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {currentStep === 0 && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={basicInfo.title}
            onChange={(e) =>
              setBasicInfo({ ...basicInfo, title: e.target.value })
            }
            className="border p-2 w-full"
          />
          <select
            value={basicInfo.destination}
            onChange={(e) =>
              setBasicInfo({ ...basicInfo, destination: e.target.value })
            }
            className="border p-2 w-full"
          >
            <option value="">Select Destination</option>
            <option value="Everest">Everest</option>
            <option value="Annapurna">Annapurna</option>
          </select>
          <div className="flex space-x-4">
            {["Easy", "Moderate", "Strenuous", "Extreme"].map((level) => (
              <label key={level}>
                <input
                  type="radio"
                  name="difficulty"
                  value={level}
                  checked={basicInfo.difficulty === level}
                  onChange={(e) =>
                    setBasicInfo({ ...basicInfo, difficulty: e.target.value })
                  }
                />
                {level}
              </label>
            ))}
          </div>
          <input
            type="number"
            placeholder="Duration (days)"
            value={basicInfo.duration}
            onChange={(e) =>
              setBasicInfo({ ...basicInfo, duration: e.target.value })
            }
            className="border p-2 w-full"
          />
          <input
            type="number"
            placeholder="Max group size"
            value={basicInfo.maxGroupSize}
            onChange={(e) =>
              setBasicInfo({ ...basicInfo, maxGroupSize: e.target.value })
            }
            className="border p-2 w-full"
          />
          <textarea
            placeholder="Short description"
            value={basicInfo.shortDesc}
            onChange={(e) =>
              setBasicInfo({ ...basicInfo, shortDesc: e.target.value })
            }
            className="border p-2 w-full"
          />
          <textarea
            placeholder="Full description"
            value={basicInfo.fullDesc}
            onChange={(e) =>
              setBasicInfo({ ...basicInfo, fullDesc: e.target.value })
            }
            className="border p-2 w-full"
          />
        </div>
      )}

      {/* Step 2: Itinerary Builder */}
      {currentStep === 1 && (
        <div>
          <button
            onClick={() =>
              setItinerary([
                ...itinerary,
                {
                  day: itinerary.length + 1,
                  location: "",
                  desc: "",
                  altitude: "",
                  photo: "",
                },
              ])
            }
            className="bg-green-500 text-white px-4 py-2 mb-4"
          >
            Add Day
          </button>
          {itinerary.map((day, idx) => (
            <div key={idx} className="border p-4 mb-2">
              <h3>Day {day.day}</h3>
              <input
                type="text"
                placeholder="Location"
                value={day.location}
                onChange={(e) => {
                  const updated = [...itinerary];
                  updated[idx].location = e.target.value;
                  setItinerary(updated);
                }}
                className="border p-2 w-full"
              />
              <textarea
                placeholder="Description"
                value={day.desc}
                onChange={(e) => {
                  const updated = [...itinerary];
                  updated[idx].desc = e.target.value;
                  setItinerary(updated);
                }}
                className="border p-2 w-full"
              />
              <input
                type="number"
                placeholder="Altitude"
                value={day.altitude}
                onChange={(e) => {
                  const updated = [...itinerary];
                  updated[idx].altitude = e.target.value;
                  setItinerary(updated);
                }}
                className="border p-2 w-full"
              />
              <input
                type="file"
                onChange={(e) => {
                  const updated = [...itinerary];
                  updated[idx].photo = e.target.files?.[0]?.name || "";
                  setItinerary(updated);
                }}
              />
              <button
                onClick={() => {
                  const updated = itinerary.filter((_, i) => i !== idx);
                  setItinerary(updated);
                }}
                className="bg-red-500 text-white px-2 py-1 mt-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Step 3: Dates */}
      {currentStep === 2 && (
        <div>
          <button
            onClick={() =>
              setDates([
                ...dates,
                { date: new Date().toLocaleDateString(), slots: 10 },
              ])
            }
            className="bg-blue-500 text-white px-4 py-2 mb-4"
          >
            Add Date
          </button>
          {dates.map((d, idx) => (
            <div key={idx} className="border p-4 mb-2 flex justify-between">
              <span>{d.date}</span>
              <span className="bg-green-200 px-2 py-1 rounded">Available</span>
              <input
                type="number"
                value={d.slots}
                onChange={(e) => {
                  const updated = [...dates];
                  updated[idx].slots = Number(e.target.value);
                  setDates(updated);
                }}
                className="border p-2 w-20"
              />
              <button
                onClick={() => {
                  const updated = dates.filter((_, i) => i !== idx);
                  setDates(updated);
                }}
                className="bg-red-500 text-white px-2 py-1"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex space-x-4 mt-6">
        {currentStep > 0 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="bg-gray-500 text-white px-4 py-2"
          >
            Back
          </button>
        )}
        {currentStep < steps.length - 1 && (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="bg-blue-500 text-white px-4 py-2"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
