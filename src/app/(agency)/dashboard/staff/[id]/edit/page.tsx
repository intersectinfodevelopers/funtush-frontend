"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import StaffForm from "@/components/agency/staff/StaffForm";
import { useStaff } from "@/hooks/useStaff";

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { getStaff, updateStaff } = useStaff();

  const staff = getStaff(params.id);

  if (!staff) {
    return (
      <div className="mx-auto w-full max-w-6xl py-6">
        <p className="text-sm text-neutral-600">Staff member not found.</p>
      </div>
    );
  }

  const handleSave = (data: { name: string; email: string; phone: string; role: string }) => {
    try {
      updateStaff(params.id, {
        ...data,
        active: staff.active,
      });
      toast.success("Staff updated successfully.");
      router.push("/dashboard/staff");
    } catch {
      toast.error("Could not update the staff member. Please try again.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl py-2 sm:py-4">
      <div className="mb-7 flex flex-col gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Link href="/dashboard">Dashboard</Link>
            <ChevronRight size={15} />
            <Link href="/dashboard/staff" className="transition hover:text-primary-700">
              Staff
            </Link>
            <ChevronRight size={15} />
            <span className="font-semibold text-primary-900">Edit staff</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">Update staff</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Update the staff member details and assigned role.
          </p>
        </div>
      </div>

      <StaffForm
        initialData={{
          name: staff.name,
          email: staff.email,
          phone: staff.phone,
          role: staff.role,
        }}
        isNew={false}
        onSave={handleSave}
      />
    </div>
  );
}
