"use client";
import { useState } from "react";
import blogs from '../../../../../data/blogs.json';
import BlogTable from "@/components/agency/blog/BlogTable";
import BlogFilter from "@/components/agency/blog/BlogFilter";
import BlogCount from "@/components/agency/blog/BlogCount";


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

export default function Page() {
  const [posts] = useState<BlogPost[]>(() => {
    return blogs.blogs as BlogPost[];
  });


  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative min-h-[80vh]">

      <BlogCount />
      <BlogFilter />
      <BlogTable posts={posts} />

    </div>
  );
}
