"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// MUI Icons
import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FilePresentOutlinedIcon from "@mui/icons-material/FilePresentOutlined";

interface PackageRow {
  sn: number;
  id: string;
  avatarText: string;
  name: string;
  locationTime: string;
  durationDays: number;
  duration: string;
  difficulty: "Moderate" | "Challenging" | "Easy";
  priceFrom: number;
  departured: string;
  bookings: number;
  status: "Published" | "Draft" | "Archive";
}

const initialPackages: PackageRow[] = [
  {
    sn: 1,
    id: "pkg-1",
    avatarText: "SK",
    name: "Subash Kuwar",
    locationTime: "Annapurna Region, Mar 4:13PM",
    durationDays: 14,
    duration: "14 Day",
    difficulty: "Moderate",
    priceFrom: 450,
    departured: "9 upcoming",
    bookings: 24,
    status: "Published",
  },
  {
    sn: 2,
    id: "pkg-2",
    avatarText: "LS",
    name: "Laxmi Sherpa",
    locationTime: "Everest Region, Mar 2:45PM",
    durationDays: 12,
    duration: "12 Day",
    difficulty: "Challenging",
    priceFrom: 850,
    departured: "4 upcoming",
    bookings: 18,
    status: "Draft",
  },
  {
    sn: 3,
    id: "pkg-3",
    avatarText: "RG",
    name: "Rohan Gurung",
    locationTime: "Langtang Valley, Mar 1:10PM",
    durationDays: 7,
    duration: "7 Day",
    difficulty: "Easy",
    priceFrom: 280,
    departured: "12 upcoming",
    bookings: 32,
    status: "Archive",
  },
  {
    sn: 4,
    id: "pkg-4",
    avatarText: "AT",
    name: "Aisha Tamang",
    locationTime: "Mardi Himal, Feb 11:20AM",
    durationDays: 5,
    duration: "5 Day",
    difficulty: "Moderate",
    priceFrom: 210,
    departured: "6 upcoming",
    bookings: 15,
    status: "Published",
  },
  {
    sn: 5,
    id: "pkg-5",
    avatarText: "PB",
    name: "Prajwal Basnet",
    locationTime: "Manaslu Circuit, Feb 9:00AM",
    durationDays: 16,
    duration: "16 Day",
    difficulty: "Challenging",
    priceFrom: 920,
    departured: "2 upcoming",
    bookings: 8,
    status: "Draft",
  },
];

