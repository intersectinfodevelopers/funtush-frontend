"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AlertTriangle, CheckCircle2, Download, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { exportCsv } from "@/lib/csvExport";
import { acknowledgeIncident, addIncidentNote, exportIncident, fetchActive, fetchActiveTreks, fetchHistory, resolveIncident, type Incident } from "@/lib/api/agency/safety";
import type { MapPin as SafetyMapPin } from "@/components/agency/safety/SafetyMap";
import type { ApiError } from "@/lib/api/client";

// Leaflet touches `window` at import time — must never run during SSR.
const SafetyMap = dynamic(() => import("@/components/agency/safety/SafetyMap"), { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-neutral-100" /> });

const fmtDateTime = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-CA");
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
const mapUrl = (c: { lat: number; lng: number }) => `https://www.openstreetmap.org/?mlat=${c.lat}&mlon=${c.lng}#map=13/${c.lat}/${c.lng}`;
const waLink = (phone: string) => `https://wa.me/${phone.replace(/[^\d]/g, "")}`;

/** mm:ss elapsed from `from` to `to` (or now, live) — real, ticking. */
function useElapsed(fromIso: string, toIso: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (toIso) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [toIso]);
  const end = toIso ? new Date(toIso).getTime() : now;
  const totalSec = Math.max(0, Math.floor((end - new Date(fromIso).getTime()) / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type Dialog = { kind: "note" | "resolve"; incident: Incident } | null;

function ActiveBanner({ i, onAck, ackPending, onNote, onResolve, onExport }: { i: Incident; onAck: () => void; ackPending: boolean; onNote: () => void; onResolve: () => void; onExport: () => void }) {
  const elapsed = useElapsed(i.triggeredAt, null);
  return (
    <article role="alert" className={`border p-5 shadow-sm ${i.acknowledgmentOverdue ? "border-danger-300 bg-danger-50" : "border-danger-200 bg-danger-50/60"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-danger-700"><AlertTriangle className="h-4 w-4" /> {i.status === "ACKNOWLEDGED" ? "SOS Acknowledged — in progress" : `Active SOS — respond within ${i.slaMinutes} minutes`}</h2>
        <span className="font-mono text-lg font-bold text-danger-700">{elapsed}</span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Guide</p>
          <p className="font-bold text-neutral-900">{i.guideName ?? "Unassigned"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{i.trek ? "Trek" : "Trekker"}</p>
          <p className="font-bold text-neutral-900">{i.trek ? `${i.trek.packageTitle}${i.trek.dayNumber ? ` — Day ${i.trek.dayNumber}${i.trek.totalDays ? ` of ${i.trek.totalDays}` : ""}` : ""}` : i.trekkerName}</p>
        </div>
        {i.coordinates && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">GPS Coordinates</p>
            <a href={mapUrl(i.coordinates)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-neutral-900 hover:underline"><MapPin className="h-3.5 w-3.5 text-danger-600" />{i.coordinates.lat.toFixed(4)}°N {i.coordinates.lng.toFixed(4)}°E</a>
          </div>
        )}
      </div>

      {i.trek?.emergencyPolice && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Emergency call</p>
          <a href={`tel:${i.trek.emergencyPolice}`} className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-sm font-semibold text-success-700"><CheckCircle2 className="h-3.5 w-3.5" /> {i.trek.emergencyCountry} Police ({i.trek.emergencyPolice})</a>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {i.status === "ACTIVE" && <button type="button" disabled={ackPending} onClick={onAck} className="inline-flex items-center gap-2 rounded-full bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50"><ShieldCheck className="h-4 w-4" /> Acknowledge</button>}
        {i.guidePhone && <a href={`tel:${i.guidePhone}`} className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"><Phone className="h-4 w-4" /> Call Guide</a>}
        {i.guidePhone && <a href={waLink(i.guidePhone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"><MessageCircle className="h-4 w-4" /> WhatsApp</a>}
        <span className="mx-1 h-5 w-px bg-danger-200" />
        <button type="button" onClick={onNote} className="text-sm font-semibold text-neutral-600 hover:underline">Add note</button>
        <button type="button" onClick={onResolve} className="text-sm font-semibold text-neutral-600 hover:underline">Resolve</button>
        <button type="button" onClick={onExport} className="text-sm font-semibold text-neutral-600 hover:underline">Export</button>
      </div>

      {i.timeline.length > 0 && <ol className="mt-3 space-y-1 border-t border-danger-100 pt-3 text-xs text-neutral-600">{i.timeline.map((t, idx) => <li key={idx}>{fmtDateTime(t.at)} — {t.event.replace(/_/g, " ").toLowerCase()}{t.detail ? `: ${t.detail}` : ""}</li>)}</ol>}
    </article>
  );
}

export default function SafetyPage() {
  const qc = useQueryClient();
  // A live feed must not go stale: poll every 15s.
  const active = useQuery({ queryKey: ["agency", "incidents", "active"], queryFn: fetchActive, refetchInterval: 15_000 });
  const history = useQuery({ queryKey: ["agency", "incidents", "history"], queryFn: fetchHistory });
  const treks = useQuery({ queryKey: ["agency", "safety", "active-treks"], queryFn: fetchActiveTreks, refetchInterval: 30_000 });
  const [dialog, setDialog] = useState<Dialog>(null);
  const [text, setText] = useState("");

  const refresh = () => qc.invalidateQueries({ queryKey: ["agency", "incidents"] });
  const onError = (e: unknown) => toast.error((e as ApiError).message || "That didn't work — please try again.");
  const ack = useMutation({ mutationFn: (id: string) => acknowledgeIncident(id), onSuccess: () => { toast.success("Acknowledged — the SLA timer stopped"); void refresh(); }, onError });
  const submit = useMutation({
    mutationFn: () => (dialog!.kind === "resolve" ? resolveIncident(dialog!.incident.id, text.trim()) : addIncidentNote(dialog!.incident.id, text.trim())),
    onSuccess: () => { toast.success(dialog!.kind === "resolve" ? "Incident resolved" : "Note added"); setDialog(null); setText(""); void refresh(); void qc.invalidateQueries({ queryKey: ["agency", "safety", "active-treks"] }); },
    onError,
  });

  async function download(id: string) {
    try {
      const data = await exportIncident(id);
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const a = Object.assign(document.createElement("a"), { href: url, download: `incident-${id}.json` });
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch (e) { onError(e); }
  }

  function exportReport() {
    const rows = history.data?.incidents ?? [];
    if (rows.length === 0) return toast.error("No incident history to export yet.");
    exportCsv("safety-incident-log.csv", rows.map((i) => ({
      incidentId: i.id,
      guide: i.guideName ?? "",
      trekker: i.trekkerName,
      coordinates: i.coordinates ? `${i.coordinates.lat},${i.coordinates.lng}` : "",
      triggeredAt: i.triggeredAt,
      acknowledgedAt: i.acknowledgedAt ?? "",
      resolvedAt: i.resolvedAt ?? "",
      status: i.status,
      resolution: i.resolution ?? "",
    })));
  }

  const feed = active.data;
  const liveTreks = treks.data ?? [];

  // Real pins only: an open incident's own GPS fix, or a trek's approximate route
  // location (matched from the package name — see trekRegionCoordinates.ts on the
  // backend). A trek with no match gets no pin; that's the honest outcome.
  const mapPins = useMemo<SafetyMapPin[]>(() => {
    const incidentPins: SafetyMapPin[] = (feed?.incidents ?? [])
      .filter((i) => i.coordinates)
      .map((i) => ({ id: `incident-${i.id}`, lat: i.coordinates!.lat, lng: i.coordinates!.lng, title: `Active SOS — ${i.guideName ?? i.trekkerName}`, subtitle: "Real GPS coordinates from this alert", tone: "sos" as const }));
    const trekPins: SafetyMapPin[] = liveTreks
      .filter((t) => t.region)
      .map((t) => ({ id: `trek-${t.bookingId}`, lat: t.region!.lat, lng: t.region!.lng, title: `${t.packageTitle} — ${t.guideName ?? "Unassigned"}`, subtitle: `Approximate route location: ${t.region!.label}`, tone: t.hasActiveSos ? ("sos" as const) : ("live" as const) }));
    return [...incidentPins, ...trekPins];
  }, [feed, liveTreks]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Safety Monitoring</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500"><Link href="/dashboard" className="hover:text-neutral-900">Safety</Link><span className="text-neutral-300">/</span><span className="font-semibold text-primary-700">Live Overview</span></div>
        </div>
        <button type="button" onClick={exportReport} className="inline-flex items-center gap-2 self-start rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"><Download className="h-4 w-4" /> Export Report</button>
      </div>

      {active.isError && <p role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load the live SOS feed. Retrying automatically.</p>}
      {feed && feed.activeCount === 0 && <p className="rounded-2xl border border-success-200 bg-success-50 px-4 py-4 text-sm font-medium text-success-800">No active SOS alerts. This page refreshes on its own.</p>}

      <div className="space-y-3">
        {(feed?.incidents ?? []).map((i) => (
          <ActiveBanner key={i.id} i={i} ackPending={ack.isPending} onAck={() => ack.mutate(i.id)} onNote={() => { setDialog({ kind: "note", incident: i }); setText(""); }} onResolve={() => { setDialog({ kind: "resolve", incident: i }); setText(""); }} onExport={() => void download(i.id)} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(280px,340px)_1fr]">
        <section className="border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between"><h2 className="font-bold text-neutral-900">Active Treks</h2><span className="rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-bold text-success-700">{liveTreks.length} Live</span></div>
          <div className="mt-3 space-y-2.5">
            {treks.isLoading && <div className="h-16 animate-pulse rounded-xl bg-neutral-100" />}
            {!treks.isLoading && liveTreks.length === 0 && <p className="text-sm text-neutral-500">No treks currently checked in.</p>}
            {liveTreks.map((t) => (
              <div key={t.bookingId} className={`rounded-xl border p-3 ${t.hasActiveSos ? "border-danger-200 bg-danger-50" : "border-neutral-200"}`}>
                <p className="text-sm font-bold text-neutral-900">{t.packageTitle} — {t.guideName ?? "Unassigned"}</p>
                <p className={`mt-0.5 flex items-center gap-1 text-xs font-semibold ${t.hasActiveSos ? "text-danger-700" : "text-success-700"}`}>{t.hasActiveSos ? <><AlertTriangle className="h-3 w-3" /> SOS ACTIVE</> : <><span className="h-1.5 w-1.5 rounded-full bg-success-600" /> LIVE</>}</p>
                {t.dayNumber && (
                  <>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100"><div className={`h-full rounded-full ${t.hasActiveSos ? "bg-danger-500" : "bg-primary-700"}`} style={{ width: `${t.totalDays ? Math.min(100, (t.dayNumber / t.totalDays) * 100) : 100}%` }} /></div>
                    <p className="mt-1 text-xs text-neutral-500">Day {t.dayNumber}{t.totalDays ? ` of ${t.totalDays}` : ""}</p>
                  </>
                )}
                {!t.region && <p className="mt-1.5 text-xs text-neutral-400">No route match — not shown on map</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="h-105 overflow-hidden border border-neutral-200 bg-white shadow-sm lg:h-auto">
          {mapPins.length > 0 || !treks.isLoading ? <SafetyMap pins={mapPins} /> : <div className="flex h-full items-center justify-center text-sm text-neutral-400">Loading map…</div>}
        </section>
      </div>

      <div className="grid gap-4">
        <section className="border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3"><h2 className="font-bold text-neutral-900">Incident Log</h2><span className="text-xs text-neutral-400">Immutable — cannot be edited or deleted</span></div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-neutral-50 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500"><tr><th className="px-4 py-3">Incident ID</th><th className="px-4 py-3">Guide</th><th className="px-4 py-3">Coordinates</th><th className="px-4 py-3">Time</th><th className="px-4 py-3">Response</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Export</th></tr></thead>
              <tbody>
                {history.isLoading && <tr><td colSpan={7} className="px-4 py-5"><div className="h-4 animate-pulse rounded bg-neutral-100" /></td></tr>}
                {history.data && history.data.incidents.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-500">No past incidents.</td></tr>}
                {(history.data?.incidents ?? []).map((i) => {
                  const responseSec = i.acknowledgedAt ? Math.max(0, Math.floor((new Date(i.acknowledgedAt).getTime() - new Date(i.triggeredAt).getTime()) / 1000)) : null;
                  const response = responseSec !== null ? `${String(Math.floor(responseSec / 60)).padStart(2, "0")}:${String(responseSec % 60).padStart(2, "0")}` : "—";
                  return (
                    <tr key={i.id} className="border-t border-neutral-100">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-danger-600">sos-{i.id.slice(-4)}</td>
                      <td className="px-4 py-3"><span className="font-semibold text-neutral-900">{i.guideName ?? "Unassigned"}</span><div className="text-xs text-neutral-500">{i.trekkerName}</div></td>
                      <td className="px-4 py-3 text-neutral-700">{i.coordinates ? `${i.coordinates.lat.toFixed(3)}°N ${i.coordinates.lng.toFixed(3)}°E` : "—"}</td>
                      <td className="px-4 py-3 text-neutral-700">{fmtDate(i.triggeredAt)}<div className="text-xs text-neutral-400">{fmtTime(i.triggeredAt)}</div></td>
                      <td className="px-4 py-3">{responseSec !== null ? <span className="inline-flex items-center gap-1 font-semibold text-success-700"><CheckCircle2 className="h-3.5 w-3.5" /> {response}</span> : <span className="inline-flex items-center gap-1 font-semibold text-warning-600"><AlertTriangle className="h-3.5 w-3.5" /> {response}</span>}</td>
                      <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${i.status === "RESOLVED" ? "bg-success-50 text-success-700" : "bg-neutral-100 text-neutral-600"}`}>{i.status === "RESOLVED" ? "Resolved" : "Cancelled"}</span></td>
                      <td className="px-4 py-3"><button type="button" onClick={() => void download(i.id)} className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"><Download className="h-3.5 w-3.5" /> PDF</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <Modal isOpen={dialog !== null} onClose={() => setDialog(null)} title={dialog?.kind === "resolve" ? "Resolve incident" : "Add a note"} size="md">
        <div className="space-y-3 p-4">
          <p className="text-sm text-neutral-600">{dialog?.kind === "resolve" ? "Describe how it ended. This closes the alert and is kept in the record." : "Notes are added to the incident's timeline."}</p>
          <textarea aria-label={dialog?.kind === "resolve" ? "Resolution" : "Note"} rows={3} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-400" />
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setDialog(null)} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Cancel</button><button type="button" disabled={submit.isPending || !text.trim()} onClick={() => submit.mutate()} className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{dialog?.kind === "resolve" ? "Resolve" : "Add note"}</button></div>
        </div>
      </Modal>
    </div>
  );
}
