interface StatsProps {
  totalReviews: number;
  avgRating: string;
  responseRate: string; 
  fiveStarCount: number;
}

export function ReviewStatsSummary({ totalReviews, avgRating, responseRate, fiveStarCount }: StatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Rating</p>
        <div className="flex items-baseline space-x-1.5 mt-2">
          <span className="text-3xl font-bold text-slate-800">{avgRating}</span>
          <span className="text-amber-500 text-xl">★</span>
        </div>
      </div>
      <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Reviews</p>
        <p className="text-3xl font-bold text-slate-800 mt-2">{totalReviews}</p>
      </div>
      <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Response Rate</p>
        <p className="text-3xl font-bold text-slate-800 mt-2">{responseRate}%</p>
      </div>
      <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">5-Star Reviews</p>
        <p className="text-3xl font-bold text-slate-800 mt-2">{fiveStarCount}</p>
      </div>
    </div>
  );
}