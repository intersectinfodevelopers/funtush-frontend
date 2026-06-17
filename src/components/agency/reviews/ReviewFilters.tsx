export default function ReviewFilters({
  ratingFilter,
  setRatingFilter,
  sortBy,
  setSortBy,
}: any) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <select
        className="border rounded-lg px-3 py-2"
        value={ratingFilter}
        onChange={(e) =>
          setRatingFilter(
            e.target.value === "all"
              ? "all"
              : Number(e.target.value)
          )
        }
      >
        <option value="all">All Ratings</option>
        <option value="5">5 Star</option>
        <option value="4">4 Star</option>
        <option value="3">3 Star</option>
        <option value="2">2 Star</option>
        <option value="1">1 Star</option>
      </select>

      <select
        className="border rounded-lg px-3 py-2"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="lowest">Lowest Rating</option>
      </select>
    </div>
  );
}