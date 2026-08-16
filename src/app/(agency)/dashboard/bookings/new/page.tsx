"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Plus, Trash2, Check, ChevronDown } from "lucide-react";

import { useBookings, NewBooking } from "@/hooks/useBooking";
import usersData from "../../../../../../data/users.json";
import packagesData from "../../../../../../data/packages.json";
import guidesData from "../../../../../../data/guides.json";

type User = { id: string; name: string };
type Package = { id: string; title: string; price?: number };
type Guide = { id: string; name: string };
type AddOn = { name: string; price: number };

const VISIBLE_ROWS = 4;
const ROW_HEIGHT = 42;

function SelectableList<T extends { id: string }>({
  items,
  selectedId,
  onSelect,
  renderLabel,
  emptyLabel,
  placeholder,
}: {
  items: T[];
  selectedId: string;
  onSelect: (id: string) => void;
  renderLabel: (item: T) => string;
  emptyLabel: string;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedItem = items.find((item) => item.id === selectedId);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
      >
        <span
          className={selectedItem ? "text-neutral-900" : "text-neutral-400"}
        >
          {selectedItem ? renderLabel(selectedItem) : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-neutral-400 transition ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
          {items.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-neutral-400">
              {emptyLabel}
            </div>
          ) : (
            <div
              className="divide-y divide-neutral-100 overflow-y-auto scrollbar-thin"
              style={{
                maxHeight:
                  items.length > VISIBLE_ROWS
                    ? VISIBLE_ROWS * ROW_HEIGHT
                    : undefined,
              }}
            >
              {items.map((item) => {
                const isSelected = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(isSelected ? "" : item.id);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition ${
                      isSelected
                        ? "bg-primary-50 font-semibold text-primary-900"
                        : "text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <span>{renderLabel(item)}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary-700" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function NewBookingPage() {
  const router = useRouter();
  const { addBooking } = useBookings();

  const trekkers = usersData as User[];
  const packages = packagesData as Package[];
  const guides = guidesData as Guide[];

  const [packageId, setPackageId] = useState("");
  const [trekkerId, setTrekkerId] = useState("");
  const [guideId, setGuideId] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [groupSize, setGroupSize] = useState(1);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const selectedPackage = useMemo(
    () => packages.find((pkg) => pkg.id === packageId),
    [packages, packageId],
  );

  const addOnsTotal = useMemo(
    () => addOns.reduce((sum, addOn) => sum + (Number(addOn.price) || 0), 0),
    [addOns],
  );

  const updateAddOn = (index: number, field: keyof AddOn, value: string) => {
    setAddOns((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: field === "price" ? Number(value) : value,
      };
      return next;
    });
  };

  const addAddOnRow = () => {
    setAddOns((prev) => [...prev, { name: "", price: 0 }]);
  };

  const removeAddOnRow = (index: number) => {
    setAddOns((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = () => {
    if (!packageId || !trekkerId || !departureDate) {
      setError("Please fill in package, trekker, and departure date.");
      return;
    }

    const cleanedAddOns = addOns.filter((addOn) => addOn.name.trim() !== "");

    const booking: NewBooking = {
      package_id: packageId,
      trekker_id: trekkerId,
      agency_id: "ag-001", // TODO: replace with real logged-in agency id
      guide_id: guideId || null,
      departure_date: departureDate,
      group_size: groupSize,
      add_ons: cleanedAddOns,
      total_price: totalPrice || addOnsTotal,
      status: "inquiry",
    };

    addBooking(booking);
    router.push("/dashboard/bookings");
  };

  return (
    <div className="mx-auto w-full max-w-6xl py-2 sm:py-4">
      <div className="mb-7 border-b border-neutral-200 pb-6">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Link href="/dashboard" className="hover:text-neutral-900">
            Dashboard
          </Link>
          <span className="text-neutral-300">/</span>
          <Link href="/dashboard/bookings" className="hover:text-neutral-900">
            Bookings
          </Link>
          <span className="text-neutral-300">/</span>
          <span className="font-semibold text-neutral-900">New booking</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">
          Create booking
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Fill in the details below to create a new booking.
        </p>
      </div>

      <div className="w-full space-y-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Package
            </label>
            <div className="mt-2">
              <SelectableList
                items={packages}
                selectedId={packageId}
                onSelect={setPackageId}
                renderLabel={(pkg) => pkg.title}
                emptyLabel="No packages available."
                placeholder="Select a package"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Trekker
            </label>
            <SelectableList
              items={trekkers}
              selectedId={trekkerId}
              onSelect={setTrekkerId}
              renderLabel={(user) => user.name}
              emptyLabel="No trekkers available."
              placeholder="Select a trekker"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Guide (optional)
            </label>
            <SelectableList
              items={guides}
              selectedId={guideId}
              onSelect={setGuideId}
              renderLabel={(guide) => guide.name}
              emptyLabel="No guides available."
              placeholder="Unassigned"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Departure date
            </label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Group size
            </label>
            <input
              type="number"
              min={1}
              value={groupSize}
              onChange={(e) => setGroupSize(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Total price (Rs.)
            </label>
            <input
              type="number"
              min={0}
              placeholder={
                selectedPackage?.price ? String(selectedPackage.price) : "0"
              }
              value={totalPrice || ""}
              onChange={(e) => setTotalPrice(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Leave blank to auto-use add-ons total (Rs.{" "}
              {addOnsTotal.toLocaleString("en-IN")}).
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-neutral-300 bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-neutral-900">Add-ons</p>
              <p className="text-xs text-neutral-500">
                Optional extras for this booking.
              </p>
            </div>
            <button
              type="button"
              onClick={addAddOnRow}
              className="inline-flex items-center gap-1 rounded-2xl bg-primary-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>

          {addOns.length === 0 ? (
            <p className="text-xs text-neutral-400">No add-ons yet.</p>
          ) : (
            <div className="space-y-3">
              {addOns.map((addOn, index) => (
                <div
                  key={index}
                  className="grid gap-3 sm:grid-cols-[1fr_140px_auto]"
                >
                  <input
                    placeholder="Add-on name"
                    value={addOn.name}
                    onChange={(e) => updateAddOn(index, "name", e.target.value)}
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Price"
                    value={addOn.price || ""}
                    onChange={(e) =>
                      updateAddOn(index, "price", e.target.value)
                    }
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                  <button
                    type="button"
                    onClick={() => removeAddOnRow(index)}
                    className="inline-flex items-center justify-center rounded-2xl border border-danger-200 bg-danger-50 px-3 text-danger-700 transition hover:bg-danger-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-danger-600">{error}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.push("/dashboard/bookings")}
            className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="min-h-11 rounded-2xl bg-primary-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-800"
          >
            Create Booking
          </button>
        </div>
      </div>
    </div>
  );
}
