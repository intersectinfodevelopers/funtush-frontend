'use client';

import CheckIcon from '@mui/icons-material/Check';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import WarningIcon from '@mui/icons-material/Warning';

type Activity = {
  time: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
};

const activities: Activity[] = [
  {
    time: '09:15 AM',
    title: 'New booking inquiry',
    description: 'EBC Trek-14 Days',
    icon: <CheckIcon fontSize="small" />,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-500',
  },
  {
    time: '10:15 AM',
    title: 'Booking Confirmed',
    description: 'Annapurna Circuit',
    icon: <CalendarMonthIcon fontSize="small" />,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
  },
  {
    time: '10:15 AM',
    title: 'Guide assigned',
    description: 'Bishal Tamang',
    icon: <PersonIcon fontSize="small" />,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-500',
  },
  {
    time: '11:15 AM',
    title: 'Payment received',
    description: '$1,456 from Deniel S.',
    icon: <AttachMoneyIcon fontSize="small" />,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-500',
  },
  {
    time: '12:30 AM',
    title: 'Package updated',
    description: 'Gorkyo Lakes Trek',
    icon: <AutorenewIcon fontSize="small" />,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500',
  },
  {
    time: '01:10 AM',
    title: 'SOS Alert Triggered',
    description: 'EBC Trek- Guided',
    icon: <WarningIcon fontSize="small" />,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
  },
];

export default function RecentActivity() {
  return (
    <section className="w-full rounded-lg border border-gray-200 bg-white px-6 py-4">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Recent Activity</h3>

        <button type="button" className="text-sm font-medium text-violet-500 transition-colors hover:text-violet-700">
          View all activity
        </button>
      </div>

      {/* Activity Timeline */}
      <div className="flex w-full items-start overflow-x-auto pb-2">
        {activities.map((activity, index) => (
          <div key={`${activity.title}-${index}`} className="flex min-w-[250px] flex-1 items-start">
            {/* Activity item */}
            <div className="flex min-w-0 flex-1 items-start gap-3">
              {/* Icon */}
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${activity.iconBg} ${activity.iconColor}`}
              >
                {activity.icon}
              </div>

              {/* Text */}
              <div className="min-w-0">
                <p className="mb-1 text-xs font-medium text-gray-500">{activity.time}</p>

                <p className="whitespace-nowrap text-sm font-semibold text-gray-900">{activity.title}</p>

                <p className="mt-1 whitespace-nowrap text-xs font-medium text-gray-500">{activity.description}</p>
              </div>
            </div>

            {/* Connector */}
            {index < activities.length - 1 && (
              <div className="flex items-center pt-8">
                <div className="h-px w-10 bg-gray-300" />

                <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-gray-300" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
