"use client";
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ReviewItem } from '@/app/(agency)/dashboard/reviews/page';

interface ReviewAnalyticsProps {
  reviews: ReviewItem[];
}

export function ReviewAnalytics({ reviews }: ReviewAnalyticsProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
  const timer = setTimeout(() => {
    setHasMounted(true);
  }, 0);
  return () => clearTimeout(timer);
}, []);

  const distribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    return {
      name: `${stars} Star`,
      count: count
    };
  });

  const trendData = (() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d.toLocaleString('en-US', { month: 'short' }));
    }

    return months.map(monthName => {
      const monthlyReviews = reviews.filter(r => {
        const dateString = r.date || r.created_at;
        if (!dateString) return false;
        const reviewMonth = new Date(dateString).toLocaleString('en-US', { month: 'short' });
        return reviewMonth === monthName;
      });

      const totalRating = monthlyReviews.reduce((sum, r) => sum + r.rating, 0);
      const average = monthlyReviews.length > 0 
        ? parseFloat((totalRating / monthlyReviews.length).toFixed(1)) 
        : 4.5; 

      return {
        month: monthName,
        average: average,
        count: monthlyReviews.length
      };
    });
  })();

  
  if (!hasMounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-60 bg-slate-50/50 rounded-xl border border-slate-200/60 animate-pulse" />
        <div className="h-60 bg-slate-50/50 rounded-xl border border-slate-200/60 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm min-w-0">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Rating Distribution</h3>
        <div className="h-48 w-full text-xs" style={{ minHeight: '192px', minWidth: '100%' }}>
          <ResponsiveContainer width="100%"  minHeight={192}>
            <BarChart data={distribution} layout="vertical" margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm min-w-0">
        <h3 className="text-sm font-bold text-slate-700 mb-4">6-Month Rating Trend</h3>
        <div className="h-48 w-full text-xs" style={{ minHeight: '192px', minWidth: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis domain={[1, 5]} stroke="#94a3b8" />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="average" 
                stroke="#0284c7" 
                strokeWidth={2.5} 
                dot={{ r: 4, fill: '#0284c7' }}
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}