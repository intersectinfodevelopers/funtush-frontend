import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  /** No rounded corners on the buttons. */
  square?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, className, square }) => {
  // First, last, current ±1 with "…" gaps — not a button per page (1000 pages = 1000 buttons).
  const getPageNumbers = (): Array<number | null> => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const keep = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
    if (currentPage <= 3) [2, 3, 4].forEach((p) => keep.add(p));
    if (currentPage >= totalPages - 2) [totalPages - 3, totalPages - 2, totalPages - 1].forEach((p) => keep.add(p));
    const sorted = [...keep].filter((p) => p >= 1 && p <= totalPages).sort((x, y) => x - y);
    const out: Array<number | null> = [];
    sorted.forEach((p, i) => {
      const gap = i > 0 ? p - sorted[i - 1] : 1;
      if (gap === 2) out.push(sorted[i - 1] + 1);
      else if (gap > 2) out.push(null);
      out.push(p);
    });
    return out;
  };

  return (
    <nav className={cn('mt-4 flex items-center justify-between border-t border-neutral-200 px-4 py-3 sm:px-6', className)}>
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-neutral-700">
            Showing page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <div className="relative inline-flex flex-wrap items-center justify-center -space-x-px shadow-sm">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              type="button"
              aria-label="Previous page"
              title="Previous page"
              className={`relative inline-flex items-center ${square ? '' : 'rounded-l-md'} px-2.5 py-2 text-primary-900 ring-1 ring-inset ring-neutral-300 hover:bg-primary-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer focus:outline-none`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {getPageNumbers().map((page, idx) => {
              if (page === null) {
                return (
                  <span key={`gap-${idx}`} aria-hidden className="relative inline-flex items-center px-3 py-2 text-sm text-neutral-400 ring-1 ring-inset ring-neutral-300">
                    …
                  </span>
                );
              }
              const isCurrent = page === currentPage;
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={cn(
                    'relative inline-flex min-w-9 items-center justify-center px-3 py-2 text-sm font-semibold ring-1 ring-inset cursor-pointer transition-colors focus:outline-none',
                    isCurrent
                      ? 'z-10 bg-primary-900 text-white ring-primary-900'
                      : 'text-neutral-900 ring-neutral-300 hover:bg-primary-50 hover:text-primary-900'
                  )}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {page}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              title="Next page"
              className={`relative inline-flex items-center ${square ? '' : 'rounded-r-md'} px-2.5 py-2 text-primary-900 ring-1 ring-inset ring-neutral-300 hover:bg-primary-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer focus:outline-none`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};