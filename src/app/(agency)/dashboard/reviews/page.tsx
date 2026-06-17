"use client";

import { useMemo, useState} from "react";
import reviewsData from "../../../../../data/reviews.json";
import ReviewStats from "@/components/agency/reviews/ReviewStats";
import ReviewFilters from "@/components/agency/reviews/ReviewFilters";
import ReviewTable from "@/components/agency/reviews/ReviewTable";
import ReviewDrawer from "@/components/agency/reviews/ReviewDrawer";

export default function Page() {
  const reviews = reviewsData as any[];

  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState("newest");

  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => {
    let data = [...reviews];

    if (ratingFilter !== "all") {
      data = data.filter((r) => r.rating === ratingFilter);
    }

    if (sortBy === "newest") {
      data.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    }

    if (sortBy === "oldest") {
      data.sort((a, b) => +new Date(a.date) - +new Date(b.date));
    }

    if (sortBy === "lowest") {
      data.sort((a, b) => a.rating - b.rating);
    }

    return data;
  }, [reviews, ratingFilter, sortBy]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const avg =
      total > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / total
        : 0;

    const fiveStar = reviews.filter((r) => r.rating === 5).length;

    return { total, avg, fiveStar };
  }, [reviews]);

  const ratingDistribution = useMemo(() => {
    const dist = [1, 2, 3, 4, 5].map((star) => ({
      rating: star,
      count: reviews.filter((r) => r.rating === star).length,
    }));

    return dist;
  }, [reviews]);
  const trend = useMemo(() => {
    const monthMap: Record<string, number> = {};

    reviews.forEach((r) => {
      const date = new Date(r.date);

      const month = date.toLocaleString("en-US", {
        month: "short",
      });

      monthMap[month] = (monthMap[month] || 0) + 1;
    });

    return Object.entries(monthMap).map(([month, count]) => ({
      month,
      count,
    }));
  }, [reviews]);

  return (
    <div className="p-6 space-y-6">

      <ReviewStats stats={stats} ratingDistribution={ratingDistribution} trend={trend}

      />

      <ReviewFilters
        ratingFilter={ratingFilter}
        setRatingFilter={setRatingFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <ReviewTable
        reviews={filtered}
        onSelect={(r: any) => {
          setSelectedReview(r);
          setIsOpen(true);
        }}
      />

      <ReviewDrawer
        open={isOpen}
        review={selectedReview}
        onClose={() => setIsOpen(false)}
      />

    </div>
  );
}