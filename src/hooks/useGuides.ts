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
        if (typeof window === 'undefined') return guidesData;

        try {
            const stored = localStorage.getItem('guides');
            return stored ? (JSON.parse(stored) as Guide[]) : guidesData;
        } catch {
            return guidesData;
        }
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('guides', JSON.stringify(guides));
    }, [guides]);

    const getGuide = (id: string) => guides.find((guide) => guide.id === id);

    const addGuide = (newGuide: NewGuide) => {
        const id = `gd-${Date.now()}`;
        const guideWithId = { ...newGuide, id};
        setGuides((current) => [...current, guideWithId]);
    };

    const updateGuide = (id: string, updatedGuide: Partial<Guide>) => {
        setGuides((current) =>
            current.map((guide) => (guide.id === id ? { ...guide, ...updatedGuide } : guide)),
        );
    };

    return { guides, getGuide, addGuide, updateGuide };
}
