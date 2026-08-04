"use client";

// import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Calendar, Users,BarChart2,PlusSquare, FileText, Activity, Download } from 'lucide-react';
// import bookings from '../../../../data/bookings.json';
// import packages from '../../../../data/packages.json';
import finance from '../../../../data/finance.json';

/**
 * Dark-mode Agency Dashboard (visual parity with provided image)
 */

const agencyId = 'ag-001';
const isAgencyData = (agency_id: string) => agency_id === agencyId;

export default function AgencyDashboardPage() {
  // const router = useRouter();

  // const totalPackages = useMemo(
  //   () => packages.filter((pkg) => isAgencyData(pkg.agency_id)).length,
  //   []
  // );

  // const totalBookings = useMemo(
  //   () => bookings.filter((b) => isAgencyData(b.agency_id)).length,
  //   []
  // );

  const revenue = useMemo(
    () =>
      finance.income
        .filter((item) => isAgencyData(item.agency_id))
        .reduce((sum, item) => sum + item.amount, 0),
    []
  );

  const recentActivity = [
    { id: 1, title: 'John published a new blog', time: '10 min ago' },
    { id: 2, title: 'Invoice #INV-1456 paid', time: '15 min ago' },
    { id: 3, title: 'New client onboarded - TeachCorp', time: '1 hour ago' },
    { id: 4, title: 'Facebook Ads campaign started', time: '2 hours ago' },
  ];

  // const handleLogout = () => {
  //   document.cookie = 'authToken=; path=/; max-age=0';
  //   router.push('/login');
  // };

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">Dashboard</p>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-slate-100">Agency Dashboard</h1>
            <p className="text-sm leading-6 text-neutral-600 dark:text-slate-300">Overview of agency metrics and activities — matching packages layout.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 shadow-sm">
            <Download className="h-4 w-4 text-current" />
            Import
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 shadow-sm">
            <PlusSquare className="h-4 w-4 text-current" />
            Create
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5 text-indigo-300" />} label="Total Revenue" value={`$${revenue.toLocaleString()}`} sub="+12%" />
        <StatCard icon={<BarChart2 className="h-5 w-5 text-pink-300" />} label="Visitors" value="14,560" sub="+1.5%" />
        <StatCard icon={<FileText className="h-5 w-5 text-emerald-300" />} label="Blog" value="148" sub="+5.5%" />
        <StatCard icon={<Calendar className="h-5 w-5 text-sky-300" />} label="Clients" value="86" sub="+1.5%" />
      </div>

      {/* Main grid */}
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 space-y-4">
          <div className="rounded-xl bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 p-4">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-slate-200">Revenue Overview</h3>
            <div className="mt-4 h-40 w-full bg-neutral-50 dark:bg-slate-700 rounded-md" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 p-4">
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-slate-200">Traffic Sources</h4>
              <div className="mt-3 flex items-center gap-4">
                <div className="h-24 w-24 rounded-full bg-neutral-100 dark:bg-slate-700" />
                <div className="flex-1 space-y-2 text-sm text-neutral-700 dark:text-slate-300">
                  <div>Organic Search <span className="float-right text-neutral-900 dark:text-slate-100">54,678</span></div>
                  <div>Social Media <span className="float-right text-neutral-900 dark:text-slate-100">25,678</span></div>
                  <div>Direct <span className="float-right text-neutral-900 dark:text-slate-100">3,240</span></div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 p-4">
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-slate-200">Recent Activity</h4>
              <ul className="mt-3 space-y-2 text-sm text-neutral-700 dark:text-slate-300">
                {recentActivity.map((a) => (
                  <li key={a.id} className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-slate-100">{a.title}</div>
                      <div className="text-xs text-neutral-500 dark:text-slate-400">{a.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-slate-200">Live Visitors</h4>
              <div className="text-sm text-neutral-700 dark:text-slate-300">145</div>
            </div>
            <div className="mt-3 h-40 w-full bg-neutral-50 dark:bg-slate-700 rounded-md" />
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 p-4">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-slate-200">Quick Actions</h4>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <ActionButton icon={<PlusSquare className="h-5 w-5" />} label="Add Blog" />
              <ActionButton icon={<FileText className="h-5 w-5" />} label="New Invoice" />
              <ActionButton icon={<Activity className="h-5 w-5" />} label="Add Income" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-slate-800 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700">{icon}</div>
          <div>
            <div className="text-sm text-slate-300">{label}</div>
            <div className="mt-1 text-xl font-bold text-slate-100">{value}</div>
          </div>
        </div>
        <div className="text-sm text-slate-400">{sub}</div>
      </div>
    </div>
  );
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex flex-col items-center justify-center gap-2 rounded-lg bg-slate-700 px-3 py-3 text-xs text-slate-100 hover:bg-slate-600">
      <div>{icon}</div>
      <div className="text-[11px]">{label}</div>
    </button>
  );
}
