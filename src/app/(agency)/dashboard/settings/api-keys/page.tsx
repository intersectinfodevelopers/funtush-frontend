"use client";

import { useState } from "react";
import { Copy, KeyRound, Plus, Trash2, Check } from "lucide-react";
import {
  Field,
  SettingsHeader,
  SettingsSection,
  TextInput,
  useSettingsToast,
} from "@/components/agency/settings/settings-kit";

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  scope: "read" | "read-write";
  createdAt: string;
  lastUsedAt: string | null;
};

const STORE = "apiKeySettings";

function randomKey() {
  const body = Array.from({ length: 32 }, () =>
    "abcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * 36)),
  ).join("");
  return `ftk_live_${body}`;
}

function readKeys(): ApiKey[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE);
    return raw ? (JSON.parse(raw) as ApiKey[]) : [];
  } catch {
    return [];
  }
}

export default function ApiKeysSettingsPage() {
  const toast = useSettingsToast();
  const [keys, setKeys] = useState<ApiKey[]>(readKeys);
  const [name, setName] = useState("");
  const [scope, setScope] = useState<ApiKey["scope"]>("read");
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const persist = (next: ApiKey[]) => {
    setKeys(next);
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const create = () => {
    if (!name.trim()) {
      toast("Give the key a name first");
      return;
    }
    const raw = randomKey();
    const key: ApiKey = {
      id: `key-${Date.now()}`,
      name: name.trim(),
      prefix: raw.slice(0, 16),
      scope,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
    };
    persist([key, ...keys]);
    setFreshKey(raw);
    setName("");
    setScope("read");
    toast("Key created");
  };

  const revoke = (id: string) => persist(keys.filter((k) => k.id !== id));

  const copy = async () => {
    if (!freshKey) return;
    try {
      await navigator.clipboard.writeText(freshKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="API keys"
        description="Keys authenticate programmatic access to your agency data. Treat them like passwords."
      />

      {freshKey && (
        <div className="rounded-2xl border border-warning-300 bg-warning-50 p-4">
          <p className="text-sm font-semibold text-warning-900">
            Copy your key now — it will not be shown again.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-lg border border-warning-200 bg-white px-3 py-2 text-xs text-neutral-800">
              {freshKey}
            </code>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-warning-600 px-3 py-2 text-sm font-semibold text-white hover:bg-warning-700"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setFreshKey(null)}
            className="mt-2 text-xs font-semibold text-warning-800 underline"
          >
            I have saved it — hide
          </button>
        </div>
      )}

      <SettingsSection title="Create a key">
        <div className="grid gap-4 sm:grid-cols-[1fr_12rem_auto] sm:items-end">
          <Field label="Name" hint="What is this key for?">
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Zapier integration"
            />
          </Field>
          <Field label="Scope">
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as ApiKey["scope"])}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50"
            >
              <option value="read">Read only</option>
              <option value="read-write">Read &amp; write</option>
            </select>
          </Field>
          <button
            type="button"
            onClick={create}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
          >
            <Plus className="h-4 w-4" /> Create
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Active keys" description={`${keys.length} key${keys.length === 1 ? "" : "s"}`}>
        {keys.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 px-4 py-10 text-center text-sm text-neutral-500">
            No keys yet.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {keys.map((k) => (
              <li key={k.id} className="flex items-center gap-3 py-3">
                <span className="rounded-xl bg-primary-50 p-2 text-primary-700">
                  <KeyRound className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-neutral-900">{k.name}</p>
                  <p className="text-xs text-neutral-500">
                    <code>{k.prefix}…</code> · {k.scope === "read" ? "Read only" : "Read & write"} ·
                    created {new Date(k.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => revoke(k.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-danger-200 bg-danger-50 px-2.5 py-1.5 text-xs font-semibold text-danger-700 hover:bg-danger-100"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Revoke
                </button>
              </li>
            ))}
          </ul>
        )}
      </SettingsSection>
    </div>
  );
}
