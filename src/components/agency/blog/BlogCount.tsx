import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/context/theme";

export default function BlogCount() {
  const { isDark } = useTheme();

  const cardClass = isDark
    ? "bg-[#111B3A] text-white border-black"
    : "bg-white text-neutral-900 border-neutral-200";

  const secondaryText = isDark
    ? "text-[#596583]"
    : "text-neutral-500";

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-sm">
          <p className={isDark ? "text-white" : "text-neutral-700"}>
            Dashboard{" "}
            <Image
              src="/formkit_down.png"
              alt="sidearrow"
              width={14}
              height={14}
              className="object-contain inline-block mx-1"
            />
            All Blogs
          </p>

          <h1
            className={
              isDark
                ? "text-2xl font-bold text-white tracking-tight"
                : "text-2xl font-bold text-neutral-900 tracking-tight"
            }
          >
            All Blogs
          </h1>

          <p className={`text-sm mt-0.5 ${secondaryText}`}>
            Manage and organize all your blog posts
          </p>
        </div>

        <Link
          href="/dashboard/blog/new"
          className={
            isDark
              ? "bg-[#111B3A] text-white text-xs font-bold px-6 py-4"
              : "bg-neutral-900 text-white text-xs font-bold px-6 py-4"
          }
        >
          + Add new Blog
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`${cardClass} rounded-xl overflow-hidden border p-4`}>
          <div className="flex items-center gap-2 text-sm font-medium">
            <button className="bg-[#9044D9] rounded-full">
              <Image
                src="/folder-icon.png"
                alt="folder-icon"
                width={35}
                height={35}
                className="p-2"
              />
            </button>

            <div className="pl-2">
              <p className="pl-6">Total Blogs</p>
              <p className="font-bold text-2xl pl-2">248</p>
            </div>

            <Image
              src="/vector.png"
              alt="vector"
              width={70.93}
              height={29.76}
            />
          </div>

          <Growth />
        </Card>

        <StatCard
          title="Published"
          color="#1CAA50"
          image="/green-squiggle.png"
          cardClass={cardClass}
        />

        <StatCard
          title="Draft"
          color="#FF8D28"
          image="/orange-squiggle.png"
          cardClass={cardClass}
        />

        <StatCard
          title="Total Views"
          color="#0088FF"
          image="/blue-squiggle.png"
          cardClass={cardClass}
        />
      </div>
    </>
  );
}

function StatCard({
  title,
  color,
  image,
  cardClass,
}: {
  title: string;
  color: string;
  image: string;
  cardClass: string;
}) {
  return (
    <Card className={`${cardClass} rounded-xl overflow-hidden border p-4`}>
      <div className="flex items-center gap-2">
        <button
          style={{ backgroundColor: color }}
          className="rounded-full"
        >
          <Image
            src="/folder-icon.png"
            alt="folder-icon"
            width={35}
            height={35}
            className="p-2"
          />
        </button>

        <div className="pl-2">
          <p className="pl-6">{title}</p>
          <p className="font-bold text-2xl pl-2">248</p>
        </div>

        <Image
          src={image}
          alt="chart"
          width={70.93}
          height={29.76}
        />
      </div>

      <Growth />
    </Card>
  );
}

function Growth() {
  return (
    <div className="flex items-center gap-2 text-sm mt-2">
      <Image
        src="/arrow-up-filled.png"
        alt="arrow"
        width={36}
        height={36}
      />

      <span className="font-bold text-[#34C759]">
        12.5%
      </span>

      <span>
        from last month
      </span>
    </div>
  );
}