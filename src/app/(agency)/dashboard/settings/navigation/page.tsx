'use client';

import { useState } from 'react';
import { Save, GripVertical, Plus, Trash2 } from 'lucide-react';

interface NavLink {
  id: string;
  label: string;
  href: string;
}

// Default navigation items
const defaultNavItems: NavLink[] = [
  { id: '1', label: 'Home', href: '/' },
  { id: '2', label: 'Packages', href: '/packages' },
  { id: '3', label: 'About', href: '/about' },
  { id: '4', label: 'Contact', href: '/contact' },
  { id: '5', label: 'Blog', href: '/blog' },
];

export default function NavigationSettingsPage() {
  const [navItems, setNavItems] = useState<NavLink[]>(() => {
    if (typeof window === 'undefined') {
      return defaultNavItems;
    }

    try {
      const stored = localStorage.getItem('navSettings');
      return stored ? (JSON.parse(stored) as NavLink[]) : defaultNavItems;
    } catch {
      return defaultNavItems;
    }
  });
  const [newLabel, setNewLabel] = useState('');
  const [newHref, setNewHref] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    localStorage.setItem('navSettings', JSON.stringify(navItems));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Add new link
  const addLink = () => {
    if (!newLabel.trim() || !newHref.trim()) return;
    const newId = String(Date.now());
    setNavItems([...navItems, { id: newId, label: newLabel, href: newHref }]);
    setNewLabel('');
    setNewHref('');
  };

  // Remove link
  const removeLink = (id: string) => {
    setNavItems(navItems.filter((item) => item.id !== id));
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...navItems];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setNavItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Navigation</h1>
          <p className="text-sm text-neutral-500">Manage your website navigation menu</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50">
          Navigation settings saved successfully! 🎉
        </div>
      )}

      <div className="space-y-6">
        {/* Current Navigation Items */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
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
                  className={`flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-lg cursor-move transition-colors ${
                    draggedIndex === index ? 'opacity-50 border-blue-400' : ''
                  }`}
                >
                  <GripVertical size={18} className="text-neutral-400" />
                  <span className="flex-1 font-medium text-neutral-900">{item.label}</span>
                  <span className="text-sm text-neutral-500">{item.href}</span>
                  <button
                    onClick={() => removeLink(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-3">
            Drag items to reorder. The order shown here determines the menu order.
          </p>
        </div>

        {/* Add New Link */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-neutral-700 mb-3">Add New Link</h3>
          <div className="flex flex-col text-black sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-neutral-600 mb-0.5">
                Label
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full border border-neutral-300 rounded px-3 py-1.5 text-sm"
                placeholder="e.g., About Us"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-neutral-600 mb-0.5">
                URL
              </label>
              <input
                type="text"
                value={newHref}
                onChange={(e) => setNewHref(e.target.value)}
                className="w-full border border-neutral-300 rounded px-3 py-1.5 text-sm"
                placeholder="e.g., /about"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={addLink}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}