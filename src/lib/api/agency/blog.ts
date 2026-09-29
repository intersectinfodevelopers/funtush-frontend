import { api } from '../client';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  displayOrder: number;
  isActive: boolean;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryStats { total: number; active: number; inactive: number; totalBeforeMonth: number }
export type CategoryDetail = BlogCategory;
export interface CategoryInput { name: string; slug: string; description?: string; color: string; displayOrder: number; isActive: boolean }

export interface BlogPost {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | null;
  tags: string[];
  photos: string[];
  publishAt: string | null;
  authorName: string | null;
  views: number;
  createdAt: string;
  category: { id: string; name: string } | null;
}

/** A photo the agency has previously uploaded through the blog form — reused by "Add from Gallery"
 * so the same image doesn't need to be uploaded again for a later post. */
export interface BlogPhotoLibraryItem {
  id: string;
  url: string;
  title: string;
  createdAt: string;
}

// GET /agencies/me/categories → { success, count, data, stats }
export const listCategoriesWithStats = () => api.get<{ success: boolean; data: BlogCategory[]; stats: CategoryStats }>('/agencies/me/categories');
export const listCategories = async () => (await listCategoriesWithStats()).data;
export const getCategory = async (id: string) => (await api.get<{ success: boolean; data: CategoryDetail }>(`/agencies/me/categories/${id}`)).data;
export const createCategory = (input: CategoryInput) => api.post<{ success: boolean; data: BlogCategory }>('/agencies/me/categories', input);
export const updateCategory = (id: string, input: Partial<CategoryInput>) => api.patch<{ success: boolean; data: BlogCategory }>(`/agencies/me/categories/${id}`, input);
export const deleteCategory = (id: string) => api.delete(`/agencies/me/categories/${id}`);

// GET /agencies/me/blogs → { success, count, data, meta }
export const listBlogs = (params: { page?: number; limit?: number } = {}) =>
  api.get<{ success: boolean; data: BlogPost[]; meta: { total: number; page: number; limit: number; pages: number } }>('/agencies/me/blogs', { params });

export interface BlogInput {
  title: string;
  subtitle: string;
  content: string;
  categoryId: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  tags?: string[];
  /** Required when status is SCHEDULED: an ISO datetime in the future. */
  publishAt?: string | null;
  /** New image files to upload (multipart field "photos"). */
  files?: File[];
  /** Existing photo URLs to keep. Omit to leave photos untouched (create ignores this). */
  keepPhotos?: string[];
  /** Photos picked from the agency's blog photo library (already-uploaded URLs) rather than newly uploaded. */
  photoUrls?: string[];
}

function toForm(i: Partial<BlogInput>): FormData {
  const f = new FormData();
  (['title', 'subtitle', 'content', 'categoryId', 'status'] as const).forEach((k) => {
    if (i[k] !== undefined) f.append(k, i[k] as string);
  });
  if (i.publishAt !== undefined) f.append('publishAt', i.publishAt ?? '');
  if (i.tags !== undefined) f.append('tags', JSON.stringify(i.tags));
  if (i.keepPhotos !== undefined) f.append('keepPhotos', JSON.stringify(i.keepPhotos));
  if (i.photoUrls !== undefined) f.append('photoUrls', JSON.stringify(i.photoUrls));
  (i.files ?? []).forEach((file) => f.append('photos', file));
  return f;
}

export const createBlog = async (input: BlogInput) => (await api.upload<{ success: boolean; data: BlogPost }>('/agencies/me/blogs', toForm(input))).data;
export const updateBlog = async (id: string, input: Partial<BlogInput>) => (await api.upload<{ success: boolean; data: BlogPost }>(`/agencies/me/blogs/${id}`, toForm(input), 'patch')).data;
export const deleteBlog = (id: string) => api.delete(`/agencies/me/blogs/${id}`);

// GET /agencies/me/blogs/photo-library → { success, items, total, page, limit }
export const listBlogPhotoLibrary = (params: { search?: string; page?: number; limit?: number } = {}) =>
  api.get<{ success: boolean; items: BlogPhotoLibraryItem[]; total: number; page: number; limit: number }>('/agencies/me/blogs/photo-library', { params });
