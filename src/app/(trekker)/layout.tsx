/**
 * Trekker Layout
 */

export default function TrekkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col">
      {/* Top Navigation */}
      <header className="border-b border-neutral-200 bg-white px-6 py-4">
        <h1 className="text-lg font-bold text-neutral-900">My Treks</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
