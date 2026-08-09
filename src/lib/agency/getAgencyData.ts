import agencies from '@/../data/agencies.json';
import bookings from '@/../data/bookings.json';
import finance from '@/../data/finance.json';
import packages from '@/../data/packages.json';

export function getAgencyData(agencyId: string) {
  return {
    agencies: agencies.filter((item) => item.id === agencyId),
    bookings: bookings.filter((item) => item.agency_id === agencyId),
    expense: finance.expenses.filter((item) => item.agency_id === agencyId),
    income: finance.income.filter((item) => item.agency_id === agencyId),
    packages: packages.filter((item) => item.agency_id === agencyId),
  };
}
