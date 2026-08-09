'use client';

const destinations = [
  { name: 'Everest Region', value: 425 },
  { name: 'Annapurna Region', value: 325 },
  { name: 'Langtang Region', value: 225 },
  { name: 'Manaslu Region', value: 125 },
  { name: 'Upper Mustang', value: 95 },
];

export default function TopDestinations() {
  const maxValue = Math.max(...destinations.map((item) => item.value));

  return (
    <section className="flex flex-col bg-white rounded-lg px-3 py-4 gap-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm leading-xl">Top Destinations</h3>
      </div>
      {destinations.map((destination) => (
        <div key={destination.name} className="flex items-center gap-4">
          <span className="w-28 text-[10px] font-medium">{destination.name}</span>

          <div className="h-1.5 flex-1 rounded-full bg-purple-200">
            <div
              className="h-full rounded-full bg-purple-500"
              style={{
                width: `${(destination.value / maxValue) * 100}%`,
              }}
            />
          </div>

          <span className="w-8 text-right text-[10px] font-medium">{destination.value}</span>
        </div>
      ))}
    </section>
  );
}
