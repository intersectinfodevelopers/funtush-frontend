"use client";

import { useEffect, useState } from "react";
import galleryData from "../../data/gallery.json";

export interface GalleryImage {
  id: string;
  images: string[];
  featuredImage: string;
  title: string;
  description: string;
  category: string;
  likes: number;
  views: number;
  status: "published" | "draft";
  order: number;
}
export type NewGalleryImage = Omit<
  GalleryImage,
  "id" | "featuredImage" | "likes" | "views" | "order"
>;

const STORAGE_KEY = "funtush-gallery";
type LegacyGalleryImage = Partial<GalleryImage> & { image?: string };

const normalizeGallery = (items: LegacyGalleryImage[]): GalleryImage[] =>
  items.map((item, index) => {
    const images = (
      item.images?.length ? item.images : item.image ? [item.image] : []
    ).slice(0, 5);
    return {
      id: item.id || `g-${String(index + 1).padStart(3, "0")}`,
      images,
      featuredImage: images.includes(item.featuredImage || "")
        ? (item.featuredImage as string)
        : images[0] || "",
      title: item.title || "Untitled gallery post",
      description: item.description || "",
      category: item.category || "Other",
      likes: item.likes || 0,
      views: item.views || 0,
      status: item.status === "draft" ? "draft" : "published",
      order: item.order || index + 1,
    };
  });

const initialGallery = normalizeGallery(galleryData as LegacyGalleryImage[]);

export function useGallery() {
  const [gallery, setGallery] = useState<GalleryImage[]>(() => {
    try {
      const storedGallery = localStorage.getItem(STORAGE_KEY);
      if (storedGallery)
        return normalizeGallery(
          JSON.parse(storedGallery) as LegacyGalleryImage[],
        );
    } catch (error) {
      console.error("Failed to load gallery", error);
    }
    return initialGallery;
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoaded(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gallery));
    } catch (error) {
      console.error("Failed to save gallery:", error);
    }
  }, [gallery, isLoaded]);

  const getGallery = () => gallery;
  const getImage = (id: string) => gallery.find((item) => item.id === id);
  const addImage = (data: NewGalleryImage) => {
    const images = data.images.slice(0, 5);
    const newImage: GalleryImage = {
      ...data,
      images,
      featuredImage: images[0] || "",
      id: generateId(gallery),
      likes: 0,
      views: 0,
      order: gallery.length + 1,
    };
    setGallery((current) => [...current, newImage]);
    return newImage;
  };
  const updateImage = (id: string, data: Partial<GalleryImage>) =>
    setGallery((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const images = (data.images ?? item.images).slice(0, 5);
        const preferredFeatured = data.featuredImage ?? item.featuredImage;
        return {
          ...item,
          ...data,
          images,
          featuredImage: images.includes(preferredFeatured)
            ? preferredFeatured
            : images[0] || "",
        };
      }),
    );
  const deleteImage = (id: string) =>
    setGallery((current) =>
      current
        .filter((item) => item.id !== id)
        .map((item, index) => ({ ...item, order: index + 1 })),
    );

  return {
    gallery,
    getGallery,
    getImage,
    addImage,
    updateImage,
    deleteImage,
    isLoaded,
  };
}

function generateId(gallery: GalleryImage[]) {
  const highest = gallery.reduce(
    (max, item) => Math.max(max, Number(item.id.match(/^g-(\d+)$/)?.[1] || 0)),
    0,
  );
  return `g-${String(highest + 1).padStart(3, "0")}`;
}
