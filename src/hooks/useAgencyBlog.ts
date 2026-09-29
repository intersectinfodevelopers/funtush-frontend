'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getCategory, listBlogPhotoLibrary, listBlogs, listCategoriesWithStats } from '@/lib/api/agency/blog';

export const useBlogs = () => useQuery({ queryKey: ['agency', 'blogs'], queryFn: () => listBlogs({ limit: 100 }) });
export const useCategoryList = () => useQuery({ queryKey: ['agency', 'categories'], queryFn: listCategoriesWithStats });
/** Just the categories (for dropdowns). */
export const useCategories = () => useQuery({ queryKey: ['agency', 'categories'], queryFn: listCategoriesWithStats, select: (r) => r.data });
export const useCategory = (id: string) => useQuery({ queryKey: ['agency', 'category', id], queryFn: () => getCategory(id), enabled: Boolean(id) });

export const useBlogPhotoLibrary = (params: { search?: string; page?: number; limit?: number }) =>
  useQuery({ queryKey: ['agency', 'blog-photo-library', params], queryFn: () => listBlogPhotoLibrary(params), placeholderData: keepPreviousData });
