"use client";
import React from 'react';
import {useMemo,useState} from 'react';
import reviewsData from "../../../../../data/reviews.json";

type Review={
  id:string;
  package_id:string;
  trekker_id:string;
  rating:number;
  title:string;
  text:string;
  date:string;
  country:string;
}


export default function Page() {
  const [ratingFilter,setRatingFilter]=useState<number | "all">("all");
  const [sortBy,setSortBy]=useState("newest");
  const reviews=reviewsData as Review[];

    const filtered = useMemo(() => {
    let data = [...reviews];

    if (ratingFilter !== "all") {
      data = data.filter((r) => r.rating === ratingFilter);
    }

    if (sortBy === "newest") {
      data.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else if (sortBy === "oldest") {
      data.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } else if (sortBy === "lowest") {
      data.sort((a, b) => a.rating - b.rating);
    }

    return data;
  }, [ratingFilter, sortBy, reviews]);

    const stats = useMemo(() => {
    const total = reviews.length;
    const avg =
      total > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
        : 0;

    const fiveStar = reviews.filter((r) => r.rating === 5).length;

    return { total, avg, fiveStar };
  }, [reviews]);


  return (
    <div className="p-6 space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded-xl p-4">
          <p className="text-gray-700 text-sm">Total Reviews</p>
          <p className="text-2xl text-gray-500 font-bold">{stats.total}</p>
        </div>

        <div className="bg-white shadow rounded-xl p-4">
          <p className="text-gray-700 text-sm">Average Rating</p>
          <p className="text-2xl text-gray-500 font-bold">{stats.avg.toFixed(1)} ⭐</p>
        </div>

        <div className="bg-white shadow rounded-xl p-4">
          <p className="text-gray-700 text-sm">5 Star Reviews</p>
          <p className="text-2xl text-gray-500 font-bold">{stats.fiveStar}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <select
          className="border rounded-lg px-3 py-2 text-gray-700"
          onChange={(e) =>
            setRatingFilter(
              e.target.value === "all" ? "all" : Number(e.target.value)
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
          className="border rounded-lg px-3 py-2 text-gray-700"
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-700 text-left">
            <tr>
              <th className="p-3">Package</th>
              <th className="p-3">Trekker</th>
              <th className="p-3">Date</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Review</th>
            </tr>
          </thead>

          <tbody className='text-gray-700'>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-medium">{r.package_id}</td>
                <td className="p-3">{r.trekker_id}</td>
                <td className="p-3">{r.date}</td>
                <td className="p-3 text-yellow-500">
                  {"⭐".repeat(r.rating)}
                </td>
                <td className="p-3">
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-gray-700 text-xs">{r.text}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
