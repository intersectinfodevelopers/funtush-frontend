"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import {
  Plus,
  AlertTriangle,
  Search,
  Compass,
  Footprints,
  CheckCircle2,
  Download,
  ChevronRight,
} from "lucide-react";
import {
  DeleteOutlined,
  EditOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";
import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import guidesData from "../../../../../data/guides.json";
import Link from "next/link";

const isExpiringSoon = (expiry: string) => {
  const now = new Date();
  const exp = new Date(expiry);
  const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff > 0 && diff <= 30;
};

const statusMap: Record<string, { label: string; pill: string }> = {
  available: { label: "Available", pill: "bg-emerald-100 text-emerald-800" },
  on_trek: { label: "On Trek", pill: "bg-sky-100 text-sky-800" },
  unavailable: { label: "Unavailable", pill: "bg-rose-100 text-rose-800" },
};

const gpsLabel = (status: string) => {
  switch (status) {
    case "available":
      return "Online";
    case "on_trek":
      return "Tracking";
    default:
      return "Offline";
  }
};

type Certification = {
  name: string;
  number: string;
  expiry: string;
};

const getLatestExpiry = (certs: Certification[]) =>
  certs.length
    ? certs.reduce(
        (max, cert) => (cert.expiry > max ? cert.expiry : max),
        certs[0].expiry,
      )
    : "N/A";

const getDefaultExpiryDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
};

type RawGuide = (typeof guidesData)[number];

const guideRows = guidesData.map(
  (guide: RawGuide & Partial<{ phone: string; sex: string }>, index) => ({
    ...(guide as RawGuide & { phone?: string; sex?: string }),
    treksDone: 16 + index * 3,
    gps: gpsLabel(guide.status),
    email: `${guide.name.toLowerCase().replace(/\s+/g, ".")}@funtush.com`,
    photo: guide.photo || "",
    phone: guide.phone || "+977 9800 000000",
    sex: guide.sex || "Unknown",
    renewalDate: getLatestExpiry(guide.certifications),
  }),
);

const getInitial = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "G";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "G";
  const first = parts[0][0] ?? "";
  const last = parts[parts.length - 1][0] ?? "";
  return `${first}${last}`.toUpperCase();
};

const GuideAvatar = ({
  name,
  src,
  className = "",
}: {
  name: string;
  src?: string;
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const initial = getInitial(name);

  return (
    <div
      className={`relative overflow-hidden rounded-full bg-violet-600 text-white ring-1 ring-inset ring-slate-200 ${className}`}
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          sizes="100vw"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-violet-600 text-base font-semibold tracking-wide text-white">
          {initial}
        </div>
      )}
    </div>
  );
};

type GuideRow = (typeof guideRows)[number];

