'use client';
import { useRouter } from "next/navigation";
import { useGuides } from "@/hooks/useGuides";
import GuideForm from "@/components/agency/guides/GuideForm";
import Link from "next/link";

export default function NewGuidePage() {

  const {addGuide} = useGuides();
  const router = useRouter();

  const handleSave = (data: Parameters<typeof addGuide>[0]) => {
    addGuide(data);
    router.push('/dashboard/guides');
  };
    return (
    <div className="p-4">
      <Link href="/dashboard/guides" className="text-blue-600 hover:underline mt-4 inline-block">
        ← Back to Guides
      </Link>
      <h1 className="text-2xl font-bold">Add New Guide</h1>
      <GuideForm onSave={handleSave} isNew/>
    </div>
  );
}
