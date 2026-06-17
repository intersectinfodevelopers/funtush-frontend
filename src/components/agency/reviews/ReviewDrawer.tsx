"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui";

type Review = {
  id: string;
  package_id: string;
  trekker_id: string;
  rating: number;
  title: string;
  text: string;
  date: string;
  country: string;
  guide_name?: string;
  guide_rating?: number;
  photos?: string[];
};

type ResponseMap = {
  [reviewId: string]: string;
};

type FlagData = {
  reason: "Inappropriate" | "Fake" | "Spam" | "Other";
  note: string;
  status: "flagged";
  createdAt: string;
};

interface Props {
  open: boolean;
  review: Review | null;
  onClose: () => void;
}

export default function ReviewDrawer({ open, review, onClose }: Props) {
  const [responseText, setResponseText] = useState("");
  const [responses, setResponses] = useState<ResponseMap>({});

  const [flagOpen, setFlagOpen] = useState(false);
  const [flagReason, setFlagReason] =
    useState<FlagData["reason"]>("Spam");
  const [flagNote, setFlagNote] = useState("");

  const [flags, setFlags] = useState<Record<string, FlagData>>({});

  useEffect(() => {
    const savedResponses = localStorage.getItem("responses");
    if (savedResponses) setResponses(JSON.parse(savedResponses));

    const savedFlags = localStorage.getItem("flags");
    if (savedFlags) setFlags(JSON.parse(savedFlags));
  }, []);

  if (!review) return null;

  const saveResponse = () => {
    const updated = {
      ...responses,
      [review.id]: responseText,
    };

    setResponses(updated);
    localStorage.setItem("responses", JSON.stringify(updated));
    setResponseText("");
  };

  const submitFlag = () => {
    const updated: Record<string, FlagData> = {
      ...flags,
      [review.id]: {
        reason: flagReason,
        note: flagNote,
        status: "flagged",
        createdAt: new Date().toISOString(),
      },
    };

    setFlags(updated);
    localStorage.setItem("flags", JSON.stringify(updated));

    setFlagOpen(false);
    setFlagNote("");
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed right-0 top-0 h-full w-[420px] bg-white shadow-xl transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 space-y-4">

          <Button
            onClick={onClose}
            className="absolute top-3 left-3"
          >
            ✕
          </Button>

          <h2 className="text-xl font-semibold text-gray-800">
            {review.title}
          </h2>

          <p className="text-gray-600">{review.text}</p>

          {review.guide_rating && (
            <div className="border rounded p-3">
              <h3 className="font-semibold">Guide Info</h3>
              <p>Guide: {review.guide_name}</p>

              <p className="text-yellow-500">
                {review.guide_rating
                  ? "⭐".repeat(review.guide_rating)
                  : "No rating"}
              </p>
            </div>
          )}

          {review.photos?.length ? (
            <div>
              <h3 className="font-semibold mb-2">Photos</h3>

              <div className="flex gap-2 flex-wrap">
                {review.photos.map((photo, i) => (
                  <img
                    key={i}
                    src={photo}
                    className="w-16 h-16 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          ) : null}

          <textarea
            className="w-full border rounded p-2"
            placeholder="Write response..."
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
          />

          <Button
            className="bg-blue-600 text-white"
            onClick={saveResponse}
          >
            Save Response
          </Button>

          {responses[review.id] && (
            <div className="bg-gray-100 p-2 rounded text-gray-500">
              <p className="font-semibold text-sm">
                Previous Response:
              </p>
              <p className="text-sm">{responses[review.id]}</p>
            </div>
          )}

          <Button
            className="bg-red-600 text-white text-gray-500"
            onClick={() => setFlagOpen(true)}
          >
            Flag Review
          </Button>

          {flagOpen && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center text-gray-500">
              <div className="bg-white p-4 rounded w-[300px] space-y-3">

                <h2 className="font-bold">Flag Review</h2>

                <select
                  className="w-full border p-2"
                  value={flagReason}
                  onChange={(e) =>
                    setFlagReason(e.target.value as any)
                  }
                >
                  <option>Inappropriate</option>
                  <option>Fake</option>
                  <option>Spam</option>
                  <option>Other</option>
                </select>

                <textarea
                  className="w-full border p-2 text-gray-900"
                  placeholder="Add notes..."
                  value={flagNote}
                  onChange={(e) => setFlagNote(e.target.value)}
                />

                <div className="flex gap-2">
                  <Button
                    className="bg-gray-500 text-white"
                    onClick={() => setFlagOpen(false)}
                  >
                    Cancel
                  </Button>

                  <Button
                    className="bg-blue-600 text-white"
                    onClick={submitFlag}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          )}

          {flags[review.id] && (
            <div className="bg-red-50 p-2 rounded text-gray-500">
              <p className="text-red-600 font-semibold">
                Flagged: {flags[review.id].reason}
              </p>
              <p className="text-xs">
                {flags[review.id].note}
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}