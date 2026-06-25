"use client";
import { useState } from 'react';
import { ReviewItem } from '@/app/(agency)/dashboard/reviews/page';

interface ReviewDetailPanelProps {
  review: ReviewItem;
  existingResponse: string;
  isFlagged: boolean;
  flagData?: { reason: string; notes: string };
  onClose: () => void;
  onSaveResponse: (text: string) => void;
  onFlag: (reason: string, notes: string) => void;
}

export function ReviewDetailPanel({
  review,
  existingResponse,
  isFlagged,
  flagData,
  onClose,
  onSaveResponse,
  onFlag
}: ReviewDetailPanelProps) {
  const [responseText, setResponseText] = useState(existingResponse);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState('Fake/Spam');
  const [flagNotes, setFlagNotes] = useState('');

  const submitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveResponse(responseText);
    alert("Public response posted successfully!");
  };

  const submitFlag = () => {
    onFlag(flagReason, flagNotes);
    setShowFlagModal(false);
    alert("Review has been flagged for moderation.");
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 border-l border-slate-200 flex flex-col transform transition-transform animate-slide-in">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="font-bold text-slate-800 text-lg">Review Details</h2>
          <p className="text-xs text-slate-500">ID: {review.id}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 font-bold">&times;</button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 overflow-y-auto flex-1">
        {/* Trekker Info */}
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Trekker</span>
          <p className="text-base font-semibold text-slate-800">{review.trekker_name || "Anonymous User"}</p>
        </div>

        {/* Individual Scores */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Package Score</span>
            <span className="text-lg font-bold text-amber-500">★ {review.rating}/5</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Guide Score</span>
            <span className="text-lg font-bold text-blue-500">★ {review.guide_rating || "N/A"}/5</span>
          </div>
        </div>

        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Review Message</span>
          <h4 className="font-bold text-slate-800 mt-1">{review.title}</h4>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-lg border italic">
            {review.text}
          </p>
        </div>

        {isFlagged && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
            <strong>⚠️ Flagged as {flagData?.reason}:</strong> {flagData?.notes || "No extra context added."}
          </div>
        )}

        <form onSubmit={submitResponse} className="space-y-3 pt-4 border-t border-slate-100">
          <label className="text-xs uppercase font-bold tracking-wider text-slate-400 block">
            Public Dashboard Response
          </label>
          <textarea
            className="w-full h-24 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            placeholder="Type your official agency response here..."
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg text-sm hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Post Response
            </button>
            {!isFlagged && (
              <button
                type="button"
                onClick={() => setShowFlagModal(true)}
                className="bg-red-50 text-red-600 font-medium py-2 px-4 rounded-lg text-sm border border-red-200 hover:bg-red-100 transition-colors"
              >
                Flag Review
              </button>
            )}
          </div>
        </form>
      </div>

      {showFlagModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base">Flag Review for Review</h3>
            <div>
              <label className="text-xs text-slate-500 block mb-1 font-medium">Select Reason</label>
              <select 
                className="w-full border p-2 rounded-md text-sm text-slate-800"
                value={flagReason} 
                onChange={(e) => setFlagReason(e.target.value)}
              >
                <option value="Inappropriate">Inappropriate Content</option>
                <option value="Fake/Spam">Fake / Spam Entry</option>
                <option value="Other">Other Issues</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1 font-medium">Internal Notes</label>
              <textarea 
                className="w-full border p-2 rounded-md text-xs text-slate-800 h-16"
                placeholder="Describe why this review violates policies..."
                value={flagNotes}
                onChange={(e) => setFlagNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button onClick={() => setShowFlagModal(false)} className="text-slate-500 px-3 py-1.5 hover:bg-slate-100 rounded">Cancel</button>
              <button onClick={submitFlag} className="bg-red-600 text-white px-4 py-1.5 rounded hover:bg-red-700 shadow-sm">Confirm Flag</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}