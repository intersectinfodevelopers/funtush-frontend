"use client";

import { discountedPerPerson } from "@/lib/pricing";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useMoney } from "@/hooks/useAgencyDashboard";
import { usePackageDetail, usePackageList } from "@/hooks/useAgencyPackages";
import { createManualBooking } from "@/lib/api/agency/bookings";
import { seatsLeft } from "@/lib/api/agency/packages";
import type { ApiError } from "@/lib/api/client";

const field =
  "mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const label = "block text-sm font-medium text-neutral-700";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function NewBookingPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const money = useMoney();

  const [packageId, setPackageId] = useState("");
  const [departureDateId, setDepartureDateId] = useState("");
  const [groupSize, setGroupSize] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [requests, setRequests] = useState("");
  const [status, setStatus] = useState<"CONFIRMED" | "INQUIRY">("CONFIRMED");
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Only published packages can take bookings.
  const packages = usePackageList({ status: "PUBLISHED", limit: 100 });
  const detail = usePackageDetail(packageId);
  const pkg = detail.data;

  const today = new Date().setHours(0, 0, 0, 0);
  const departures = useMemo(
    () => (pkg?.departureDates ?? []).filter((d) => new Date(d.startDate).getTime() >= today),
    [pkg, today],
  );
  const departure = departures.find((d) => d.id === departureDateId);
  const maxGroup = departure ? Math.min(seatsLeft(departure), pkg?.maxGroupSize ?? 1) : pkg?.maxGroupSize ?? 1;

  // Same arithmetic the API applies, shown as an estimate (the server's figure is the real one).
  const estimate = useMemo(() => {
    if (!pkg) return 0;
    const extras = (pkg.addOns ?? []).filter((a) => addOnIds.includes(a.id)).reduce((sum, a) => sum + Number(a.price) * (a.perPerson ? groupSize : 1), 0);
    return discountedPerPerson(Number(pkg.pricePerPerson), pkg.volumeDiscounts, groupSize) * groupSize + extras;
  }, [pkg, groupSize, addOnIds]);

  const create = useMutation({
    mutationFn: () =>
      createManualBooking({
        packageId,
        departureDateId,
        groupSize,
        trekkerName: name.trim(),
        trekkerEmail: email.trim(),
        trekkerPhone: phone.trim(),
        trekkerCountry: country.trim() || undefined,
        specialRequests: requests.trim() || undefined,
        addOnIds: addOnIds.length ? addOnIds : undefined,
        status,
      }),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ["agency", "bookings"] });
      void qc.invalidateQueries({ queryKey: ["agency", "summary"] });
      void qc.invalidateQueries({ queryKey: ["agency", "package", packageId] });
      toast.success("Booking created");
      router.push(`/dashboard/bookings/${res.id}`);
    },
    onError: (e) => setError((e as unknown as ApiError).message || "Couldn't create the booking."),
  });

  function submit() {
    setError(null);
    if (!packageId || !departureDateId) return setError("Choose a package and a departure date.");
    if (!name.trim() || !email.trim() || !phone.trim()) return setError("Traveller name, email and phone are required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address.");
    if (!Number.isInteger(groupSize) || groupSize < 1 || groupSize > maxGroup) return setError(`Group size must be between 1 and ${maxGroup}.`);
    create.mutate();
  }

  const list = packages.data?.data ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl py-2 sm:py-4">
      <div className="mb-7 border-b border-neutral-200 pb-6">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link>
          <span className="text-neutral-300">/</span>
          <Link href="/dashboard/bookings" className="hover:text-neutral-900">Bookings</Link>
          <span className="text-neutral-300">/</span>
          <span className="font-semibold text-neutral-900">New booking</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">Create booking</h1>
        <p className="mt-1 text-sm text-neutral-600">For phone and walk-in customers. It skips the email verification the public site uses.</p>
      </div>

      <div className="w-full space-y-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <label className={label} htmlFor="pkg">Package</label>
            <select
              id="pkg"
              value={packageId}
              onChange={(e) => {
                setPackageId(e.target.value);
                setDepartureDateId("");
                setAddOnIds([]);
                setGroupSize(1);
              }}
              className={field}
            >
              <option value="">{packages.isLoading ? "Loading…" : list.length ? "Select a package" : "No published packages"}</option>
              {list.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={label} htmlFor="dep">Departure date</label>
            <select id="dep" value={departureDateId} onChange={(e) => setDepartureDateId(e.target.value)} disabled={!pkg} className={field}>
              <option value="">{!pkg ? "Choose a package first" : departures.length ? "Select a departure" : "No upcoming departures"}</option>
              {departures.map((d) => (
                <option key={d.id} value={d.id} disabled={seatsLeft(d) === 0}>
                  {fmt(d.startDate)} — {seatsLeft(d) === 0 ? "full" : `${seatsLeft(d)} seats left`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={label} htmlFor="size">Group size</label>
            <input id="size" type="number" min={1} max={maxGroup} value={groupSize} onChange={(e) => setGroupSize(Number(e.target.value))} className={field} />
            {departure && <p className="mt-1 text-xs text-neutral-500">Up to {maxGroup} on this departure.</p>}
          </div>

          <div><label className={label} htmlFor="tname">Traveller name</label><input id="tname" value={name} onChange={(e) => setName(e.target.value)} className={field} /></div>
          <div><label className={label} htmlFor="temail">Email</label><input id="temail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} /></div>
          <div><label className={label} htmlFor="tphone">Phone</label><input id="tphone" value={phone} onChange={(e) => setPhone(e.target.value)} className={field} /></div>
          <div><label className={label} htmlFor="tcountry">Country (optional)</label><input id="tcountry" value={country} onChange={(e) => setCountry(e.target.value)} className={field} /></div>

          <div className="lg:col-span-2">
            <label className={label} htmlFor="req">Special requests (optional)</label>
            <textarea id="req" rows={2} value={requests} onChange={(e) => setRequests(e.target.value)} className={field} />
          </div>
        </div>

        {(pkg?.addOns.length ?? 0) > 0 && (
          <fieldset className="space-y-2 rounded-xl border border-neutral-300 bg-neutral-50 p-5">
            <legend className="px-1 text-sm font-semibold text-neutral-900">Add-ons</legend>
            {pkg!.addOns.map((a) => (
              <label key={a.id} className="flex items-center justify-between gap-3 text-sm text-neutral-800">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={addOnIds.includes(a.id)}
                    onChange={(e) => setAddOnIds((cur) => (e.target.checked ? [...cur, a.id] : cur.filter((x) => x !== a.id)))}
                  />
                  {a.name}
                </span>
                <span className="text-neutral-500">{money(Number(a.price), pkg?.currency)}{a.perPerson ? " / person" : ""}</span>
              </label>
            ))}
          </fieldset>
        )}

        <fieldset className="flex flex-wrap items-center gap-6 text-sm">
          <legend className="mb-1 font-medium text-neutral-700">Create as</legend>
          <label className="flex items-center gap-2"><input type="radio" name="st" checked={status === "CONFIRMED"} onChange={() => setStatus("CONFIRMED")} /> Confirmed (reserves the seats now)</label>
          <label className="flex items-center gap-2"><input type="radio" name="st" checked={status === "INQUIRY"} onChange={() => setStatus("INQUIRY")} /> Inquiry (accept it later)</label>
        </fieldset>

        {pkg && (
          <p className="rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-900">
            Estimated total: <strong>{money(estimate, pkg.currency)}</strong> <span className="text-primary-700">({money(discountedPerPerson(Number(pkg.pricePerPerson), pkg.volumeDiscounts, groupSize), pkg.currency)} × {groupSize}{addOnIds.length ? " + add-ons" : ""})</span>
          </p>
        )}

        {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => router.push("/dashboard/bookings")} className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50">Cancel</button>
          <button type="button" onClick={submit} disabled={create.isPending} className="min-h-11 rounded-2xl bg-primary-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:opacity-50">
            {create.isPending ? "Creating…" : "Create Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
