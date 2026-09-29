'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getGalleryPost, getVideo, listGallery, listVideos, type MediaListParams } from '@/lib/api/agency/media';

export const useGalleryList = (p: MediaListParams) => useQuery({ queryKey: ['agency', 'gallery', 'list', p], queryFn: () => listGallery(p), placeholderData: keepPreviousData });
export const useGalleryPost = (id: string) => useQuery({ queryKey: ['agency', 'gallery', 'one', id], queryFn: () => getGalleryPost(id), enabled: Boolean(id) });
export const useVideoList = (p: MediaListParams) => useQuery({ queryKey: ['agency', 'videos', 'list', p], queryFn: () => listVideos(p), placeholderData: keepPreviousData });
export const useVideo = (id: string) => useQuery({ queryKey: ['agency', 'videos', 'one', id], queryFn: () => getVideo(id), enabled: Boolean(id) });
