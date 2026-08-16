'use client';
import {  useState, useEffect } from "react";
import guidesData from "../../data/guides.json";

interface Certification {
    name: string;
    issuingBody?: string;
    number: string;
    expiry: string;
    document?: string;
}

export interface Guide {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    sex?: string;
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

const STORAGE_KEY = "guides";
const STORAGE_EVENT = "guides-storage-updated";

const defaultGuides = guidesData as Guide[];
let cachedStoredValue: string | null = null;
let cachedGuides = defaultGuides;

const isGuideList = (value: unknown): value is Guide[] =>
    Array.isArray(value) && value.every((guide) =>
        guide &&
        typeof guide === "object" &&
        typeof guide.id === "string" &&
        typeof guide.name === "string" &&
        Array.isArray(guide.languages) &&
        Array.isArray(guide.certifications),
    );

const readGuides = (): Guide[] => {
    if (typeof window === "undefined") return defaultGuides;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === cachedStoredValue) return cachedGuides;

        const parsed: unknown = stored ? JSON.parse(stored) : defaultGuides;
        cachedStoredValue = stored;
        cachedGuides = isGuideList(parsed) ? parsed : defaultGuides;
        return cachedGuides;
    } catch {
        cachedStoredValue = null;
        cachedGuides = defaultGuides;
        return cachedGuides;
    }
};

const subscribeToGuides = (onStoreChange: () => void) => {
    const handleStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY) onStoreChange();
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener(STORAGE_EVENT, onStoreChange);
    return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(STORAGE_EVENT, onStoreChange);
    };
};

const saveGuides = (nextGuides: Guide[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextGuides));
        window.dispatchEvent(new Event(STORAGE_EVENT));
    } catch {
        // Keep the rendered list usable if browser storage is unavailable.
    }
};

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
