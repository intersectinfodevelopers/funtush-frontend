"use client";

import { X, ImagePlus } from "lucide-react";
import { Field, TextInput, ToggleRow } from "@/components/agency/settings/settings-kit";

export interface PopupModalValue {
  popupEnabled: boolean;
  popupImage: string;
  popupLink: string;
}

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export function PopupEditModal({
  value,
  onChange,
  onClose,
  onSave,
}: {
  value: PopupModalValue;
  onChange: (patch: Partial<PopupModalValue>) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const onUpload = (file: File) => {
    if (!file.type.startsWith("image/") || file.size > MAX_IMAGE_BYTES) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") onChange({ popupImage: result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">Popup Modal Update</h2>
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
            description="Medium and Large plans only."
            checked={value.popupEnabled}
            onChange={(v) => onChange({ popupEnabled: v })}
          />

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Popup Image</label>
            <p className="mb-2 text-xs text-neutral-400">Best fit: 1024 × 1024</p>
            <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 text-neutral-400 transition hover:border-primary-300 hover:text-primary-600">
              {value.popupImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={value.popupImage} alt="Popup" className="h-full w-full rounded-xl object-cover" />
              ) : (
                <>
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-xs font-medium">Click to upload</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(file);
                  e.target.value = "";
                }}
              />
            </label>
          </div>

          <Field label="OnClick Goto Link" hint="Where the visitor lands when they tap the image.">
            <TextInput
              value={value.popupLink}
              onChange={(e) => onChange({ popupLink: e.target.value })}
              placeholder="eg. /packages/everest-base-camp"
            />
          </Field>
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
