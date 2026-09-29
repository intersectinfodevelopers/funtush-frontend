'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getDestination, listDestinations, type DestinationListParams } from '@/lib/api/agency/destinations';

export const useDestinationList = (p: DestinationListParams) => useQuery({ queryKey: ['agency', 'destinations', 'list', p], queryFn: () => listDestinations(p), placeholderData: keepPreviousData });
export const useDestination = (id: string) => useQuery({ queryKey: ['agency', 'destination', id], queryFn: () => getDestination(id), enabled: Boolean(id) });
