'use client';

import { useState } from 'react';
import { Save, GripVertical, Plus, Trash2, ChevronDown, Link2 } from 'lucide-react';
import { SettingsHeader } from '@/components/agency/settings/settings-kit';

type NavItemType = 'link' | 'dropdown';

interface NavChild {
  id: string;
  label: string;
  href: string;
}

interface NavLink {
  id: string;
  label: string;
  type: NavItemType;
  /** Only meaningful when type === 'link'. */
  href: string;
  /** Only meaningful when type === 'dropdown'. */
  children: NavChild[];
}

// Default navigation items
const defaultNavItems: NavLink[] = [
  { id: '1', label: 'Home', type: 'link', href: '/', children: [] },
  {
    id: '2',
    label: 'Treks',
    type: 'dropdown',
    href: '',
    children: [
      { id: '2-1', label: 'All Packages', href: '/packages' },
      { id: '2-2', label: 'Destinations', href: '/destinations' },
    ],
  },
  { id: '3', label: 'About', type: 'link', href: '/about', children: [] },
  { id: '4', label: 'Contact', type: 'link', href: '/contact', children: [] },
  { id: '5', label: 'Blog', type: 'link', href: '/blog', children: [] },
];

/** Older saved settings only had { id, label, href } — upgrade them to the new shape. */
function migrate(raw: unknown): NavLink[] {
  if (!Array.isArray(raw)) return defaultNavItems;
  return raw.map((item: Partial<NavLink> & { href?: string }) => ({
    id: item.id ?? String(Date.now() + Math.random()),
    label: item.label ?? '',
    type: item.type === 'dropdown' ? 'dropdown' : 'link',
    href: item.href ?? '',
    children: Array.isArray(item.children) ? item.children : [],
  }));
}

