import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import guidesData from "../../../../../../data/guides.json";
import Link from "next/link";


const statusMap: Record<string, { label: string; color: string }> = {
  available: { label: "Available", color: "bg-green-100 text-green-800" },
  on_trek: { label: "On Trek", color: "bg-yellow-100 text-yellow-800" },
  unavailable: { label: "Unavailable", color: "bg-red-100 text-red-800" },
};

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;  
  const guide = guidesData.find((g) => g.id === id);
  if (!guide) notFound();


  const statusInfo = statusMap[guide.status] || statusMap.unavailable;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        href="/dashboard/guides"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to Guides
      </Link>

      <Card className="space-y-4">
        {/* Header */}
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-neutral-200 overflow-hidden shrink-0">
              {guide.photo && (
                <Image
                  src={guide.photo}
                  alt={guide.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div>
              <CardTitle className="text-2xl">{guide.name}</CardTitle>
              <span
                className={`inline-block text-sm font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Languages */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-1">
              Languages
            </h3>
            <div className="flex flex-wrap gap-1">
              {guide.languages.map((lang) => (
                <span
                  key={lang}
                  className="bg-neutral-100 text-neutral-800 text-xs px-2 py-1 rounded"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-neutral-50 p-3 rounded text-center border border-neutral-200">
            <div className="text-xl font-bold text-black">★ {guide.rating ?? "—"}</div>
            <div className="text-xs text-neutral-500">Rating</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
