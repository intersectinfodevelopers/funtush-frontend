"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Modal } from "@/components/ui/modal";
import { deleteCustomer, updateCustomer } from "@/lib/api/agency/customers";
import type { ApiError } from "@/lib/api/client";

/** What the modals need to know about a customer. */
export interface CustomerLike {
  trekkerId: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
}

const FIELDS = [
  ["fullName", "Name", "cu-name", "text"],
  ["email", "Email", "cu-email", "email"],
  ["phone", "Phone", "cu-phone", "tel"],
  ["country", "Country", "cu-country", "text"],
] as const;

function useRefreshCustomers() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ["agency", "customers"] });
    void qc.invalidateQueries({ queryKey: ["agency", "customer"] });
  };
}

/** Edit how THIS agency sees a customer: name, email, phone, country. The traveller's own account is not changed. */
export function EditCustomerModal({ customer, onClose }: { customer: CustomerLike | null; onClose: () => void }) {
  return (
    <Modal isOpen={customer !== null} onClose={onClose} title="Edit customer" size="sm">
      {customer && <EditForm key={customer.trekkerId} customer={customer} onClose={onClose} />}
    </Modal>
  );
}

function EditForm({ customer, onClose }: { customer: CustomerLike; onClose: () => void }) {
  const refresh = useRefreshCustomers();
  const [form, setForm] = useState({ fullName: customer.fullName ?? "", email: customer.email ?? "", phone: customer.phone ?? "", country: customer.country ?? "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const save = useMutation({
    mutationFn: () => updateCustomer(customer.trekkerId, form),
    onSuccess: () => { toast.success(`“${form.fullName.trim() || customer.fullName || "Customer"}” was updated`); onClose(); refresh(); },
    onError: (e) => { const err = e as unknown as ApiError; setErrors(err.fields ?? {}); toast.error(err.message || "Couldn't save the changes."); },
  });
  return (
    <form className="space-y-3 p-4" noValidate onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
      <p className="text-xs text-neutral-500">This changes how <strong>your agency</strong> sees this customer. Their own account and your bookings are not changed. Clear a field to bring back the original.</p>
      {FIELDS.map(([k, label, id, type]) => (
        <div key={k}>
          <label htmlFor={id} className="block text-xs font-semibold text-neutral-700">{label}</label>
          <input id={id} type={type} value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} aria-invalid={Boolean(errors[k])} className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-100 ${errors[k] ? "border-danger-500" : "border-neutral-200 focus:border-primary-400"}`} />
          {errors[k] && <p role="alert" className="mt-1 text-xs text-danger-600">{errors[k]}</p>}
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onClose} className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">Cancel</button>
        <button type="submit" disabled={save.isPending} className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{save.isPending ? "Saving…" : "Save changes"}</button>
      </div>
    </form>
  );
}

/** Remove a customer from THIS agency's list (bookings and the traveller's account are kept). */
export function RemoveCustomerModal({ customer, onClose, onRemoved }: { customer: CustomerLike | null; onClose: () => void; onRemoved?: () => void }) {
  const refresh = useRefreshCustomers();
  const remove = useMutation({
    mutationFn: () => deleteCustomer(customer!.trekkerId),
    onSuccess: () => { toast.success(`“${customer?.fullName ?? customer?.email ?? "Customer"}” was removed from your customers`); onClose(); refresh(); onRemoved?.(); },
    onError: (e) => { onClose(); toast.error((e as unknown as ApiError).message || "Couldn't remove the customer."); },
  });
  return (
    <Modal isOpen={customer !== null} onClose={onClose} title="Remove this customer?" size="sm">
      {customer && (
        <div className="space-y-4 p-4">
          <p className="text-sm leading-6 text-neutral-600">“{customer.fullName ?? customer.email}” is removed from your customers list. Their bookings and their account are <strong>not</strong> deleted, and they come back if they book again.</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">Cancel</button>
            <button type="button" disabled={remove.isPending} onClick={() => remove.mutate()} className="rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50">{remove.isPending ? "Removing…" : "Remove"}</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
