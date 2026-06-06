/**
 * Trekker My Treks Page
 * Upcoming and past treks
 */

export default function MyTreksPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">My Treks</h2>
        <p className="mt-1 text-neutral-600">View your upcoming and past trekking adventures</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-neutral-200">
        <button className="border-b-2 border-primary-600 px-4 py-2 font-medium text-primary-600">
          Upcoming
        </button>
        <button className="px-4 py-2 font-medium text-neutral-600 hover:text-neutral-900">
          Past
        </button>
      </div>

      {/* Trek List Placeholder */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center">
        <p className="text-neutral-600">No upcoming treks</p>
      </div>
    </div>
  );
}
