"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Award, ChevronDown, Flag, MessageSquare, Star, ThumbsUp, Trash2, TrendingUp } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { useReviews } from "@/hooks/useAgencyReviews";
import { deleteReview, flagReview, respondToReview, type ApiReview, type ReviewParams } from "@/lib/api/agency/reviews";
import type { ApiError } from "@/lib/api/client";

const PAGE_SIZE = 10;
const field = "rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
const fmtLong = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const monthLabel = (m: string) => new Date(`${m}-01T00:00:00.000Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
const shortPackageId = (id: string) => `pkg-${id.slice(0, 6)}`;

function Stars({ n }: { n: number }) {
  return <span className="inline-flex" aria-label={`${n} out of 5`}>{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`h-3.5 w-3.5 ${i <= n ? "fill-warning-500 text-warning-500" : "text-neutral-300"}`} />)}</span>;
}

function StatCard({ label, value, sub, tone, icon: Icon }: { label: string; value: string | number; sub?: string; tone: "primary" | "warning" | "success" | "accent"; icon: React.ComponentType<{ className?: string }> }) {
  const bg = { primary: "bg-primary-50 text-primary-700", warning: "bg-warning-50 text-warning-600", success: "bg-success-50 text-success-700", accent: "bg-accent-50 text-accent-700" }[tone];
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">{label}</p>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}><Icon className="h-4 w-4" /></span>
      </div>
      <p className="mt-2 text-2xl font-bold text-neutral-900">{value}{sub && <span className="ml-1 text-sm font-medium text-neutral-400">{sub}</span>}</p>
    </div>
  );
}

export default function ReviewsPage() {
  const qc = useQueryClient();
  const [star, setStar] = useState("");
  const [responded, setResponded] = useState("");
  const [sort, setSort] = useState<NonNullable<ReviewParams["sort"]>>("newest");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<ApiReview | null>(null);
  const [flagging, setFlagging] = useState<ApiReview | null>(null);
  const [deleting, setDeleting] = useState<ApiReview | null>(null);
  const [text, setText] = useState("");

  const params: ReviewParams = { rating: star ? Number(star) : undefined, responded: responded === "" ? undefined : responded === "yes", sort, page, limit: PAGE_SIZE };
  const { data, isLoading, isError, isFetching } = useReviews(params);
  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };
  const refresh = () => qc.invalidateQueries({ queryKey: ["agency", "reviews"] });

  const respond = useMutation({
    mutationFn: () => respondToReview(replyTo!.id, text.trim()),
    onSuccess: () => { toast.success("Response posted"); setReplyTo(null); setText(""); void refresh(); },
    onError: (e) => toast.error((e as unknown as ApiError).message || "Couldn't post the response."),
  });
  const flag = useMutation({
    mutationFn: () => flagReview(flagging!.id, text.trim()),
    onSuccess: () => { toast.success("Flagged for moderation"); setFlagging(null); setText(""); },
    onError: (e) => toast.error((e as unknown as ApiError).message || "Couldn't flag this review."),
  });
  const remove = useMutation({
    mutationFn: () => deleteReview(deleting!.id),
    onSuccess: () => { toast.success("Review deleted"); setDeleting(null); void refresh(); },
    onError: (e) => { setDeleting(null); toast.error((e as unknown as ApiError).message || "Couldn't delete this review."); },
  });

  const total = data?.totalReviews;
  const rate = total ? Math.round(((data?.respondedCount ?? 0) / total) * 100) : 0;
  const totalPages = Math.max(1, data?.pages ?? 1);
  const distribution = data ? (["5", "4", "3", "2", "1"] as const).map((s) => ({ star: `${s} Star`, count: data.starCounts[s] })) : [];
  const trend = data ? data.monthlyTrend.map((t) => ({ label: monthLabel(t.month), rating: t.averageRating })) : [];

  return (
    <div className="space-y-4">
      <header>
        <div className="flex items-center gap-2 text-sm text-neutral-500"><Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span><span className="font-semibold text-neutral-900">Reviews</span></div>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">Reviews Overview</h1>
        <p className="mt-1 text-sm text-neutral-600">Manage, filter, and sort your package reviews alongside historical metrics.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Average Rating" value={data ? data.averageRating.toFixed(1) : "—"} sub="/ 5.0" tone="warning" icon={Star} />
        <StatCard label="Total Reviews" value={total ?? "—"} tone="primary" icon={MessageSquare} />
        <StatCard label="Response Rate" value={data ? `${rate}%` : "—"} tone="success" icon={ThumbsUp} />
        <StatCard label="5-Star Reviews" value={data ? data.starCounts["5"] : "—"} tone="accent" icon={Award} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-neutral-900"><Star className="h-4 w-4 text-warning-500" /> Rating Distribution</h2>
          <div className="mt-3 h-56">
            {data && data.totalReviews > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="star" tick={{ fontSize: 12 }} width={48} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#fafafa" }} contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e5e5e5" }} />
                  <Bar dataKey="count" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={16} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="flex h-full items-center justify-center text-sm text-neutral-400">No reviews yet.</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-neutral-900"><TrendingUp className="h-4 w-4 text-primary-700" /> 6-Month Rating Trend</h2>
          <div className="mt-3 h-56">
            {data ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 4, right: 12, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[1, 5]} allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e5e5e5" }} formatter={(v) => (v === null ? "No reviews" : v)} />
                  <Line type="monotone" dataKey="rating" stroke="#0369A1" strokeWidth={2} dot={{ r: 4, fill: "#0369A1" }} connectNulls={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="h-full animate-pulse rounded-xl bg-neutral-100" />}
          </div>
        </section>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <select aria-label="Filter by rating" value={star} onChange={(e) => reset(setStar)(e.target.value)} className={field}><option value="">All Star Ratings</option>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}</select>
        <select aria-label="Filter by response" value={responded} onChange={(e) => reset(setResponded)(e.target.value)} className={field}><option value="">All Statuses</option><option value="no">Waiting for a reply</option><option value="yes">Replied</option></select>
        <select aria-label="Sort reviews" value={sort} onChange={(e) => reset(setSort)(e.target.value as typeof sort)} className={`${field} sm:ml-auto sm:w-48`}><option value="newest">Newest First</option><option value="oldest">Oldest First</option><option value="lowest">Lowest rating</option><option value="highest">Highest rating</option></select>
      </div>

      {isError && <p role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load reviews. Please try again.</p>}

      <div className={`overflow-hidden rounded-2xl border border-neutral-200 bg-white ${isFetching && !isLoading ? "opacity-70" : ""}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-neutral-50 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
              <tr><th className="px-4 py-3">Trekker Name</th><th className="px-4 py-3">Package</th><th className="px-4 py-3">Star Rating</th><th className="px-4 py-3">Review Details</th><th className="px-4 py-3">Date</th><th className="w-8 px-4 py-3" /></tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 4 }).map((_, i) => <tr key={i} className="border-t border-neutral-200"><td colSpan={6} className="px-4 py-5"><div className="h-4 animate-pulse rounded bg-neutral-100" /></td></tr>)}
              {data && data.reviews.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-neutral-500">{star || responded ? "No reviews match this filter." : "No reviews yet. They appear after travellers complete a trek and leave feedback."}</td></tr>}
              {(data?.reviews ?? []).map((r) => {
                const isOpen = expanded === r.id;
                return (
                  <Fragment key={r.id}>
                    <tr onClick={() => setExpanded(isOpen ? null : r.id)} className="cursor-pointer border-t border-neutral-200 hover:bg-neutral-50/60">
                      <td className="px-4 py-3.5 font-bold text-neutral-900">{r.trekker.fullName ?? "Traveller"}</td>
                      <td className="px-4 py-3.5"><span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600">{r.booking?.package ? shortPackageId(r.booking.package.id) : "—"}</span></td>
                      <td className="px-4 py-3.5"><div className="flex items-center gap-1.5"><Stars n={r.rating} /><span className="font-semibold text-neutral-900">{r.rating.toFixed(1)}</span></div></td>
                      <td className="max-w-md px-4 py-3.5">
                        {r.title && <p className="truncate font-semibold text-neutral-900">{r.title}</p>}
                        <p className="truncate text-xs text-neutral-500">{r.text}</p>
                      </td>
                      <td className="px-4 py-3.5 text-neutral-500">{fmtDate(r.createdAt)}</td>
                      <td className="px-4 py-3.5"><ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}`} /></td>
                    </tr>
                    {isOpen && (
                      <tr className="border-t border-neutral-100 bg-neutral-50/50">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="flex items-center gap-2 text-xs text-neutral-500">{r.verified && <span className="rounded-full bg-success-50 px-2 py-0.5 font-semibold text-success-700">verified</span>}{fmtLong(r.createdAt)}</div>
                          <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-800">{r.text}</p>
                          {r.photos.length > 0 && <div className="mt-2 flex gap-2">{r.photos.map((u) => /* eslint-disable-next-line @next/next/no-img-element */ <img key={u} src={u} alt="" className="h-16 w-16 rounded-lg object-cover" />)}</div>}
                          {r.response && <div className="mt-3 rounded-xl bg-primary-50 p-3 text-sm"><p className="text-xs font-semibold text-primary-800">Your reply · {fmtLong(r.response.respondedAt)}</p><p className="mt-1 whitespace-pre-wrap text-neutral-800">{r.response.responseText}</p></div>}
                          <div className="mt-3 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                            {!r.response && <button type="button" onClick={() => { setReplyTo(r); setText(""); }} className="rounded-full bg-primary-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-800">Reply</button>}
                            <button type="button" onClick={() => { setFlagging(r); setText(""); }} className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"><Flag className="h-3.5 w-3.5" /> Flag</button>
                            <button type="button" onClick={() => setDeleting(r)} className="inline-flex items-center gap-1 rounded-full border border-danger-200 bg-danger-50 px-3 py-1.5 text-xs font-semibold text-danger-700 hover:bg-danger-100"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination currentPage={Math.min(page, totalPages)} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={replyTo !== null} onClose={() => setReplyTo(null)} title="Reply publicly" size="md">
        <div className="space-y-3 p-4"><p className="text-sm text-neutral-600">Your reply appears under the review. You can reply only once, so keep it kind and factual.</p><textarea aria-label="Reply" rows={4} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-400" /><div className="flex justify-end gap-2"><button type="button" onClick={() => setReplyTo(null)} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Cancel</button><button type="button" disabled={respond.isPending || !text.trim()} onClick={() => respond.mutate()} className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{respond.isPending ? "Posting…" : "Post reply"}</button></div></div>
      </Modal>
      <Modal isOpen={flagging !== null} onClose={() => setFlagging(null)} title="Flag this review" size="md">
        <div className="space-y-3 p-4"><p className="text-sm text-neutral-600">Tell Funtush why this review breaks the rules (fake, abusive, unrelated…). It stays visible until a moderator decides.</p><textarea aria-label="Reason" rows={3} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-400" /><div className="flex justify-end gap-2"><button type="button" onClick={() => setFlagging(null)} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Cancel</button><button type="button" disabled={flag.isPending || !text.trim()} onClick={() => flag.mutate()} className="rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50">{flag.isPending ? "Sending…" : "Flag review"}</button></div></div>
      </Modal>
      <Modal isOpen={deleting !== null} onClose={() => setDeleting(null)} title="Delete this review?" size="sm">
        <div className="space-y-4 p-4">
          <p className="text-sm text-neutral-600">&ldquo;{deleting?.title || deleting?.text.slice(0, 60)}&rdquo; is removed for good, along with any reply. This can&apos;t be undone.</p>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setDeleting(null)} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Cancel</button><button type="button" disabled={remove.isPending} onClick={() => remove.mutate()} className="rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50">{remove.isPending ? "Deleting…" : "Delete"}</button></div>
        </div>
      </Modal>
    </div>
  );
}
