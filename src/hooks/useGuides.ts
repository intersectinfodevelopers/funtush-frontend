'use client';
import { useState, useEffect } from "react";
import guidesData from "../../data/guides.json";

interface Certification {
    name: string;
    issuingBody?: string;
    number: string;
    expiry: string;
    document?: string;
}

interface Guide {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    photo?: string;
    bio?: string;
    languages: string[];
    certifications: Certification[];
    status: string;
    rating: number;
    totalTreks?: number;
    upcomingAssignments?: {
        id: string;
        title?: string;
        date?: string;
        status?: string;
    }[];
}

export type NewGuide = Omit<Guide, 'id'>;

export function useGuides() {
    const [guides, setGuides] = useState<Guide[]>(() => {
        if (typeof window === 'undefined') {
            return guidesData;
        }

        const stored = localStorage.getItem('guides');
        if(stored) {
            return JSON.parse(stored);
        }

        return guidesData;
    });

    //save to localStorage
    useEffect(() => {
        localStorage.setItem('guides', JSON.stringify(guides));
    },[guides]);

    const addGuide = (newGuide: NewGuide) => {
        const id = `gd-${Date.now()}`;
        const guideWithId = { ...newGuide, id};
        setGuides([...guides, guideWithId]);
    };

    return { guides, addGuide};
}