export default function NavigationSettingsPage() {
  const [navItems, setNavItems] = useState<NavLink[]>(() => {
    if (typeof window === 'undefined') return defaultNavItems;
    try {
      const stored = localStorage.getItem('navSettings');
      return stored ? migrate(JSON.parse(stored)) : defaultNavItems;
    } catch {
      return defaultNavItems;
    }
  });
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<NavItemType>('link');
  const [newHref, setNewHref] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [childDraft, setChildDraft] = useState<Record<string, { label: string; href: string }>>({});

  const handleSave = () => {
    localStorage.setItem('navSettings', JSON.stringify(navItems));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Add new top-level item
  const addLink = () => {
    if (!newLabel.trim()) return;
    if (newType === 'link' && !newHref.trim()) return;
    const newId = String(Date.now());
    setNavItems([
      ...navItems,
      { id: newId, label: newLabel.trim(), type: newType, href: newHref.trim(), children: [] },
    ]);
    setNewLabel('');
    setNewHref('');
    setNewType('link');
  };

  const removeLink = (id: string) => {
    setNavItems(navItems.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, patch: Partial<NavLink>) => {
    setNavItems(navItems.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  // Dropdown children
  const addChild = (parentId: string) => {
    const draft = childDraft[parentId];
    if (!draft?.label.trim() || !draft?.href.trim()) return;
    setNavItems(
      navItems.map((item) =>
        item.id === parentId
          ? {
              ...item,
              children: [
                ...item.children,
                { id: `${parentId}-${Date.now()}`, label: draft.label.trim(), href: draft.href.trim() },
              ],
            }
          : item,
      ),
    );
    setChildDraft({ ...childDraft, [parentId]: { label: '', href: '' } });
  };

  const removeChild = (parentId: string, childId: string) => {
    setNavItems(
      navItems.map((item) =>
        item.id === parentId
          ? { ...item, children: item.children.filter((c) => c.id !== childId) }
          : item,
      ),
    );
  };

  // Drag and drop handlers (top-level order only)
  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newItems = [...navItems];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setNavItems(newItems);
    setDraggedIndex(index);
  };
  const handleDragEnd = () => setDraggedIndex(null);

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Navigation"
        description="Manage your website navigation menu"
        action={
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
          >
            <Save size={18} />
            Save changes
          </button>
        }
      />

      {showToast && (
        <div className="fixed top-4 right-4 bg-success-50 border border-success-200 text-success-800 px-4 py-3 rounded-xl shadow-lg z-50">
          Navigation settings saved successfully! 🎉
        </div>
      )}

      <div className="space-y-6">
        {/* Current Navigation Items */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <h3 className="text-sm font-medium text-neutral-700 mb-3">Menu Items</h3>
          <div className="space-y-2">
            {navItems.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-4">
                No navigation items yet. Add one below.
              </p>
            ) : (
              navItems.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`bg-neutral-50 border border-neutral-200 rounded-xl transition-colors ${
                    draggedIndex === index ? 'opacity-50 border-primary-400' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 p-3 cursor-move">
                    <GripVertical size={18} className="text-neutral-400 shrink-0" />
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateItem(item.id, { label: e.target.value })}
                      className="w-32 shrink-0 border border-neutral-300 rounded-lg px-2 py-1 text-sm font-medium text-neutral-900"
                    />

                    <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-0.5 text-xs shrink-0">
                      <button
                        onClick={() => updateItem(item.id, { type: 'link' })}
                        className={`flex items-center gap-1 rounded px-2 py-1 ${
                          item.type === 'link' ? 'bg-primary-100 text-primary-700' : 'text-neutral-500'
                        }`}
                      >
                        <Link2 size={12} /> Link
                      </button>
                      <button
                        onClick={() => updateItem(item.id, { type: 'dropdown' })}
                        className={`flex items-center gap-1 rounded px-2 py-1 ${
                          item.type === 'dropdown' ? 'bg-primary-100 text-primary-700' : 'text-neutral-500'
                        }`}
                      >
                        <ChevronDown size={12} /> Dropdown
                      </button>
                    </div>

                    {item.type === 'link' ? (
                      <input
                        type="text"
                        value={item.href}
                        onChange={(e) => updateItem(item.id, { href: e.target.value })}
                        placeholder="/page"
                        className="flex-1 border border-neutral-300 rounded-lg px-2 py-1 text-sm text-neutral-600"
                      />
                    ) : (
                      <span className="flex-1 text-xs text-neutral-500">
                        {item.children.length} sub-item{item.children.length === 1 ? '' : 's'}
                      </span>
                    )}

                    <button
                      onClick={() => removeLink(item.id)}
                      className="text-danger-600 hover:text-danger-700 shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Dropdown sub-items */}
                  {item.type === 'dropdown' && (
                    <div className="border-t border-neutral-200 bg-white/60 p-3 pl-10 space-y-2">
                      {item.children.map((child) => (
                        <div key={child.id} className="flex items-center gap-2 text-sm">
                          <span className="flex-1 text-neutral-800">{child.label}</span>
                          <span className="flex-1 text-neutral-500">{child.href}</span>
                          <button
                            onClick={() => removeChild(item.id, child.id)}
                            className="text-danger-600 hover:text-danger-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          value={childDraft[item.id]?.label ?? ''}
                          onChange={(e) =>
                            setChildDraft({
                              ...childDraft,
                              [item.id]: { label: e.target.value, href: childDraft[item.id]?.href ?? '' },
                            })
                          }
                          placeholder="Sub-item label"
                          className="flex-1 border border-neutral-300 rounded-lg px-2 py-1 text-xs"
                        />
                        <input
                          type="text"
                          value={childDraft[item.id]?.href ?? ''}
                          onChange={(e) =>
                            setChildDraft({
                              ...childDraft,
                              [item.id]: { label: childDraft[item.id]?.label ?? '', href: e.target.value },
                            })
                          }
                          placeholder="/sub-page"
                          className="flex-1 border border-neutral-300 rounded-lg px-2 py-1 text-xs"
                        />
                        <button
                          onClick={() => addChild(item.id)}
                          className="flex items-center gap-1 rounded-lg bg-neutral-800 px-2.5 py-1 text-xs text-white hover:bg-neutral-700"
                        >
                          <Plus size={12} /> Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-3">
            Drag items to reorder. Set a menu item to &quot;Dropdown&quot; to nest links under it.
          </p>
        </div>

        {/* Add New Item */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <h3 className="text-sm font-medium text-neutral-700 mb-3">Add New Menu Item</h3>
          <div className="flex flex-col text-neutral-900 sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-neutral-600 mb-0.5">Label</label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
                placeholder="e.g., About Us"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-0.5">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as NavItemType)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-1.5 text-sm sm:w-36"
              >
                <option value="link">Link</option>
                <option value="dropdown">Dropdown</option>
              </select>
            </div>
            {newType === 'link' && (
              <div className="flex-1">
                <label className="block text-xs font-medium text-neutral-600 mb-0.5">URL</label>
                <input
                  type="text"
                  value={newHref}
                  onChange={(e) => setNewHref(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
                  placeholder="e.g., /about"
                />
              </div>
            )}
            <div className="flex items-end">
              <button
                onClick={addLink}
                className="flex items-center gap-2 bg-primary-900 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-primary-800 transition-colors"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
          </div>
          {newType === 'dropdown' && (
            <p className="text-xs text-neutral-500 mt-2">
              Add the item first, then add its sub-links inline in the list above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
