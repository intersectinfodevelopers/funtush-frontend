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
        <h2 className="font-medium text-lg">Trekker Origin & Package Performance</h2>
      </div>
      <div className="rounded-lg">
        <div className="grid grid-cols-7 justify-items-center p-2.5 bg-[#6B77A4]">
          {header.map((item) => (
            <p key={item} className="text-base font-medium text-white">
              {item}
            </p>
          ))}
        </div>
        <div>
          {data.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-7 justify-items-center items-center p-2.5 border border-[#D9D9D9]"
            >
              <p className="text-base font-medium">{item.id}</p>
              <p>{item.country}</p>
              <p>{item.package}</p>
              <p>{item.bookings}</p>
              <p>{item.revenue}</p>
              <p>{item.avgValue}</p>
              <p>{item.lastBooking}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
