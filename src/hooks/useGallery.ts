"use client";

import { useEffect, useState } from "react";
import galleryData from "../../data/gallery.json"

export interface GalleryImage{
    id: string;
    image: string;
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
    "id" | "likes" | "views" | "order"
    >;

const STORAGE_KEY = "funtush-gallery";

const initialGallery = galleryData as GalleryImage[];

export function useGallery(){
    const[gallery, setGallery] = useState<GalleryImage[]>(initialGallery);

    const [isLoaded, setIsLoaded] = useState(false);

    //load gallery from localStorage
    useEffect(()=> {
        try{
            const storedGallery = localStorage.getItem(STORAGE_KEY);

            if(storedGallery){
                const parsedGallery = JSON.parse(
                    storedGallery,
                ) as GalleryImage[];

                setGallery(parsedGallery);
            }
        }catch(error){
            console.error("Failed to load gallery", error);
        }finally{
            setIsLoaded(true);
        }
    }, []);

    //save gallery whenever it changes
    useEffect(() => {
        if(!isLoaded) return;

        try{
            localStorage.setItem(
                STORAGE_KEY, 
                JSON.stringify(gallery)
            );
        }catch(error){
            console.error("Failed to save gallery:", error);
        }
    }, [gallery, isLoaded]);

    //Get all gallery images
    const getGallery = () => {
        return gallery;
    };

    //Get one image by ID
    const getImage = (id: string) => {
        return gallery.find((item) => item.id ===id);
    };

    //Add a new image
    const addImage = (data: NewGalleryImage) => {
        const newImage: GalleryImage ={
            ...data,
            id: generateId(gallery),
            likes: 0,
            views: 0,
            order: gallery.length + 1 
        };

        setGallery((current) => [...current, newImage]);
        return newImage;
    };

    //Update an existing image
    const updateImage = (
        id: string,
        data: Partial<GalleryImage>,
    ) => {
        setGallery((current) =>
        current.map((item)=>
        item.id === id ? {
            ...item, 
            ...data,
        }
    :item,),);
    };

    //delete an image
    const deleteImage = (id: string) => {
        setGallery((current) => {
            const filtered = current.filter(
                (item) => item.id !== id,
            );

            return filtered.map((item, index) => ({
                ...item,
                order: index + 1
            }));
        });
    };

    return{
        gallery,
        getGallery,
        getImage,
        addImage,
        updateImage,
        deleteImage,
        isLoaded,
    };

    function generateId(gallery: GalleryImage[]) {
        const numbers = gallery
        .map((item) => {
            const match = item.id.match(/^g-(\d+)$/);
            return match ? Number(match[1]) : 0;
        })
        .filter((number) => number > 0);

        const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

        return `g-${String(nextNumber).padStart(3, "0")}`;
    }
}