"use client";

import { X } from "lucide-react";
import { Field, TextInput, ToggleRow } from "@/components/agency/settings/settings-kit";
import type { TopBarStyle } from "./ComponentsTab";

export interface TopBarModalValue {
  announcementEnabled: boolean;
  announcementText: string;
  announcementLink: string;
  topBarStyle: TopBarStyle;
  topBarBgColor: string;
  topBarTextColor: string;
}

export function TopBarModal({
  value,
  onChange,
  onClose,
  onSave,
}: {
  value: TopBarModalValue;
  onChange: (patch: Partial<TopBarModalValue>) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">Change Top Bar Text</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-200 p-1.5 text-neutral-500 hover:text-neutral-700"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <ToggleRow
            label="Enabled"
            checked={value.announcementEnabled}
            onChange={(v) => onChange({ announcementEnabled: v })}
          />

          <Field label="Top Bar Text">
            <TextInput
              value={value.announcementText}
              onChange={(e) => onChange({ announcementText: e.target.value })}
              placeholder="eg. Upto 35% OFF | Book Now"
              maxLength={140}
            />
          </Field>

          <Field label="Goto link when clicked">
            <TextInput
              value={value.announcementLink}
              onChange={(e) => onChange({ announcementLink: e.target.value })}
              placeholder="eg. /packages/annapurna-circuit"
            />
          </Field>

          <Field label="Top Bar Style">
            <select
              value={value.topBarStyle}
              onChange={(e) => onChange({ topBarStyle: e.target.value as TopBarStyle })}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50"
            >
              <option value="default">Default</option>
              <option value="scrolling">Scrolling</option>
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Background Color" hint="Default: theme color">
              <input
                type="color"
                value={value.topBarBgColor || "#6C72FF"}
                onChange={(e) => onChange({ topBarBgColor: e.target.value })}
                className="h-10 w-full cursor-pointer rounded-lg border border-neutral-200"
              />
            </Field>
            <Field label="Text Color" hint="Default: white">
              <input
                type="color"
                value={value.topBarTextColor || "#ffffff"}
                onChange={(e) => onChange({ topBarTextColor: e.target.value })}
                className="h-10 w-full cursor-pointer rounded-lg border border-neutral-200"
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
