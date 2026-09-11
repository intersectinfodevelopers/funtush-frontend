"use client";

/**
 * Reviews — treks awaiting your review, and the reviews you've written.
 * Submissions are kept in localStorage (mock).
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Star, PenLine, CheckCircle2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";
import { getUserTreks } from "@/lib/treks";
import {
  HubHeader,
  HubSection,
  EmptyState,
  TextArea,
  Field,
  hubToast,
} from "@/components/trekker/trekker-kit";
import type { RawBooking, RawPackage, RawAgency, RawGuide } from "@/types/trek";

import bookingsData from "../../../../data/bookings.json";
import packagesData from "../../../../data/packages.json";
import agenciesData from "../../../../data/agencies.json";
import guidesData from "../../../../data/guides.json";

const bookings = bookingsData as RawBooking[];
const packages = packagesData as unknown as RawPackage[];
const agencies = agenciesData as RawAgency[];
const guides = guidesData as RawGuide[];

const STORE = "trekkerReviews";

type MyReview = { bookingId: string; rating: number; text: string; createdAt: string };

function readReviews(): MyReview[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORE) || "[]") as MyReview[];
  } catch {
    return [];
  }
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const [myReviews, setMyReviews] = useState<MyReview[]>(readReviews);
  const [draft, setDraft] = useState<{ bookingId: string; rating: number; text: string } | null>(null);

  const completed = useMemo(
    () => (user ? getUserTreks(user.id, bookings, packages, agencies, guides).filter((t) => t.category === "completed") : []),
    [user],
  );

  const reviewedIds = new Set(myReviews.map((r) => r.bookingId));
  const awaiting = completed.filter((t) => !reviewedIds.has(t.bookingId));

  const submit = () => {
    if (!draft || draft.rating === 0 || draft.text.trim().length < 10) return;
    const next: MyReview[] = [
      { bookingId: draft.bookingId, rating: draft.rating, text: draft.text.trim(), createdAt: new Date().toISOString() },
      ...myReviews,
    ];
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setMyReviews(next);
    setDraft(null);
    hubToast("Review submitted — thank you");
  };

  const trekFor = (bookingId: string) => completed.find((t) => t.bookingId === bookingId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <HubHeader title="Reviews" description="Rate your completed treks and see what you've written." />

      <HubSection
        title="Awaiting your review"
        description={awaiting.length > 0 ? `${awaiting.length} completed trek${awaiting.length === 1 ? "" : "s"}` : undefined}
        icon={<PenLine className="h-4 w-4" />}
      >
        {awaiting.length === 0 ? (
          <p className="text-sm text-neutral-500">You&apos;re all caught up — nothing to review.</p>
        ) : (
          <ul className="space-y-4">
            {awaiting.map((t) => (
              <li key={t.bookingId} className="rounded-xl border border-neutral-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{t.packageName}</p>
                    <p className="text-xs text-neutral-500">
                      {t.agencyName} · completed {new Date(t.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                  {draft?.bookingId !== t.bookingId && (
                    <button
                      type="button"
                      onClick={() => setDraft({ bookingId: t.bookingId, rating: 0, text: "" })}
                      className="rounded-lg bg-primary-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-800"
                    >
                      Write a review
                    </button>
                  )}
                </div>

                {draft?.bookingId === t.bookingId && (
                  <div className="mt-3 space-y-3">
                    <Field label="Rating">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setDraft((d) => (d ? { ...d, rating: n } : d))}
                            aria-label={`${n} star${n === 1 ? "" : "s"}`}
                          >
                            <Star
                              className={cn(
                                "h-6 w-6 transition",
                                n <= (draft.rating ?? 0)
                                  ? "fill-warning-400 text-warning-400"
                                  : "text-neutral-300 hover:text-warning-300",
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Field label="Your review" hint="At least 10 characters.">
                      <TextArea
                        rows={3}
                        value={draft.text}
                        onChange={(e) => setDraft((d) => (d ? { ...d, text: e.target.value } : d))}
                        placeholder="How was the organisation, the guide, the itinerary?"
                      />
                    </Field>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={submit}
                        disabled={draft.rating === 0 || draft.text.trim().length < 10}
                        className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-40"
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDraft(null)}
                        className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </HubSection>

      <HubSection title="Your reviews" icon={<CheckCircle2 className="h-4 w-4" />}>
        {myReviews.length === 0 ? (
          <EmptyState
            icon={<Star className="h-7 w-7" />}
            title="No reviews written yet"
            description={
              <>
                Reviewed treks appear here.{" "}
                <Link href="/my-treks" className="font-medium text-primary-600 hover:underline">
                  See your treks
                </Link>
              </>
            }
          />
        ) : (
          <ul className="space-y-4">
            {myReviews.map((r) => {
              const t = trekFor(r.bookingId);
              return (
                <li key={r.bookingId + r.createdAt} className="border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-900">
                      <Star className="h-3.5 w-3.5 fill-warning-400 text-warning-400" />
                      {r.rating}
                    </span>
                    <span className="text-sm font-medium text-neutral-700">
                      {t?.packageName ?? "Trek"} — {t?.agencyName ?? ""}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-600">{r.text}</p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {new Date(r.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </HubSection>
    </div>
  );
}
