import Image from "next/image";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/context/theme";

interface BlogPost {
  id: number;
  title: string;
  description: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  time: string;
  status: "Draft" | "Scheduled" | "Published";
  views: string;
  likes: number;
  thumbnail: string;
}

export default function BlogTable({ posts }: { posts: BlogPost[] }) {
  const { isDark } = useTheme();

  const cardClass = isDark
    ? "bg-[#111B3A] text-white border-black"
    : "bg-white text-neutral-900 border-neutral-200";

  const mutedText = isDark ? "text-gray-400" : "text-neutral-500";

  return (
    <div className="w-full space-y-4">
      {/* Desktop Header - Hidden on Mobile/Tablet */}
      <Card
        className={`hidden lg:grid ${cardClass} rounded-xl overflow-hidden border p-4 grid-cols-[6fr_1fr_1.5fr_1.5fr_1fr_0.8fr_0.8fr_1fr] items-center text-sm font-medium`}
      >
        <div className="flex justify-center">BLOG</div>
        <div className="flex justify-center">CATEGORY</div>
        <div className="flex justify-center">AUTHOR</div>
        <div className="flex justify-center">PUBLISHED DATE</div>
        <div className="flex justify-center">STATUS</div>
        <div className="flex justify-center">VIEWS</div>
        <div className="flex justify-center">COMMENTS</div>
        <div className="flex justify-center">ACTIONS</div>
      </Card>

      {/* Blog Posts List */}
      {posts?.map((blog) => (
        <Card
          key={blog.id}
          className={`${cardClass} rounded-xl overflow-hidden border p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 text-sm font-medium`}
        >
          {/* Blog Thumbnail, Title & Description - Side by side on large screens */}
          <div className="flex items-start gap-4 lg:grid lg:grid-cols-[135px_1fr] lg:items-center lg:gap-4 lg:w-[3fr]">
            <div className="relative shrink-0 w-[100px] h-[75px] lg:w-[135px] lg:h-[100px]">
              <Image
                src={`/${blog.thumbnail}`}
                alt={blog.title}
                fill
                className="object-cover rounded-md p-1"
              />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <p className="font-semibold truncate">{blog.title}</p>
              <p className={`text-xs lg:text-sm truncate ${mutedText}`}>
                {blog.description}
              </p>
            </div>
          </div>

          {/* Category */}
          <div className="flex lg:justify-center items-center">
            <span className="bg-[#393996] text-white px-3 py-1 rounded-md text-xs font-bold">
              {blog.category}
            </span>
          </div>

          {/* Author */}
          <div className="flex items-center gap-2">
            <Image
              src={`/${blog.author.avatar}`}
              alt={blog.author.name}
              width={32}
              height={32}
              className="rounded-full object-cover shrink-0"
            />
            <span className="text-xs lg:text-sm truncate">{blog.author.name}</span>
          </div>

          {/* Date & Time */}
          <div className="flex lg:flex-col justify-between lg:justify-center text-xs lg:text-sm">
            <p>{blog.date}</p>
            <p className={mutedText}>{blog.time}</p>
          </div>

          {/* Status */}
          <div className="flex items-center">
            <span
              className={`px-3 py-1 rounded-md text-xs font-bold text-center ${
                blog.status === "Published"
                  ? "bg-[#3CD875] text-black"
                  : "bg-[#FF8D28] text-white"
              }`}
            >
              {blog.status}
            </span>
          </div>

          {/* Views & Comments */}
          <div className="flex items-center justify-between lg:justify-start gap-4 text-xs lg:text-sm border-t lg:border-t-0 pt-2 lg:pt-0 border-neutral-700/20">
            <div className="flex lg:block items-center gap-1">
              <span className="lg:hidden text-muted-foreground">Views: </span>
              <span>{blog.views}</span>
            </div>
            <div className="flex lg:block items-center gap-1">
              <span className="lg:hidden text-muted-foreground">Comments: </span>
              <span>{blog.likes}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end lg:justify-center gap-2 border-t lg:border-t-0 pt-2 lg:pt-0 border-neutral-700/20">
            <button aria-label="View" className="p-1 hover:opacity-80 transition-opacity">
              <Image src="/view.png" alt="view" width={28} height={28} />
            </button>
            <button aria-label="Edit" className="p-1 hover:opacity-80 transition-opacity">
              <Image src="/edit.png" alt="edit" width={28} height={28} />
            </button>
            <button aria-label="Delete" className="p-1 hover:opacity-80 transition-opacity">
              <Image src="/delete.png" alt="delete" width={28} height={28} />
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}