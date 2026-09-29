import { api } from '../client';

export type PostStatus = 'published' | 'draft';
export type VideoStatus = 'active' | 'inactive';

export interface GalleryPost {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  images: string[];
  featuredImage: string | null;
  status: PostStatus;
  order: number;
  likes: number;
  views: number;
  createdAt: string;
}
export interface GalleryInput {
  title: string;
  description?: string | null;
  category?: string | null;
  images: string[];
  featuredImage?: string | null;
  status?: PostStatus;
}
export interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  thumbnail: string | null;
  status: VideoStatus;
  order: number;
  likes: number;
  views: number;
  createdAt: string;
}
export interface VideoInput {
  title: string;
  description?: string | null;
  youtubeUrl: string;
  status?: VideoStatus;
  order?: number;
}
export interface MediaListParams { status?: string; search?: string; page?: number; limit?: number }
export interface GalleryStats { total: number; published: number; draft: number; totalBeforeMonth: number }
interface Page<T> { success: boolean; items: T[]; total: number; page: number; limit: number }
export interface GalleryPage extends Page<GalleryPost> { stats: GalleryStats }
export interface VideoStats { total: number; active: number; inactive: number }
interface VideoPage extends Page<VideoItem> { stats: VideoStats }

// List → { success, items, total, page, limit }; single → { success, data }; delete → 204.
export const listGallery = (params: MediaListParams = {}) => api.get<GalleryPage>('/agencies/me/gallery', { params });
export const getGalleryPost = async (id: string) => (await api.get<{ data: GalleryPost }>(`/agencies/me/gallery/${id}`)).data;
export const createGalleryPost = async (b: GalleryInput) => (await api.post<{ data: GalleryPost }>('/agencies/me/gallery', b)).data;
export const updateGalleryPost = async (id: string, b: Partial<GalleryInput>) => (await api.patch<{ data: GalleryPost }>(`/agencies/me/gallery/${id}`, b)).data;
export const deleteGalleryPost = (id: string) => api.delete(`/agencies/me/gallery/${id}`);

export const listVideos = (params: MediaListParams = {}) => api.get<VideoPage>('/agencies/me/videos', { params });
export const getVideo = async (id: string) => (await api.get<{ data: VideoItem }>(`/agencies/me/videos/${id}`)).data;
export const createVideo = async (b: VideoInput) => (await api.post<{ data: VideoItem }>('/agencies/me/videos', b)).data;
export const updateVideo = async (id: string, b: Partial<VideoInput>) => (await api.patch<{ data: VideoItem }>(`/agencies/me/videos/${id}`, b)).data;
export const deleteVideo = (id: string) => api.delete(`/agencies/me/videos/${id}`);

/** 11-char id from a watch / youtu.be / shorts / embed link, or null. */
export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1) || null;
    if (u.pathname === '/watch') return u.searchParams.get('v');
    return /^\/(?:embed|shorts)\/([^/]+)/.exec(u.pathname)?.[1] ?? null;
  } catch { return null; }
}