export default function GuidesPage() {
  const defaultExpiryDate = useMemo(() => getDefaultExpiryDate(), []);
  const [guideRowsState, setGuideRowsState] = useState(guideRows);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialog, setDialog] = useState<{
    type: "edit" | "delete";
    guide: (typeof guideRows)[number];
  } | null>(null);
  const [viewGuide, setViewGuide] = useState<(typeof guideRows)[number] | null>(
    null,
  );
  const [editForm, setEditForm] = useState<{
    name: string;
    email: string;
    status: string;
    languages: string;
    rating: string;
    renewalDate: string;
    certifications: Certification[];
  }>({
    name: "",
    email: "",
    status: "available",
    languages: "",
    rating: "4.0",
    renewalDate: defaultExpiryDate,
    certifications: [{ name: "", number: "", expiry: defaultExpiryDate }],
  });

  const allLanguages = useMemo(() => {
    const langs = new Set<string>();
    guidesData.forEach((guide) =>
      guide.languages.forEach((lang) => langs.add(lang)),
    );
    return Array.from(langs);
  }, []);

  const stats = useMemo(() => {
    const total = guidesData.length;
    const available = guidesData.filter(
      (guide) => guide.status === "available",
    ).length;
    const onTrek = guidesData.filter(
      (guide) => guide.status === "on_trek",
    ).length;
    const expiring = guidesData.filter((guide) =>
      guide.certifications.some((cert) => isExpiringSoon(cert.expiry)),
    ).length;
    return { total, available, onTrek, expiring };
  }, []);

  const filteredGuides = useMemo(() => {
    return guideRowsState.filter((guide) => {
      const matchesSearch = guide.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || guide.status === statusFilter;
      const matchesLanguage =
        languageFilter === "all" || guide.languages.includes(languageFilter);
      return matchesSearch && matchesStatus && matchesLanguage;
    });
  }, [search, statusFilter, languageFilter, guideRowsState]);

  const guidesPerPage = 8;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredGuides.length / guidesPerPage),
  );
  const paginatedGuides = filteredGuides.slice(
    (currentPage - 1) * guidesPerPage,
    currentPage * guidesPerPage,
  );

  const upcomingRenewal = useMemo(() => {
    return (
      guideRowsState
        .flatMap((guide) =>
          guide.certifications.map((cert) => ({
            ...cert,
            guideId: guide.id,
            guideName: guide.name,
          })),
        )
        .filter((cert) => isExpiringSoon(cert.expiry))
        .sort(
          (a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime(),
        )[0] ?? null
    );
  }, [guideRowsState]);

  const openEditGuide = (guide: GuideRow) => {
    setDialog({ type: "edit", guide });
    setEditForm({
      name: guide.name,
      email: guide.email,
      status: guide.status,
      languages: guide.languages.join(", "),
      rating: String(guide.rating),
      renewalDate: guide.renewalDate,
      certifications:
        guide.certifications.length > 0
          ? guide.certifications.map((cert) => ({
              name: cert.name,
              number: cert.number,
              expiry: cert.expiry,
            }))
          : [{ name: "", number: "", expiry: guide.renewalDate }],
    });
  };

  const saveGuideChanges = () => {
    if (!dialog || dialog.type !== "edit") return;
    const certifications = editForm.certifications.filter(
      (cert) => cert.name || cert.number || cert.expiry,
    );
    const latestExpiry = certifications.length
      ? getLatestExpiry(certifications)
      : editForm.renewalDate;

    setGuideRowsState((rows) =>
      rows.map((row) =>
        row.id === dialog.guide.id
          ? {
              ...row,
              name: editForm.name,
              email: editForm.email,
              status: editForm.status,
              languages: editForm.languages
                .split(",")
                .map((lang) => lang.trim())
                .filter(Boolean),
              rating: Number(editForm.rating) || row.rating,
              renewalDate: latestExpiry,
              certifications,
            }
          : row,
      ),
    );
    setDialog(null);
  };

  const updateCertification = (
    index: number,
    field: keyof Certification,
    value: string,
  ) => {
    setEditForm((prev) => {
      const certifications = [...prev.certifications];
      certifications[index] = { ...certifications[index], [field]: value };
      return { ...prev, certifications };
    });
  };

  const addCertificationRow = () => {
    setEditForm((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        { name: "", number: "", expiry: getDefaultExpiryDate() },
      ],
    }));
  };

  const removeCertificationRow = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, idx) => idx !== index),
    }));
  };

  const handleDeleteGuide = () => {
    if (!dialog || dialog.type !== "delete") return;
    setGuideRowsState((rows) =>
      rows.filter((row) => row.id !== dialog.guide.id),
    );
    setDialog(null);
  };

  const createQrCodeMatrix = (value: string, modules = 21) => {
    const seed = Array.from(new TextEncoder().encode(value)).reduce(
      (sum, byte) => (sum * 131 + byte) >>> 0,
      2166136261,
    );
    const matrix = Array.from({ length: modules }, () =>
      Array.from({ length: modules }, () => false),
    );

    const drawFinder = (row: number, col: number) => {
      for (let r = 0; r < 7; r += 1) {
        for (let c = 0; c < 7; c += 1) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          matrix[row + r][col + c] = isBorder || isCenter;
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(0, modules - 7);
    drawFinder(modules - 7, 0);

    for (let r = 0; r < modules; r += 1) {
      for (let c = 0; c < modules; c += 1) {
        if (matrix[r][c]) continue;
        matrix[r][c] =
          ((seed >>> ((r * modules + c) % 32)) + r * 3 + c * 5) % 2 === 0;
      }
    }

    return matrix;
  };

  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = document.createElement("img") as HTMLImageElement;
      image.src = src;
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = reject;
    });

  const drawQrPlaceholder = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    value: string,
  ) => {
    const matrix = createQrCodeMatrix(value);
    const block = Math.floor(size / matrix.length);
    const qrSize = block * matrix.length;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, qrSize, qrSize);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = Math.max(2, size * 0.018);
    ctx.strokeRect(x, y, qrSize, qrSize);

    matrix.forEach((row, rowIndex) => {
      row.forEach((filled, colIndex) => {
        ctx.fillStyle = filled ? "#0f172a" : "#ffffff";
        ctx.fillRect(x + colIndex * block, y + rowIndex * block, block, block);
      });
    });
  };

  const downloadIdCard = async (guide: (typeof guideRows)[number]) => {
    const canvas = document.createElement("canvas");
    const width = 1000;
    const height = 620;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const skyBlue = "#0EA5E9";

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(15,23,42,0.04)";
    for (let x = 0; x < width; x += 22) {
      for (let y = 0; y < height; y += 22) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = skyBlue;
    ctx.beginPath();
    ctx.roundRect(0, 40, 480, 90, [0, 45, 45, 0]);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 34px Poppins, sans-serif";
    ctx.fillText("GUIDE ID CARD", 50, 95);

    ctx.fillStyle = skyBlue;
    ctx.font = "900 32px Poppins, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("FUNTUSH", width - 50, 75);
    ctx.font = "600 12px Poppins, sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("VERIFIED TREK GUIDE", width - 50, 95);
    ctx.textAlign = "left";

    const photoSize = 230;
    const photoX = 55;
    const photoY = 170;
    ctx.save();
    ctx.strokeStyle = skyBlue;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoSize, photoSize, 34);
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(photoX + 6, photoY + 6, photoSize - 12, photoSize - 12, 28);
    ctx.clip();

    try {
      if (!guide.photo) throw new Error("no photo");
      const photo = await loadImage(guide.photo);
      ctx.drawImage(
        photo,
        photoX + 6,
        photoY + 6,
        photoSize - 12,
        photoSize - 12,
      );
    } catch {
      ctx.fillStyle = "#4338ca";
      ctx.fillRect(photoX + 6, photoY + 6, photoSize - 12, photoSize - 12);
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 88px Poppins, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        getInitial(guide.name),
        photoX + photoSize / 2,
        photoY + photoSize / 2,
      );
      ctx.textAlign = "start";
      ctx.textBaseline = "alphabetic";
    }
    ctx.restore();

    const qrSize = 130;
    const qrX = photoX + (photoSize - qrSize) / 2;
    const qrY = photoY + photoSize + 28;
    drawQrPlaceholder(ctx, qrX, qrY, qrSize, guide.id + guide.email);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 11px Poppins, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SCAN TO VERIFY", qrX + qrSize / 2, qrY + qrSize + 20);
    ctx.textAlign = "start";

    const detailsX = photoX + photoSize + 60;
    const labelColW = 190;
    const rows: [string, string][] = [
      ["NAME", guide.name],
      ["GUIDE ID", guide.id],
      ["SEX", guide.sex],
      ["LANGUAGES", guide.languages.join(", ")],
      ["PHONE", guide.phone],
      ["VALID UNTIL", guide.renewalDate],
    ];
    let rowY = 220;
    rows.forEach(([label, value]) => {
      ctx.fillStyle = "#0f172a";
      ctx.font = "700 22px Poppins, sans-serif";
      ctx.fillText(label, detailsX, rowY);
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(":", detailsX + labelColW, rowY);
      ctx.fillStyle = "#334155";
      ctx.font = "500 22px Poppins, sans-serif";
      ctx.fillText(value, detailsX + labelColW + 24, rowY);
      rowY += 56;
    });

    // Minimal footer accent line, right-side decoration removed
    const accentY = height - 40;
    ctx.fillStyle = "rgba(14,165,233,0.14)";
    ctx.fillRect(0, accentY, width, 10);

    const imageUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${guide.name.replace(/\s+/g, "_")}_id_card.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 w-full">
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Guides</h1>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Link href={"/dashboard/guides"}>Guides</Link>
            <span className="text-neutral-300">
              <ChevronRight size={15} />
            </span>
            <span className="font-semibold text-neutral-900">All Guides</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/guides/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
          >
            <Plus size={25} strokeWidth={2.5} /> Add Guide
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-amber-950">
                Upcoming renewal alert
              </p>
              <p className="text-sm text-amber-800">
                {upcomingRenewal
                  ? `${upcomingRenewal.guideName}'s certification expires on ${new Date(upcomingRenewal.expiry).toLocaleDateString()}.`
                  : "No certifications expiring soon."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!upcomingRenewal) return;
              const guide = guideRowsState.find(
                (row) => row.id === upcomingRenewal.guideId,
              );
              if (guide) {
                openEditGuide(guide);
              }
            }}
            className="rounded-full border border-amber-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900 shadow-sm transition hover:bg-amber-100"
          >
            View renewals
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <AnalyticsSummaryCard
          label="Total Guides"
          value={stats.total}
          tone="primary"
          icon={Compass}
        />
        <AnalyticsSummaryCard
          label="On Trek"
          value={stats.onTrek}
          tone="primary"
          icon={Footprints}
        />
        <AnalyticsSummaryCard
          label="Available"
          value={stats.available}
          tone="success"
          icon={CheckCircle2}
        />
        <AnalyticsSummaryCard
          label="Certs Expiring"
          value={stats.expiring}
          tone="danger"
          icon={AlertTriangle}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_180px_180px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            className="w-full rounded-2xl border border-neutral-200 bg-white py-2.5 pl-10 pr-3 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            placeholder="Search guides"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <select
          className="rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All status</option>
          <option value="available">Available</option>
          <option value="on_trek">On Trek</option>
          <option value="unavailable">Unavailable</option>
        </select>

        <select
          className="rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
        >
          <option value="all">All languages</option>
          {allLanguages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      <section className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-neutral-100">
        <table className="min-w-full text-left text-sm text-neutral-700">
          <thead className="bg-warning-50/70">
            <tr className="text-xs font-bold uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-5">S.N</th>
              <th className="px-4 py-5">Guide</th>
              <th className="px-4 py-5">Languages</th>
              <th className="px-4 py-5">Certifications</th>
              <th className="px-4 py-5">Rating</th>
              <th className="px-4 py-5">Status</th>
              <th className="px-4 py-5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {paginatedGuides.map((guide, index) => {
              const statusInfo =
                statusMap[guide.status] || statusMap.unavailable;
              const expiringCert = guide.certifications.find((cert) =>
                isExpiringSoon(cert.expiry),
              );
              return (
                <tr
                  key={guide.id}
                  className="transition hover:bg-neutral-50/80"
                >
                  <td className="px-5 py-5">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-primary-50 font-bold text-neutral-900">
                      {(currentPage - 1) * guidesPerPage + index + 1}
                    </span>
                  </td>
                  <td className="px-5 py-5">
                    <div className="flex items-center gap-3">
                      <GuideAvatar
                        name={guide.name}
                        src={guide.photo}
                        className="h-11 w-11"
                      />
                      <div>
                        <strong className="block text-sm text-neutral-950">
                          {guide.name}
                        </strong>
                        <small className="mt-1 block text-xs text-neutral-500">
                          {guide.email}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-5 text-sm font-semibold text-neutral-800">
                    {guide.languages.join(", ") || "—"}
                  </td>
                  <td className="px-5 py-5 text-xs leading-5 text-neutral-600">
                    {guide.certifications.length > 0 ? (
                      guide.certifications.map((cert) => (
                        <div
                          key={cert.number}
                          className="mb-2 rounded-xl bg-neutral-50 px-3 py-2"
                        >
                          <div className="font-semibold text-neutral-900">
                            {cert.name}
                          </div>
                          <div className="text-[11px] text-neutral-500">
                            {cert.number}
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-neutral-400">No certs</span>
                    )}
                    {expiringCert && (
                      <div className="mt-1 text-[11px] text-rose-600">
                        Expires{" "}
                        {new Date(expiringCert.expiry).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-amber-600">
                    {guide.rating.toFixed(1)}★
                  </td>
                  <td className="px-5 py-5">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.pill}`}
                    >
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-5 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title="View ID Card"
                        onClick={() => setViewGuide(guide)}
                        className="rounded-md bg-primary-100 p-2 text-primary-600 transition hover:bg-primary-200"
                      >
                        <span className="sr-only">View ID Card</span>
                        <VisibilityOutlined sx={{ fontSize: 18 }} />
                      </button>
                      <button
                        type="button"
                        title="Edit guide"
                        onClick={() => openEditGuide(guide)}
                        className="rounded-md bg-warning-100 p-2 text-warning-600 transition hover:bg-warning-200"
                      >
                        <span className="sr-only">Edit</span>
                        <EditOutlined sx={{ fontSize: 18 }} />
                      </button>
                      <button
                        type="button"
                        title="Delete guide"
                        onClick={() => setDialog({ type: "delete", guide })}
                        className="rounded-md bg-danger-100 p-2 text-danger-500 transition hover:bg-danger-200"
                      >
                        <span className="sr-only">Delete</span>
                        <DeleteOutlined sx={{ fontSize: 18 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      <div className="mt-4 w-full">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <Modal
        isOpen={!!viewGuide}
        onClose={() => setViewGuide(null)}
        title={viewGuide ? `${viewGuide.name} ID Card` : undefined}
        size="xl"
      >
        {viewGuide && (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-2xl">
              {/* subtle marble texture */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background:radial-gradient(circle_at_20%_20%,#000_1px,transparent_1px)] bg-size-[22px_22px]" />

              {/* Header */}
              <div className="relative flex items-center justify-between px-8 pt-8 pb-14">
                <div className="rounded-r-3xl bg-sky-500 py-5 pl-8 pr-10 shadow-lg">
                  <p className="text-2xl font-extrabold uppercase tracking-wide text-white">
                    Guide ID Card
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-black tracking-tight text-sky-500">
                    FUNTUSH
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                    Verified Trek Guide
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="relative grid gap-8 px-8 pb-6 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-3xl border-4 border-sky-500 shadow-md">
                    {viewGuide.photo ? (
                      <Image
                        src={viewGuide.photo}
                        alt={viewGuide.name}
                        width={192}
                        height={192}
                        className="h-48 w-48 object-cover"
                      />
                    ) : (
                      <div className="flex h-48 w-48 items-center justify-center bg-violet-600 text-5xl font-semibold tracking-[0.2em] text-white sm:text-6xl">
                        {getInitial(viewGuide.name)}
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="inline-grid grid-cols-[repeat(13,minmax(4px,1fr))] gap-0.5">
                      {createQrCodeMatrix(
                        viewGuide.id + viewGuide.email,
                        13,
                      ).flatMap((row, rowIndex) =>
                        row.map((cell, colIndex) => (
                          <span
                            key={`${rowIndex}-${colIndex}`}
                            className={
                              cell
                                ? "block h-2 w-2 bg-slate-950"
                                : "block h-2 w-2 bg-white"
                            }
                          />
                        )),
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 self-center">
                  {[
                    { label: "Name", value: viewGuide.name },
                    { label: "Sex", value: viewGuide.sex },
                    { label: "Phone", value: viewGuide.phone },
                    { label: "Guide ID", value: viewGuide.id },
                    {
                      label: "Languages",
                      value: viewGuide.languages.join(", "),
                    },
                    { label: "Valid until", value: viewGuide.renewalDate },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-[130px_16px_1fr] items-baseline text-lg"
                    >
                      <span className="font-semibold uppercase tracking-wide text-slate-900">
                        {row.label}
                      </span>
                      <span className="text-slate-400">:</span>
                      <span className="font-medium capitalize text-slate-700">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => viewGuide && downloadIdCard(viewGuide)}
              className="inline-flex w-full max-w-2xl items-center justify-center gap-2 rounded-full bg-primary-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-primary-900"
            >
              <Download className="h-4 w-4" />
              Download ID Card
            </button>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!dialog}
        onClose={() => setDialog(null)}
        title={
          dialog?.type === "edit" ? `Edit ${dialog.guide.name}` : "Delete Guide"
        }
        size={dialog?.type === "edit" ? "xl" : "md"}
      >
        {dialog?.type === "edit" ? (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Name
                </label>
                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Email
                </label>
                <input
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                >
                  <option value="available">Available</option>
                  <option value="on_trek">On Trek</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Rating
                </label>
                <input
                  type="number"
                  value={editForm.rating}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, rating: e.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Languages
              </label>
              <input
                value={editForm.languages}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    languages: e.target.value,
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                placeholder="Nepali, English, French"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Card renewal date
              </label>
              <input
                type="date"
                value={editForm.renewalDate}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    renewalDate: e.target.value,
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div className="space-y-3 rounded-3xl border border-neutral-200 bg-slate-50 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    Certifications
                  </p>
                  <p className="text-xs text-neutral-500">
                    Add or renew certifications for this guide.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addCertificationRow}
                  className="rounded-2xl bg-primary-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-800"
                >
                  Add cert
                </button>
              </div>
              <div className="space-y-4">
                {editForm.certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_auto]"
                  >
                    <div className="rounded-3xl border border-neutral-200 bg-white p-4">
                      <label className="block text-sm font-medium text-neutral-700">
                        Cert name
                      </label>
                      <input
                        value={cert.name}
                        onChange={(e) =>
                          updateCertification(index, "name", e.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                        placeholder="Wilderness First Aid"
                      />
                    </div>
                    <div className="rounded-3xl border border-neutral-200 bg-white p-4">
                      <label className="block text-sm font-medium text-neutral-700">
                        Number
                      </label>
                      <input
                        value={cert.number}
                        onChange={(e) =>
                          updateCertification(index, "number", e.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                        placeholder="WFA-234"
                      />
                    </div>
                    <div className="rounded-3xl border border-neutral-200 bg-white p-4">
                      <label className="block text-sm font-medium text-neutral-700">
                        Expiry
                      </label>
                      <input
                        type="date"
                        value={cert.expiry}
                        onChange={(e) =>
                          updateCertification(index, "expiry", e.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCertificationRow(index)}
                      className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl border border-danger-200 bg-danger-50 px-4 text-sm font-semibold text-danger-700 transition hover:bg-danger-100"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveGuideChanges}
                className="rounded-2xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800"
              >
                Save changes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-neutral-900">
                {dialog?.guide.name}
              </span>{" "}
              from the guide list? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteGuide}
                className="rounded-2xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-danger-700"
              >
                Delete guide
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
