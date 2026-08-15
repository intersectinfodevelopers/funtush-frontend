'use client';

import { Check, Calendar, User, DollarSign, RefreshCw, AlertTriangle } from 'lucide-react';

type Activity = {
  time: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
};

const activities: Activity[] = [
  { time: '09:15 AM', title: 'New booking inquiry', description: 'EBC Trek – 14 Days', icon: Check, iconBg: 'bg-green-100', iconColor: 'text-green-500' },
  { time: '10:15 AM', title: 'Booking confirmed', description: 'Annapurna Circuit', icon: Calendar, iconBg: 'bg-blue-100', iconColor: 'text-blue-500' },
  { time: '10:15 AM', title: 'Guide assigned', description: 'Bishal Tamang', icon: User, iconBg: 'bg-indigo-100', iconColor: 'text-indigo-500' },
  { time: '11:15 AM', title: 'Payment received', description: '$1,456 from Daniel S.', icon: DollarSign, iconBg: 'bg-green-100', iconColor: 'text-green-500' },
  { time: '12:30 PM', title: 'Package updated', description: 'Gokyo Lakes Trek', icon: RefreshCw, iconBg: 'bg-orange-100', iconColor: 'text-orange-500' },
  { time: '01:10 PM', title: 'SOS alert triggered', description: 'EBC Trek – Guided', icon: AlertTriangle, iconBg: 'bg-red-100', iconColor: 'text-red-500' },
];

export default function RecentActivity() {
  return (
    <section className="rounded-lg bg-white p-3 shadow-sm md:p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold sm:text-base">Recent Activity</h2>
        <button className="text-[11px] font-medium text-violet-600 hover:text-violet-800 sm:text-xs">
          View all activity
        </button>
      </div>

      <div className="flex items-start gap-6 overflow-x-auto pb-2">
        {activities.map((activity, i) => (
          <div key={`${activity.title}-${i}`} className="flex shrink-0 items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activity.iconBg} ${activity.iconColor}`}>
              <activity.icon size={18} />
            </div>
            <div className="min-w-[120px] text-[11px] font-medium sm:text-xs">
              <p className="mb-1 text-neutral-500">{activity.time}</p>
              <p className="whitespace-nowrap text-neutral-900">{activity.title}</p>
              <p className="mt-1 whitespace-nowrap text-neutral-500">{activity.description}</p>
            </div>
            {i < activities.length - 1 && <div className="mt-5 h-px w-8 shrink-0 bg-neutral-300" />}
          </div>
        ))}
      </div>
    </section>
  );
}