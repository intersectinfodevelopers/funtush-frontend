"use client";
import { useState, useEffect } from 'react';
import reviewsData from '../../../../../data/reviews.json';
import { ReviewStatsSummary } from '@/components/agency/reviews/ReviewStatsSummary';
import { ReviewFilterToolbar } from '@/components/agency/reviews/ReviewFilterToolbar';
import { ReviewTableRow } from '@/components/agency/reviews/ReviewTableRow';
import { ReviewDetailPanel } from '@/components/agency/reviews/ReviewDetailPanel';
import { ReviewAnalytics } from '@/components/agency/reviews/ReviewAnalytics';

export interface ReviewItem {
  id: string;
  package_id: string;
  agency_id: string;
  trekker_name: string;
  rating: number;
  title: string;
  text: string;
  guide_rating: number;
  created_at: string;
  date?: string;
}

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [starFilter, setStarFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);

  const [localResponses, setLocalResponses] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('funtush_review_responses');
      return saved ? JSON.parse(saved) : {}; 
    }
    return {};
  });

  const [flaggedReviews, setFlaggedReviews] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('funtush_review_flags');
      return saved ? JSON.parse(saved) : {}; 
    }
    return {};
  });

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const totalReviews = reviewsData.length;
  const avgRating = totalReviews > 0
    ? (reviewsData.reduce((acc, cur) => acc + cur.rating, 0) / totalReviews).toFixed(1)
    : "0.0";
  const fiveStarCount = reviewsData.filter(r => r.rating === 5).length;

  const totalResponded = Object.keys(localResponses).length;
  const responseRate = totalReviews > 0 ? ((totalResponded / totalReviews) * 100).toFixed(0) : "0";

  const finalFilteredReviews = reviewsData
    .filter(review => {
      const matchesStar = starFilter === 'all' || review.rating.toString() === starFilter;
      const hasResponse = !!localResponses[review.id];
      const currentStatus = hasResponse ? 'responded' : 'pending';
      const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;

      return matchesStar && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'lowest') {
        return a.rating - b.rating;
      }
      return 0;
    });

  const handlePostResponse = (reviewId: string, text: string) => {
    const updated = { ...localResponses, [reviewId]: text };
    setLocalResponses(updated);
    localStorage.setItem('funtush_review_responses', JSON.stringify(updated));
  };

  const handleFlagReview = (reviewId: string, reason: string, notes: string) => {
    const updated = { ...flaggedReviews, [reviewId]: { reason, notes } };
    setFlaggedReviews(updated);
    localStorage.setItem('funtush_review_flags', JSON.stringify(updated));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative overflow-hidden">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Reviews Overview</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage, filter, and sort your package reviews alongside historical metrics.</p>
      </div>

      <ReviewStatsSummary
        totalReviews={totalReviews}
        avgRating={avgRating}
        responseRate={`${responseRate}%`}
        fiveStarCount={fiveStarCount}
      />

      {mounted ? (
        <ReviewAnalytics reviews={reviewsData as ReviewItem[]} />
      ) : (
        <div className="h-48 bg-slate-50 rounded-xl animate-pulse border border-slate-200/60" />
      )}

      <ReviewFilterToolbar
        starFilter={starFilter}
        setStarFilter={setStarFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-xs font-bold tracking-wider uppercase">
                <th className="p-4">Trekker Name</th>
                <th className="p-4">Package ID</th>
                <th className="p-4">Star Rating</th>
                <th className="p-4">Review Details</th>
                <th className="p-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {finalFilteredReviews.length > 0 ? (
                finalFilteredReviews.map((review) => (
                  <ReviewTableRow
                    key={review.id}
                    review={review}
                    isFlagged={mounted ? !!flaggedReviews[review.id] : false}
                    hasResponse={mounted ? !!localResponses[review.id] : false}
                    onClick={() => setSelectedReview(review)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 font-medium">
                    No matching reviews found matching your selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReview && (
        <ReviewDetailPanel
          review={selectedReview}
          existingResponse={localResponses[selectedReview.id] || ""}
          isFlagged={!!flaggedReviews[selectedReview.id]}
          flagData={flaggedReviews[selectedReview.id]}
          onClose={() => setSelectedReview(null)}
          onSaveResponse={(text) => handlePostResponse(selectedReview.id, text)}
          onFlag={(reason: string, notes: string) => handleFlagReview(selectedReview.id, reason, notes)}
        />
      )}
    </div>
  );
}