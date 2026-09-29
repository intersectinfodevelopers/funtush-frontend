import { api } from '../client';

export interface ApiReview {
  id: string;
  bookingId: string;
  rating: number;
  title: string | null;
  text: string;
  photos: string[];
  verified: boolean;
  createdAt: string;
  trekker: { fullName: string | null };
  response: { id: string; responseText: string; respondedAt: string } | null;
  booking: { package: { id: string; title: string } | null } | null;
}

export interface MonthlyRatingTrend {
  /** "YYYY-MM" */
  month: string;
  /** null when the agency had no reviews that month — a real gap, not a fabricated carry-forward. */
  averageRating: number | null;
  count: number;
}

export interface ReviewList {
  averageRating: number;
  totalReviews: number;
  respondedCount: number;
  /** % of all reviews at each star value. */
  starDistribution: Record<'1' | '2' | '3' | '4' | '5', number>;
  /** raw count of all reviews at each star value. */
  starCounts: Record<'1' | '2' | '3' | '4' | '5', number>;
  /** average rating per month, trailing 6 months. */
  monthlyTrend: MonthlyRatingTrend[];
  reviews: ApiReview[];
  page: number;
  limit: number;
  filteredTotal: number;
  pages: number;
}

export interface ReviewParams {
  rating?: number;
  responded?: boolean;
  sort?: 'newest' | 'oldest' | 'lowest' | 'highest';
  page?: number;
  limit?: number;
}

// GET /agencies/:slug/reviews (public) → { success, data: ReviewList }
export const fetchReviews = async (slug: string, params: ReviewParams) =>
  (await api.get<{ success: boolean; data: ReviewList }>(`/agencies/${slug}/reviews`, { params })).data;

/** One official response per review; the API refuses a second ("Already responded"). */
export const respondToReview = (id: string, responseText: string) => api.post(`/reviews/${id}/response`, { responseText });
export const flagReview = (id: string, reason: string) => api.post(`/reviews/${id}/flag`, { reason });
/** Deletes the review outright — distinct from flagging (which sends it to platform moderation instead). */
export const deleteReview = (id: string) => api.delete(`/reviews/${id}`);
