"use client";

interface SOSAlertBannerProps {
  activeSosCount: number;
}

export function SOSAlertBanner({ activeSosCount }: SOSAlertBannerProps) {
  if (activeSosCount === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between shadow-xs animate-pulse">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-600 text-white rounded-lg font-bold text-xs tracking-wide">SOS</div>
        <div>
          <h4 className="font-bold text-red-900 text-sm">
            {activeSosCount} Active Emergency Alert{activeSosCount > 1 ? 's' : ''} Detected
          </h4>
          <p className="text-xs text-red-700 font-medium">
            Critical altitude medical alert requiring satellite check-in operations dispatch.
          </p>
        </div>
      </div>
      <button 
        onClick={() => {
          const element = document.getElementById("incident-log-table");
          element?.scrollIntoView({ behavior: "smooth" });
        }}
        className="text-xs bg-red-600 text-white font-semibold py-1.5 px-3 rounded-lg shadow-xs hover:bg-red-700 transition-colors whitespace-nowrap"
      >
        View Details
      </button>
    </div>
  );
}