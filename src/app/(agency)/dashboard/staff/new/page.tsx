"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import StaffForm from "@/components/agency/staff/StaffForm";
import { useStaff } from "@/hooks/useStaff";

export default function NewStaffPage() {
  const { addStaff } = useStaff();
  const [formKey, setFormKey] = useState(0);

  const handleSave = (data: Parameters<typeof addStaff>[0]) => {
    try {
      addStaff(data);
      toast.success(
        "Staff member created successfully. You can add another staff member now.",
      );
      setFormKey((current) => current + 1);
    } catch {
      toast.error("Could not create the staff member. Please try again.");
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="mb-6">
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <Link href="/dashboard">Dashboard</Link>
          <ChevronRight size={15} />
          <Link href="/dashboard/staff">Staff</Link>
          <ChevronRight size={15} />
          <strong className="text-primary-900">New staff</strong>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">Add staff</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Create a staff account and assign its role and access.
        </p>
      </div>
      <StaffForm key={formKey} onSave={handleSave} />
    </div>
  );
}
