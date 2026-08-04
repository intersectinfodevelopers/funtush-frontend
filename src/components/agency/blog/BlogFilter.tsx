import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/context/theme";

export default function BlogFilter() {
  const { isDark } = useTheme();

  const inputClass = isDark
    ? "border-[#615B5B] bg-[#111B3A] text-white placeholder-[#615B5B]"
    : "border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500";

  const selectClass = isDark
    ? "border-[#615B5B] bg-[#111B3A] text-[#615B5B]"
    : "border-neutral-300 bg-white text-neutral-600";

  return (
    <div className="flex items-center gap-2 text-sm mt-2">
      <Input
        id="search"
        placeholder="Search blogs"
        className={`${inputClass} rounded-md`}
        leftIcon={
          <Image
            src="/search.png"
            alt="search"
            width={20}
            height={20}
          />
        }
      />

      <select
        id="category"
        className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${selectClass}`}
        defaultValue=""
      >
        <option value="" disabled>
          Category
        </option>
        <option value="festival">Festival</option>
        <option value="announcement">Announcement</option>
        <option value="event">Event</option>
        <option value="notice">Notice</option>
      </select>

      <select
        id="status"
        className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${selectClass}`}
        defaultValue=""
      >
        <option value="" disabled>
          Status
        </option>
        <option value="enabled">Enabled</option>
        <option value="disabled">Disabled</option>
      </select>

      <Input
        id="date"
        placeholder="Date"
        className={`${inputClass} rounded-md`}
        rightIcon={
          <Image
            src="/calendar.png"
            alt="date"
            width={20}
            height={20}
          />
        }
      />

      <select
        id="sortBy"
        className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${selectClass}`}
        defaultValue=""
      >
        <option value="" disabled>
          Sort By
        </option>
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="title-asc">Title (A–Z)</option>
        <option value="title-desc">Title (Z–A)</option>
        <option value="updated">Recently Updated</option>
      </select>
    </div>
  );
}