"use client";

interface ReviewItem {
  id: string;
  package_id: string;
  agency_id: string;
  trekker_name: string; 
  rating: number;
  title: string;
  text: string;
  guide_rating: number;
  created_at?: string;
  date?: string; 
}

interface RowProps {
  review: ReviewItem;
  isFlagged: boolean;    
  hasResponse: boolean;  
  onClick: () => void;   
}

export function ReviewTableRow({ review, isFlagged, hasResponse, onClick }: RowProps) {
  const displayDate = review.date || (review.created_at ? new Date(review.created_at).toLocaleDateString() : "");

  return (
    <tr 
      onClick={onClick}
      className="hover:bg-slate-50/80 transition-colors cursor-pointer select-none"
    >
      <td className="p-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{review.trekker_name}</span>
          <div className="flex gap-1.5 mt-1">
            {hasResponse && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                Responded
              </span>
            )}
            {isFlagged && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">
                Flagged
              </span>
            )}
          </div>
        </div>
      </td>

      <td className="p-4 text-slate-600 whitespace-nowrap font-medium align-middle">
        {review.package_id}
      </td>

      <td className="p-4 whitespace-nowrap align-middle">
        <div className="flex items-center text-amber-500 font-bold">
          {review.rating} <span className="ml-0.5 text-xs">★</span>
        </div>
      </td>

      <td className="p-4 max-w-xs md:max-w-md truncate text-slate-500 align-middle">
        <span className="font-semibold text-slate-700 block text-xs">{review.title}</span>
        {review.text}
      </td>

     <td className="p-4 text-right text-slate-400 text-xs font-medium whitespace-nowrap align-middle">
        {displayDate}
      </td>
    </tr>
  );
}