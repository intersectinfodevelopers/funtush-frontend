"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import BranchForm from "@/components/agency/branches/BranchForm";
import { useBranchList, useBranchReport } from "@/hooks/useAgencyBranches";

const rs = (n: number | string) => `Rs. ${Number(n).toLocaleString("en-US")}`;

function Report({ id }: { id: string }) {
  const { data, isLoading, isError } = useBranchReport(id);
  if (isLoading) return <div className="h-32 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (isError || !data) return <p role="alert" className="text-sm text-danger-600">Couldn&apos;t load this branch&apos;s report.</p>;
  const stats: [string, string | number][] = [["Bookings", data.totalBookings], ["Confirmed", data.confirmedBookings], ["Inquiries", data.inquiryBookings], ["Cancelled", data.cancelledBookings], ["Customers", data.totalCustomers], ["Revenue", rs(data.totalRevenue)], ["Avg. booking", rs(Math.round(Number(data.averageBookingValue)))]];
  return (
    <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-900">Performance</h2>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">{stats.map(([k, v]) => <div key={k} className="rounded-xl bg-neutral-50 p-3"><dt className="text-xs text-neutral-500">{k}</dt><dd className="text-lg font-bold text-neutral-900">{v}</dd></div>)}</dl>
      <div><h3 className="text-sm font-semibold text-neutral-700">Top packages</h3>{data.topPackages.length === 0 ? <p className="text-sm text-neutral-500">No confirmed bookings yet.</p> : <ol className="mt-1 list-decimal pl-5 text-sm text-neutral-700">{data.topPackages.map((p) => <li key={p.packageId}>{p.title} — {p.confirmedBookings}</li>)}</ol>}</div>
    </section>
  );
}

export default function BranchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useBranchList();
  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  const branch = data?.find((b) => b.id === id);
  if (!branch) return <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm">This branch doesn&apos;t exist. <Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/branches">Back to branches</Link></div>;
  return (
    <div className="space-y-4">
      <BranchForm key={branch.id} branch={branch} />
      <div className="mx-auto w-full max-w-3xl"><Report id={branch.id} /></div>
    </div>
  );
}
