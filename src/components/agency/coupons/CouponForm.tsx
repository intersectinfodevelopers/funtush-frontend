"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Ticket } from "lucide-react";

import { usePackageList } from "@/hooks/useAgencyPackages";
import { createCoupon, updateCoupon, type Coupon, type DiscountType } from "@/lib/api/agency/coupons";
import type { ApiError } from "@/lib/api/client";

const field = "mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const label = "block text-sm font-semibold text-neutral-800";
const Req = () => <span className="ml-0.5 text-danger-600" aria-hidden="true">*</span>;
const day = (d: Date | string) => new Date(d).toISOString().slice(0, 10);
const plus = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return day(d); };

export function CouponForm({ existing }: { existing?: Coupon }) {
  const router = useRouter();
  const qc = useQueryClient();
  const editing = Boolean(existing);
  const packages = usePackageList({ limit: 100 });
  const [code, setCode] = useState(existing?.code ?? "");
  const [type, setType] = useState<DiscountType>(existing?.discountType ?? "PERCENTAGE");
  const [value, setValue] = useState(existing ? String(existing.discountValue) : "");
  const [minBooking, setMinBooking] = useState(existing?.minBookingValue != null ? String(existing.minBookingValue) : "");
  const [minGroup, setMinGroup] = useState(existing?.minGroupSize != null ? String(existing.minGroupSize) : "");
  const [maxUses, setMaxUses] = useState(existing ? String(existing.maxRedemptions) : "100");
  const [from, setFrom] = useState(existing ? day(existing.validFrom) : plus(0));
  const [until, setUntil] = useState(existing ? day(existing.validUntil) : plus(30));
  const [firstTime, setFirstTime] = useState(existing?.firstTimeTrekkerOnly ?? false);
  const [pkgs, setPkgs] = useState<string[]>(existing?.applicablePackages ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => {
      const body = {
        code: code.trim().toUpperCase(), discountType: type, discountValue: Number(value), applicablePackages: pkgs,
        minBookingValue: minBooking.trim() === "" ? null : Number(minBooking), minGroupSize: minGroup.trim() === "" ? null : Number(minGroup),
        maxRedemptions: Number(maxUses), validFrom: from, validUntil: until, firstTimeTrekkerOnly: firstTime,
      };
      return existing ? updateCoupon(existing.id, body) : createCoupon(body);
    },
    onSuccess: () => { toast.success(existing ? "Coupon saved" : "Coupon created"); void qc.invalidateQueries({ queryKey: ["agency", "coupons"] }); router.push("/dashboard/coupons"); },
    onError: (e) => {
      const err = e as unknown as ApiError;
      setSummary(err.message || "Couldn't save the coupon.");
      toast.error(err.message || "Couldn't save the coupon.", { duration: 6000 });
    },
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const found: Record<string, string> = {};
    const c = code.trim().toUpperCase();
    if (!c) found.code = "Coupon code is required.";
    else if (!/^[A-Z0-9_-]{3,30}$/.test(c)) found.code = "Use 3–30 letters, numbers, hyphens or underscores.";
    const v = Number(value);
    if (value.trim() === "" || !Number.isFinite(v) || v <= 0) found.value = "Discount value must be greater than 0.";
    else if (type === "PERCENTAGE" && v > 100) found.value = "A percentage discount can't exceed 100%.";
    if (!Number.isInteger(Number(maxUses)) || Number(maxUses) < 1) found.maxUses = "Max uses must be a whole number, 1 or more.";
    if (minGroup.trim() !== "" && (!Number.isInteger(Number(minGroup)) || Number(minGroup) < 1)) found.minGroup = "Must be a whole number, 1 or more.";
    if (minBooking.trim() !== "" && !(Number(minBooking) >= 0)) found.minBooking = "Can't be negative.";
    if (!from || !until || from >= until) found.until = "Valid until must be after valid from.";
    setErrors(found);
    if (Object.keys(found).length) {
      setSummary(`Please fix ${Object.keys(found).length === 1 ? "the highlighted field" : "the highlighted fields"} and try again.`);
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setSummary(null);
    save.mutate();
  }

  const toggle = (id: string) => setPkgs((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const E = (k: string) => (errors[k] ? <p role="alert" className="mt-1 text-xs text-danger-600">{errors[k]}</p> : null);
  const bad = (k: string) => (errors[k] ? " border-danger-500" : "");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 py-2 sm:py-4">
      <div className="border-b border-neutral-200 pb-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-neutral-500">
          <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span>
          <Link href="/dashboard/coupons" className="hover:text-neutral-900">Coupons</Link><span className="text-neutral-300">/</span>
          <span className="font-semibold text-neutral-900">{editing ? "Edit" : "New coupon"}</span>
        </nav>
        <div className="mt-2 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><Ticket className="h-5 w-5" /></span>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{editing ? "Edit Coupon" : "New Coupon"}</h1>
            <p className="mt-0.5 text-sm text-neutral-500">{editing ? "Update this coupon's discount and rules." : "Create a discount code trekkers can apply to a booking inquiry."}</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} noValidate className="border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="cc" className={label}>Code<Req /></label>
                <input id="cc" aria-invalid={Boolean(errors.code)} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={30} placeholder="e.g. TREK20" className={`${field} font-mono${bad("code")}`} />
                {E("code")}
              </div>
              <div>
                <label htmlFor="ct" className={label}>Discount type</label>
                <select id="ct" value={type} onChange={(e) => setType(e.target.value as DiscountType)} className={field}>
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed amount</option>
                </select>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="cv" className={label}>Discount value{type === "PERCENTAGE" ? " (%)" : ""}<Req /></label>
                <input id="cv" type="number" min={0} aria-invalid={Boolean(errors.value)} value={value} onChange={(e) => setValue(e.target.value)} className={`${field}${bad("value")}`} />
                {E("value")}
              </div>
              <div>
                <label htmlFor="cb" className={label}>Minimum booking value</label>
                <input id="cb" type="number" min={0} aria-invalid={Boolean(errors.minBooking)} value={minBooking} onChange={(e) => setMinBooking(e.target.value)} placeholder="Optional" className={`${field}${bad("minBooking")}`} />
                {E("minBooking")}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="cf" className={label}>Valid from</label>
                <input id="cf" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={field} />
              </div>
              <div>
                <label htmlFor="cu" className={label}>Valid until</label>
                <input id="cu" type="date" aria-invalid={Boolean(errors.until)} value={until} onChange={(e) => setUntil(e.target.value)} className={`${field}${bad("until")}`} />
                {E("until")}
              </div>
            </div>

            <div>
              <label htmlFor="cg" className={label}>Minimum group size</label>
              <input id="cg" type="number" min={1} aria-invalid={Boolean(errors.minGroup)} value={minGroup} onChange={(e) => setMinGroup(e.target.value)} placeholder="Optional" className={`${field} sm:w-1/2${bad("minGroup")}`} />
              {E("minGroup")}
            </div>

            <div>
              <p className={label}>Applies to</p>
              <p className="mt-0.5 text-xs text-neutral-500">Leave everything unchecked to apply to all packages.</p>
              <div className="mt-2 grid max-h-48 gap-1.5 overflow-y-auto rounded-xl border border-neutral-200 p-3 sm:grid-cols-2">
                {packages.isLoading && <p className="text-sm text-neutral-400">Loading packages…</p>}
                {!packages.isLoading && (packages.data?.data ?? []).length === 0 && <p className="text-sm text-neutral-400">No packages yet.</p>}
                {(packages.data?.data ?? []).map((p) => (
                  <label key={p.id} className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm hover:bg-neutral-50">
                    <input type="checkbox" checked={pkgs.includes(p.id)} onChange={() => toggle(p.id)} className="h-4 w-4 rounded border-neutral-300 text-primary-900 focus:ring-primary-400" /> {p.title}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5 lg:border-l lg:border-neutral-100 lg:pl-8">
            <h2 className="text-base font-bold text-neutral-900">Publish Settings</h2>
            <div>
              <label htmlFor="cm" className={label}>Max uses<Req /></label>
              <input id="cm" type="number" min={1} aria-invalid={Boolean(errors.maxUses)} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} className={`${field}${bad("maxUses")}`} />
              {E("maxUses")}
              {existing && <p className="mt-1 text-xs text-neutral-500">{existing.redemptionsUsed} used so far.</p>}
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <div>
                <span className="text-sm font-semibold text-neutral-800">First-timers only</span>
                <p className="text-xs text-neutral-500">Restrict to trekkers with no prior bookings.</p>
              </div>
              <button type="button" role="switch" aria-checked={firstTime} aria-label="First-time trekkers only" onClick={() => setFirstTime((v) => !v)} className={`flex h-6 w-12 shrink-0 items-center rounded-full p-0.5 transition ${firstTime ? "bg-primary-900" : "bg-neutral-300"}`}>
                <span className={`h-5 w-5 rounded-full bg-white shadow transition ${firstTime ? "translate-x-6" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {summary && <p role="alert" className="mt-6 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">{summary}</p>}

        <div className="mt-6 flex justify-end gap-3 border-t border-neutral-100 pt-5">
          <Link href="/dashboard/coupons" className="rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">Cancel</Link>
          <button type="submit" disabled={save.isPending} className="rounded-full bg-primary-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{save.isPending ? "Saving…" : editing ? "Save changes" : "Create coupon"}</button>
        </div>
      </form>
    </div>
  );
}
