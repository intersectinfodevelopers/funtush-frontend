"use client";

export interface IncidentItem {
  id: string;
  date: string;
  trek: string;
  guide: string;
  status: string;
  notes: string;
}

interface IncidentLogProps {
  incidents: IncidentItem[];
}

export function IncidentLog({ incidents }: IncidentLogProps) {
  return (
    <div id="incident-log-table" className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200/60 bg-slate-50/80">
        <h3 className="font-bold text-slate-800 text-sm">Historical Emergency SOS Incident Logs</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Formal archive tracking critical satellite triggers, rescue dispatches, and tactical field medical records.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
              <th className="p-3.5">Trigger Date</th>
              <th className="p-3.5">Trek Expedition</th>
              <th className="p-3.5">Assigned Guide</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Resolution Management Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
            {incidents.map((incident) => (
              <tr key={incident.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-3.5 whitespace-nowrap text-slate-400 font-mono">{incident.date}</td>
                <td className="p-3.5 whitespace-nowrap text-slate-800 font-bold">{incident.trek}</td>
                <td className="p-3.5 whitespace-nowrap text-slate-700">{incident.guide}</td>
                <td className="p-3.5 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                    incident.status === 'Active' 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {incident.status}
                  </span>
                </td>
                <td className="p-3.5 text-slate-500 leading-relaxed max-w-md">{incident.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}