interface FilterProps {
  starFilter: string;
  setStarFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
}

export function ReviewFilterToolbar({
  starFilter,
  setStarFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
}: FilterProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
        <select
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none"
          value={starFilter}
          onChange={(e) => {
            const newValue = e.target.value;
            console.log("👉 [Toolbar Dropdown] Star Filter Changed To:", newValue);
            setStarFilter(newValue);
          }}        >
          <option value="all">All Star Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>

        <select
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Not Responded</option>
          <option value="responded">Responded</option>
        </select>
      </div>

      <select
        className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="lowest">Lowest Rating</option>
      </select>
    </div>
  );
}