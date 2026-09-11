"use client";

import { useState } from "react";
import { LayoutTemplate, Image as ImageIcon, Pencil } from "lucide-react";
import { useSettingsForm } from "@/components/agency/settings/settings-kit";
import { TopBarModal } from "./TopBarModal";
import { PopupEditModal } from "./PopupModal";

export type TopBarStyle = "default" | "scrolling";

type ComponentsSlice = {
  announcementEnabled: boolean;
  announcementText: string;
  announcementLink: string;
  topBarStyle: TopBarStyle;
  topBarBgColor: string;
  topBarTextColor: string;
  popupEnabled: boolean;
  popupImage: string;
  popupLink: string;
};

const DEFAULTS: ComponentsSlice = {
  announcementEnabled: false,
  announcementText: "Monsoon sale — 15% off all Annapurna treks booked this month.",
  announcementLink: "",
  topBarStyle: "default",
  topBarBgColor: "",
  topBarTextColor: "",
  popupEnabled: false,
  popupImage: "",
  popupLink: "",
};

function StatusBadge({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
        enabled ? "bg-success-50 text-success-700" : "bg-neutral-200 text-neutral-500"
      }`}
    >
      {enabled ? "Enabled" : "Disabled"}
    </span>
  );
}

export function ComponentsTab() {
  // Shares "siteStatusSettings" with the Branding tab's construction fields.
  const { value, patch, save } = useSettingsForm<ComponentsSlice>("siteStatusSettings", DEFAULTS);
  const [openModal, setOpenModal] = useState<"topbar" | "popup" | null>(null);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-100 p-4">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-primary-50 p-2 text-primary-700">
              <LayoutTemplate className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-neutral-900">Top Bar Text</p>
              <p className="text-xs text-neutral-500">A thin bar across the top of every page.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge enabled={value.announcementEnabled} />
            <button
              type="button"
              onClick={() => setOpenModal("topbar")}
              className="grid h-9 w-9 place-items-center rounded-xl bg-primary-900 text-white hover:bg-primary-800"
              aria-label="Edit Top Bar Text"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-accent-50 p-2 text-accent-700">
              <ImageIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-neutral-900">Popup Modal</p>
              <p className="text-xs text-neutral-500">
                An image popup shown once per session. Medium and Large plans.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge enabled={value.popupEnabled} />
            <button
              type="button"
              onClick={() => setOpenModal("popup")}
              className="grid h-9 w-9 place-items-center rounded-xl bg-primary-900 text-white hover:bg-primary-800"
              aria-label="Edit Popup Modal"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {openModal === "topbar" && (
        <TopBarModal
          value={value}
          onChange={patch}
          onClose={() => setOpenModal(null)}
          onSave={() => {
            save();
            setOpenModal(null);
          }}
        />
      )}

      {openModal === "popup" && (
        <PopupEditModal
          value={value}
          onChange={patch}
          onClose={() => setOpenModal(null)}
          onSave={() => {
            save();
            setOpenModal(null);
          }}
        />
      )}
    </div>
  );
}
