//app/components/agency/dashboard/TopDestinations.tsx
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
    <section className="flex flex-col gap-3 rounded-sm bg-white p-2 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold md:text-[10px] lg:text-xs">Top Destinations</h2>
        <select
          name="months"
          id="months"
          defaultValue="30"
          className="rounded border border-neutral-100 px-[4px] py-[5px] text-[9px] outline-none hover:text-red-700 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500"
        >
          <option value="30">Last 30 days</option>
        </select>
      </div>

      {destinations.map((destination) => (
        <div key={destination.name} className="flex items-center gap-2">
          <span className="w-20 shrink-0 text-[9px] font-medium sm:w-24 md:text-[10px]">{destination.name}</span>

          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-purple-200">
            <div
              className="h-full rounded-full bg-purple-500"
              style={{
                width: `${(destination.value / maxValue) * 100}%`,
              }}
            />
          </div>

          <span className="w-7 text-right text-[9px] font-medium md:text-[10px]">{destination.value}</span>
        </div>
      ))}
    </section>
  );
}
