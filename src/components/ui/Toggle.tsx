"use client";

export default function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-12 items-center rounded-full transition ${checked ? 'bg-primary-900' : 'bg-neutral-200'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}
