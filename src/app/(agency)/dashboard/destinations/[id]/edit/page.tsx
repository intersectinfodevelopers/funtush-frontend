"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DestinationForm from "@/components/agency/destinations/DestinationForm";
import destinationsJson from "@/../data/destinations.json";

export default function EditDestinationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string | undefined;

  const [initialData, setInitialData] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;

    try {
      const stored = localStorage.getItem("destinations");
      if (stored) {
        const list = JSON.parse(stored) as any[];
        const found = list.find((d) => String(d.id) === String(id));
        if (found) {
          setInitialData({
            ...found,
            name: found.name ?? found.title ?? "",
            featuredImage: found.featuredImage ?? "",
            bestTimeToVisit: found.bestTimeToVisit ?? found.bestSeason ?? "",
          });
          return;
        }
      }
    } catch (e) {
      // ignore
    }

    // fallback to static data
    const raw = (destinationsJson as any[]).find((d) => String(d.id) === String(id));
    if (raw) {
      setInitialData({
        ...raw,
        name: raw.title || "",
        featuredImage: raw.featuredImage || "",
        bestTimeToVisit: raw.bestSeason || "",
      });
      return;
    }

    router.push("/dashboard/destinations");
  }, [id, router]);

  if (!initialData) return <div className="p-4">Loading destination editor...</div>;

  return <DestinationForm isNew={false} initialData={initialData} destinationId={id} />;
}

