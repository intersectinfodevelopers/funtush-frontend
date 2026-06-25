"use client";
import { useState } from "react";

interface BugReport {
  id: string;
  title: string;
  status: "Submitted" | "Under Review" | "Fixed" | "Closed";
  date: string;
  notes?: string;
}

const mockAnnouncements = [
  { id: "p-1", text: "Scheduled API Patch: Funtush core gateways will undergo minor routing updates on Saturday at 02:00 UTC." },
  { id: "p-2", text: "Pro-Tip: Attach full network response JSON steps when reporting mapping telemetry errors to secure faster processing times." }
];

const initialReports: BugReport[] = [
  { id: "BUG-104", title: "Leaflet map markers failing to render on mobile Safari builds", status: "Under Review", date: "2026-06-24", notes: "Engineering looking into WebKit render calculation inconsistencies." },
  { id: "BUG-089", title: "Dashboard metric summary component flashing empty layout states during routing", status: "Fixed", date: "2026-06-19", notes: "Resolved via dynamic fallback transitions patch." }
];

export default function SupportPage() {
  const [reports, setReports] = useState<BugReport[]>(initialReports);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [steps, setSteps] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;

    const newBug: BugReport = {
      id: `BUG-${Math.floor(100 + Math.random() * 900)}`,
      title,
      status: "Submitted",
      date: new Date().toISOString().split('T')[0],
      notes: "Awaiting inspection triage allocation."
    };

    setReports([newBug, ...reports]);
    setTitle("");
    setDesc("");
    setSteps("");
    setScreenshot(null);
    alert("Bug reported successfully directly into Funtush support triage!");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Help Center & Bug Report Hub</h1>
        <p className="text-sm text-slate-500 mt-0.5">Submit technical bugs directly to the Funtush development engine and monitor engineering triage notes.</p>
      </div>

      {/* HintsBanner Announcements */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
        {mockAnnouncements.map((ann) => (
          <div key={ann.id} className="text-xs text-slate-600 font-medium flex items-start gap-2">
            <span className="leading-relaxed">{ann.text}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Bug Report Form */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-xs lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5 mb-4">Report an Operational System Bug</h3>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Issue Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., GPS telemetry track failing to push update coords"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Detailed Description *</label>
              <textarea
                rows={3}
                required
                placeholder="Describe what occurred, expected result, and system details..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Steps to Reproduce</label>
              <textarea
                rows={2}
                placeholder="1. Navigate to live tracking canvas&#10;2. Select an active trek&#10;3. Trigger manual coordinate recalculation..."
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-700 font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Upload Log / Screenshot</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                  className="block text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                {screenshot && <span className="text-slate-400 font-mono truncate max-w-[150px]">{screenshot.name}</span>}
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition-colors shadow-xs"
            >
              Dispatch Ticket to Funtush Core
            </button>
          </form>
        </div>

        {/* My Reports List */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs h-full">
          <h3 className="font-bold text-slate-800 text-sm mb-3">My Submitted Tickets</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {reports.map((report) => (
              <div key={report.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-slate-800 text-xs leading-tight">{report.title}</h4>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider uppercase whitespace-nowrap ${
                    report.status === "Fixed" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                    report.status === "Under Review" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                    report.status === "Closed" ? "bg-slate-200 text-slate-600" : "bg-blue-50 text-blue-700 border border-blue-100"
                  }`}>
                    {report.status}
                  </span>
                </div>
                {report.notes && (
                  <p className="text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-200/40 leading-relaxed">
                    <strong className="text-slate-700 font-semibold block text-[10px] uppercase text-slate-400 mb-0.5">Funtush Dev Team Note:</strong>
                    {report.notes}
                  </p>
                )}
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 font-medium">
                  <span>ID: {report.id}</span>
                  <span>Logged: {report.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}