export default function PackagesFigmaPage() {
  const router = useRouter();
  const [packages] = useState<PackageRow[]>(initialPackages);
  const [activeTab, setActiveTab] = useState<
    "All" | "Published" | "Draft" | "Archive"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<string>("default");

  // Dropdown visibility states
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const statusRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        statusRef.current &&
        !statusRef.current.contains(event.target as Node)
      ) {
        setIsStatusOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Badge counters
  const publishedCount = packages.filter(
    (p) => p.status === "Published",
  ).length;
  const draftCount = packages.filter((p) => p.status === "Draft").length;
  const archiveCount = packages.filter((p) => p.status === "Archive").length;

  // Filter & Search Logic
  const filteredPackages = packages.filter((pkg) => {
    const matchesTab = activeTab === "All" || pkg.status === activeTab;
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.locationTime.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Sorting Logic
  const sortedPackages = [...filteredPackages].sort((a, b) => {
    switch (sortOption) {
      case "price-asc":
        return a.priceFrom - b.priceFrom;
      case "price-desc":
        return b.priceFrom - a.priceFrom;
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "duration-asc":
        return a.durationDays - b.durationDays;
      case "bookings-desc":
        return b.bookings - a.bookings;
      default:
        return a.sn - b.sn;
    }
  });

  const getDifficultyStyle = (diff: string) => {
    switch (diff) {
      case "Moderate":
        return "text-amber-500 font-semibold";
      case "Challenging":
        return "text-rose-500 font-semibold";
      case "Easy":
        return "text-emerald-500 font-semibold";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-amber-100/70 text-amber-700";
      case "Draft":
        return "bg-gray-200 text-gray-700";
      case "Archive":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-8 bg-[#F8F9FD] min-h-screen text-gray-800 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Packages</h1>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            <span>Packages</span>
            <span>&gt;</span>
            <span className="text-indigo-600 font-medium">All Packages</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-4 py-2.5 text-xs font-semibold bg-white border border-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <FilePresentOutlinedIcon style={{ fontSize: "1.1rem" }} />
            Export CSV
          </button>

          <Link href="/dashboard/packages/new">
            <button
              type="button"
              className="px-5 py-2.5 text-xs font-semibold bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-lg shadow-md flex items-center gap-1.5 transition-all"
            >
              <AddIcon style={{ fontSize: "1.1rem" }} />
              Create Package
            </button>
          </Link>
        </div>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        {/* Search */}
        <div className="md:col-span-5 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <SearchIcon style={{ fontSize: "1.1rem" }} />
          </div>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#6C5CE7]/10 placeholder:text-gray-500 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30"
            placeholder="Search packages or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Dropdowns & Actions */}
        <div className="md:col-span-7 flex items-center justify-end gap-3">
          {/* Status Dropdown */}
          <div className="relative" ref={statusRef}>
            <button
              type="button"
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="px-4 py-2.5 text-xs font-medium bg-[#6C5CE7]/80 hover:bg-[#6C5CE7] text-white rounded-xl flex items-center gap-2 shadow-sm transition-colors"
            >
              <span>Status: {activeTab}</span>
              <KeyboardArrowDownIcon style={{ fontSize: "1rem" }} />
            </button>

            {isStatusOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 text-xs">
                {(["All", "Published", "Draft", "Archive"] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setActiveTab(status);
                        setIsStatusOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-indigo-50 transition-colors ${
                        activeTab === status
                          ? "font-bold text-[#6C5CE7]"
                          : "text-gray-700"
                      }`}
                    >
                      {status}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="px-4 py-2.5 text-xs font-medium bg-[#6C5CE7]/80 hover:bg-[#6C5CE7] text-white rounded-xl flex items-center gap-2 shadow-sm transition-colors"
            >
              <span>Sort by</span>
              <KeyboardArrowDownIcon style={{ fontSize: "1rem" }} />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 text-xs">
                <button
                  onClick={() => {
                    setSortOption("default");
                    setIsSortOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700"
                >
                  Default (S.N)
                </button>
                <button
                  onClick={() => {
                    setSortOption("name-asc");
                    setIsSortOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700"
                >
                  Name (A-Z)
                </button>
                <button
                  onClick={() => {
                    setSortOption("price-asc");
                    setIsSortOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700"
                >
                  Price: Low to High
                </button>
                <button
                  onClick={() => {
                    setSortOption("price-desc");
                    setIsSortOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700"
                >
                  Price: High to Low
                </button>
                <button
                  onClick={() => {
                    setSortOption("duration-asc");
                    setIsSortOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700"
                >
                  Duration: Shortest
                </button>
                <button
                  onClick={() => {
                    setSortOption("bookings-desc");
                    setIsSortOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700"
                >
                  Bookings: Highest
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="px-5 py-2.5 text-xs font-semibold bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-xl shadow-sm flex items-center gap-2"
          >
            Download
            <FileDownloadOutlinedIcon style={{ fontSize: "1.1rem" }} />
          </button>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="bg-[#F0EEFF] px-6 py-3 rounded-t-2xl flex items-center gap-8 text-xs font-semibold border-b border-indigo-100">
        <button
          onClick={() => setActiveTab("All")}
          className={`flex items-center gap-2 pb-1 transition-all ${
            activeTab === "All"
              ? "text-[#6C5CE7] border-b-2 border-[#6C5CE7]"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <span className="text-sm font-bold">All</span>
          <span className="text-[#6C5CE7] text-sm font-bold ml-1">
            {packages.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("Published")}
          className={`flex items-center gap-2 pb-1 transition-all ${
            activeTab === "Published"
              ? "text-[#6C5CE7] border-b-2 border-[#6C5CE7]"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <span>Published</span>
          <span className="text-gray-400">{publishedCount}</span>
        </button>

        <button
          onClick={() => setActiveTab("Draft")}
          className={`flex items-center gap-2 pb-1 transition-all ${
            activeTab === "Draft"
              ? "text-[#6C5CE7] border-b-2 border-[#6C5CE7]"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <span>Draft</span>
          <span className="text-gray-400">{draftCount}</span>
        </button>

        <button
          onClick={() => setActiveTab("Archive")}
          className={`flex items-center gap-2 pb-1 transition-all ${
            activeTab === "Archive"
              ? "text-[#6C5CE7] border-b-2 border-[#6C5CE7]"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <span>Archive</span>
          <span className="text-gray-400">{archiveCount}</span>
        </button>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FFF0F0]/60 text-[11px] font-bold text-gray-700 uppercase tracking-wider border-b border-gray-100">
              <th className="py-3 px-4 text-center">S.N</th>
              <th className="py-3 px-4">PACKAGE NAME</th>
              <th className="py-3 px-4">DURATION</th>
              <th className="py-3 px-4">DIFFICULTY</th>
              <th className="py-3 px-4">PRICE FROM</th>
              <th className="py-3 px-4">DEPARTURED</th>
              <th className="py-3 px-4">BOOKINGS</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-center">ACTIONS</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 text-xs">
            {sortedPackages.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="py-8 text-center text-gray-400 italic"
                >
                  No {activeTab.toLowerCase()} packages found matching your
                  criteria.
                </td>
              </tr>
            ) : (
              sortedPackages.map((row, index) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50/60 transition-colors"
                >
                  <td className="py-4 px-4 text-center font-bold text-gray-700">
                    {index + 1}
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {row.avatarText}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">
                          {row.name}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {row.locationTime}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-medium text-gray-800">
                    {row.duration}
                  </td>

                  <td
                    className={`py-4 px-4 ${getDifficultyStyle(row.difficulty)}`}
                  >
                    {row.difficulty}
                  </td>

                  <td className="py-4 px-4 font-bold text-gray-900">
                    ${row.priceFrom}
                  </td>

                  <td className="py-4 px-4">
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-emerald-100">
                      {row.departured}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-bold text-gray-800">
                    {row.bookings}
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`text-[10px] font-semibold px-3 py-1 rounded-full ${getStatusBadgeStyle(row.status)}`}
                    >
                      {row.status}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/dashboard/packages/${row.id}/edit`)
                        }
                        className="p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-md transition-colors"
                        title="Edit Package"
                      >
                        <EditOutlinedIcon style={{ fontSize: "1rem" }} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/dashboard/packages/${row.id}`)
                        }
                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                        title="View Details"
                      >
                        <RemoveRedEyeOutlinedIcon
                          style={{ fontSize: "1rem" }}
                        />
                      </button>

                      <button
                        type="button"
                        className="p-1.5 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-md transition-colors"
                        title="Delete Package"
                      >
                        <DeleteOutlineIcon style={{ fontSize: "1rem" }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div>
          Showing 1 to {sortedPackages.length} of {packages.length} entries
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 text-indigo-600 hover:bg-indigo-50 rounded">
            <ChevronLeftIcon style={{ fontSize: "1.2rem" }} />
          </button>
          <button className="w-6 h-6 rounded bg-[#6C5CE7] text-white font-bold flex items-center justify-center">
            1
          </button>
          <button className="p-1 text-indigo-600 hover:bg-indigo-50 rounded">
            <ChevronRightIcon style={{ fontSize: "1.2rem" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
