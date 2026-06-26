"use client";

interface BlogSchedulerProps {
  isScheduled: boolean;
  onToggleSchedule: (val: boolean) => void;
  scheduledDateTime: string;
  onDateTimeChange: (val: string) => void;
}

export function BlogScheduler({ isScheduled, onToggleSchedule, scheduledDateTime, onDateTimeChange }: BlogSchedulerProps) {
  return (
    <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-xs text-xs space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800">Publish Timeline Configuration</h4>
          <p className="text-[10px] text-slate-400">Automate layout updates or publish immediately.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isScheduled}
              onChange={(e) => onToggleSchedule(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-7 h-4 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className="font-semibold text-slate-600">Schedule</span>
        </div>
      </div>

      {isScheduled && (
        <div className="pt-2 border-t border-slate-100 animate-fade-in">
          <label className="block font-semibold text-slate-700 mb-1">Target Engine Date & Time</label>
          <input
            type="datetime-local"
            required={isScheduled}
            value={scheduledDateTime}
            onChange={(e) => onDateTimeChange(e.target.value)}
            className="w-full border border-slate-200 rounded-lg p-2 font-mono text-slate-700 focus:ring-1 focus:ring-blue-500 outline-hidden"
          />
        </div>
      )}
    </div>
  );
}