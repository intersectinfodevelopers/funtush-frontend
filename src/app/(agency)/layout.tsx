import AgencySidebar from '@/components/agency/AgencySidebar';
import DashboardTopbar from '@/components/agency/DashboardTopbar';

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#F2F2F7]">
      {/* Sidebar */}
      <AgencySidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <DashboardTopbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
