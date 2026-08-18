'use client';

import { getAgencyData } from '@/lib/agency/getAgencyData';
import ChartWave2 from './ChartWave2';
import ChartWave3 from './ChartWave3';

import { TrendingUp } from 'lucide-react';

type Props = {
  agencyId: string;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function SummarizedResult({ agencyId }: Props) {
  const { bookings, income } = getAgencyData(agencyId);
  const totalBookings = bookings.length;
  const revenue = income.reduce((sum, item) => sum + item.amount, 0);
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length ?? 0;
  const inquiry = bookings.filter((b) => b.status === 'inquiry').length;

  const topStats = [
    {
      header: 'Total Bookings',
      quantity: totalBookings,
      sub: '12.01%',
      comparedTo: 'Compared to last month',
      iconColor: '#FF4747',
    },
    {
      header: 'Revenue',
      quantity: `${revenue / 1000} K`,
      sub: '8.0%',
      comparedTo: 'Compared to last month',
      iconColor: '#34C759',
    },
    {
      header: 'conversion Rate',
      quantity: inquiry > 0 ? (confirmedBookings / inquiry) * 100 : 0,
      sub: '8.3%',
      comparedTo: 'Compared to last month',
      iconColor: '#7256FE',
    },
  ];

  const sideStats = [
    {
      time: 'Last Week 1-7 aug',
      amount: 7000,
    },
    {
      time: 'Day after Last Week',
      amount: 5400,
    },
  ];

  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-lg font-medium">Summarized Result</h2>
      <div className="w-full flex gap-3 justify-between">
        {topStats.map((item) => (
          <div key={item.header} className="flex-1 flex flex-col px-8.5 py-8 bg-white rounded-sm">
            <h3 className="text-[10px] font-medium">{item.header}</h3>
            <div className="flex items-end gap-1">
              <p className="text-2xl font-semibold">{item.quantity}</p>
              <div className="flex gap-1 text-[#71DD8C]">
                <TrendingUp size={13} />
                <p className="text-[8px]">{item.sub}</p>
              </div>
            </div>
            <p className="text-[10px]">{item.comparedTo}</p>

            <div className="ml-4.5">
              <ChartWave2 color={item.iconColor} />
              <div className="flex justify-between">
                {MONTHS.map((month) => (
                  <span key={month} className="flex-1 text-[8px] text-neutral-500">
                    {month}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-9">
        <div className="flex flex-col gap-3 bg-white p-2.5 rounded-lg">
          <div className="flex items-center gap-2 bg-[#FFFAFA] p-2">
            <div className="ml-4 w-1/2 flex flex-col font-semibold">
              <h3 className="text-xl">Gross Profit</h3>
              <div className="flex items-end gap-1">
                <p className="text-2xl">{revenue.toLocaleString()}</p>
                <div className="flex gap-1 text-[#71DD8C]">
                  <TrendingUp size={13} />
                  <p className="text-[10px]">8.3%</p>
                </div>
              </div>
            </div>
            <div className="flex gap-5">
              <select
                name="weeks"
                id="weeks"
                defaultValue="weekly"
                className="rounded border border-black px-[4px] py-[5px] text-base outline-none hover:text-red-700 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500"
              >
                <option value="weekly">Weekly</option>
              </select>
              <button className="text-base">Export</button>
            </div>
          </div>
          <div>
            <ChartWave3 />
            <div className="flex justify-between">
              {MONTHS.map((month) => (
                <span key={month} className="flex-1 text-[8px] text-neutral-500">
                  {month}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-x-8 font-medium text-base text-[#615B5B] mt-8">
            <p className="p-2.5">
              <span>-</span>Actual
            </p>
            <p className="p-2.5">
              <span>-</span>Expected
            </p>
          </div>
        </div>
        <div className="flex flex-col bg-white p-2.5">
          <h3 className="text-xl font-semibold mb-2.5">Comparison</h3>
          {sideStats.map((item) => (
            <div key={item.time}>
              <div>
                <h4 className="text-base font-semibold">{item.time}</h4>
                <p className="text-xl font-semibold">{item.amount}</p>
              </div>
              <div className="relative bottom-15 ">
                <ChartWave3 strokeWidth={1.5} />
                <div className="flex justify-between">
                  {MONTHS.map((month) => (
                    <span key={month} className="flex-1 text-[8px] text-neutral-500">
                      {month}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
