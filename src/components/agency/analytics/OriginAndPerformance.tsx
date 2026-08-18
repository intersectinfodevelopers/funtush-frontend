'use client';

const header = ['No', 'Country', 'Package', 'Bookings', 'Revenue(Net)', 'Avg Value', 'Last Booking'];
const data = [
  {
    id: 1,
    country: 'Germany',
    package: 'ABC Trek 14D',
    bookings: 7,
    revenue: 550,
    avgValue: 50,
    lastBooking: 'Jun 10, 2026',
  },
  {
    id: 2,
    country: 'USA',
    package: 'EBC Trek 12D',
    bookings: 5,
    revenue: 0,
    avgValue: 200,
    lastBooking: 'Jun 8, 2026',
  },
  {
    id: 3,
    country: 'France',
    package: 'EBC Trek 12D',
    bookings: 4,
    revenue: 800,
    avgValue: 200,
    lastBooking: 'Jun 7, 2026',
  },
];

export default function OriginAndPerformance() {
  return (
    <section>
      <div className="mb-2">
        <h2 className="text-2xl font-semibold text-neutral-900">Trekker Origin & Package Performance</h2>
        <p className="text-sm leading-6 text-neutral-600">Origin breakdown and package performance for recent bookings.</p>
      </div>

      <section className="overflow-x-auto border-t border-neutral-200 bg-white rounded-lg">
        <table className="min-w-full border-collapse text-left text-sm text-neutral-700">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
            <tr>
              {header.map((item) => (
                <th key={item} className="px-4 py-3">
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-700">{item.id}</td>
                <td className="px-4 py-3 text-neutral-900">{item.country}</td>
                <td className="px-4 py-3 text-neutral-700">{item.package}</td>
                <td className="px-4 py-3 text-neutral-700">{item.bookings}</td>
                <td className="px-4 py-3 text-neutral-700">{item.revenue}</td>
                <td className="px-4 py-3 text-neutral-700">{item.avgValue}</td>
                <td className="px-4 py-3 text-neutral-700">{item.lastBooking}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  );
}
