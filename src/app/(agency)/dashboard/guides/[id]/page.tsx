"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Award, CalendarDays, ExternalLink, Footprints, Mail, Pencil, Phone, Star, Trash2, User, Languages as LanguagesIcon } from "lucide-react";

import GuideAvatar from "@/components/agency/guides/GuideAvatar";
import { BookingStatusBadge } from "@/components/agency/bookings/BookingStatusBadge";
import { Modal } from "@/components/ui/modal";
import { useGuideDetail } from "@/hooks/useAgencyGuides";
import { languageLabel } from "@/lib/languages";
import { deactivateGuide } from "@/lib/api/agency/guides";
import type { ApiError } from "@/lib/api/client";

const STATUS_STYLE = { available: "bg-success-50 text-success-700", on_trek: "bg-sky-50 text-sky-700", unavailable: "bg-danger-50 text-danger-600" } as const;
const STATUS_LABEL = { available: "Available", on_trek: "On Trek", unavailable: "Unavailable" } as const;
const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");
const cap = (s?: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");

const btn = "inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50";
const strip = "border-b border-neutral-200 bg-neutral-50 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-600";

function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-neutral-200 bg-white ${className}`}>
      <h2 className={strip}>{title}</h2>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Row({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 border-b border-neutral-100 py-2.5 text-sm last:border-b-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-neutral-500">{label}</p>
        <div className="break-words font-semibold text-neutral-900">{children}</div>
      </div>
    </div>
  );
}

export default function GuideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: guide, isLoading, isError } = useGuideDetail(id);
  const [confirm, setConfirm] = useState(false);
  const [now] = useState(() => Date.now()); // captured once — render must stay pure

  const remove = useMutation({
    mutationFn: () => deactivateGuide(id),
    onSuccess: () => {
      toast.success(`“${guide?.name}” was removed from your guides`);
      void qc.invalidateQueries({ queryKey: ["agency", "guides"] });
      void qc.invalidateQueries({ queryKey: ["agency", "summary"] });
      router.push("/dashboard/guides");
    },
    onError: (e) => { setConfirm(false); toast.error((e as unknown as ApiError).message || "Couldn't remove this guide."); },
  });

  if (isLoading) return <div className="mx-auto h-48 max-w-6xl animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (isError || !guide) {
    return (
      <div className="mx-auto max-w-6xl space-y-3 rounded-2xl border border-neutral-200 bg-white p-6">
        <p className="text-sm text-neutral-700">This guide doesn&apos;t exist (or was removed).</p>
        <Link href="/dashboard/guides" className="text-sm font-semibold text-primary-700 hover:underline">← Back to guides</Link>
      </div>
    );
  }

  const soon = now + 30 * 86_400_000;
  const tiles: Array<[string, string, string]> = [
    ["Treks guided", String(guide.totalTreks), "completed"],
    ["Rating", guide.rating != null ? guide.rating.toFixed(1) : "—", guide.rating != null ? "out of 5" : "not rated yet"],
    ["Certifications", String(guide.certifications.length), `${guide.certifications.filter((c) => { const t = new Date(c.expiry).getTime(); return t > now && t <= soon; }).length} expiring in 30 days`],
    ["Upcoming", String(guide.upcomingAssignments.length), "assignments"],
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 py-2 sm:py-4">
      <div className="flex flex-col gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link>
            <span className="text-neutral-300">/</span>
            <Link href="/dashboard/guides" className="hover:text-neutral-900">Guides</Link>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-primary-900">Details</span>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <GuideAvatar name={guide.name} photo={guide.photo} size={64} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-neutral-900">{guide.name}</h1>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[guide.status]}`}>{STATUS_LABEL[guide.status]}</span>
              </div>
              <p className="text-sm text-neutral-500">{guide.phone}{guide.email ? ` · ${guide.email}` : ""}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/guides/${id}/edit`} className={btn}><Pencil className="h-4 w-4" /> Edit</Link>
          <button type="button" onClick={() => setConfirm(true)} className="inline-flex items-center gap-2 rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700"><Trash2 className="h-4 w-4" /> Delete</button>
        </div>
      </div>

      <div className="grid overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200 sm:grid-cols-2 lg:grid-cols-4 gap-px">
        {tiles.map(([label, value, hint]) => (
          <div key={label} className="bg-white p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-neutral-900">{value}</p>
            <p className="mt-1 text-xs text-neutral-500">{hint}</p>
          </div>
        ))}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel title="About">
            {guide.bio ? <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-700">{guide.bio}</p> : <p className="text-sm text-neutral-500">No bio yet.</p>}
            {guide.languages.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-neutral-100 pt-4">
                {guide.languages.map((l) => <span key={l} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-900">{languageLabel(l)}</span>)}
              </div>
            )}
          </Panel>

          <Panel title={`Certifications${guide.certifications.length ? ` · ${guide.certifications.length}` : ""}`}>
            {guide.certifications.length === 0 ? <p className="text-sm text-neutral-500">None recorded.</p> : (
              <ul className="divide-y divide-neutral-100">
                {guide.certifications.map((c) => {
                  const exp = new Date(c.expiry).getTime();
                  const state = exp < now ? { label: "Expired", cls: "bg-danger-50 text-danger-600" } : exp <= soon ? { label: "Expiring soon", cls: "bg-warning-50 text-warning-700" } : { label: "Valid", cls: "bg-success-50 text-success-700" };
                  return (
                    <li key={c.id ?? c.number} className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm first:pt-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <Award className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                        <div>
                          <p className="font-semibold text-neutral-900">{c.name}</p>
                          <p className="text-neutral-500">{c.issuingBody ? `${c.issuingBody} · ` : ""}#{c.number}</p>
                          {c.document && <a href={c.document} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:underline"><ExternalLink className="h-3 w-3" /> View document</a>}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${state.cls}`}>{state.label}</span>
                        <p className="mt-1 text-xs text-neutral-500">Expires {fmt(c.expiry)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel title="Upcoming assignments">
            {guide.upcomingAssignments.length === 0 ? <p className="text-sm text-neutral-500">No upcoming assignments.</p> : (
              <ul className="divide-y divide-neutral-100">
                {guide.upcomingAssignments.map((a) => (
                  <li key={a.id}>
                    <Link href={`/dashboard/bookings/${a.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm first:pt-0 last:pb-0 hover:opacity-80">
                      <span className="font-semibold text-neutral-900">{a.title ?? "Trek"}</span>
                      <span className="inline-flex items-center gap-1 text-neutral-500"><CalendarDays className="h-3.5 w-3.5" />{fmt(a.date)}</span>
                      {a.status && <BookingStatusBadge status={a.status as never} />}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Contact">
            <Row icon={Phone} label="Phone">{guide.phone}</Row>
            <Row icon={Mail} label="Email">{guide.email ?? "—"}</Row>
            <Row icon={User} label="Sex">{cap(guide.sex)}</Row>
            <Row icon={LanguagesIcon} label="Languages">{guide.languages.length ? guide.languages.map(languageLabel).join(", ") : "—"}</Row>
          </Panel>
          <Panel title="Profile">
            <Row icon={Star} label="Rating">{guide.rating != null ? `${guide.rating.toFixed(1)} / 5` : "Not rated yet"}</Row>
            <Row icon={Footprints} label="Availability"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLE[guide.status]}`}>{STATUS_LABEL[guide.status]}</span></Row>
            <Row icon={CalendarDays} label="Guide since">{fmt(guide.createdAt)}</Row>
          </Panel>
        </div>
      </div>

      <Modal isOpen={confirm} onClose={() => setConfirm(false)} title={`Delete ${guide.name}?`} size="sm">
        <div className="space-y-4 p-4">
          <p className="text-sm text-neutral-600">They are removed from your guides and can&apos;t be assigned to new bookings. Past bookings keep their record.</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setConfirm(false)} className={btn}>Cancel</button>
            <button type="button" disabled={remove.isPending} onClick={() => remove.mutate()} className="rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50">{remove.isPending ? "Deleting…" : "Delete"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
