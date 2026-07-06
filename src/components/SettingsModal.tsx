import React, { useState, useEffect } from 'react';
import { X, Moon, Sun, Save, Power } from 'lucide-react';
import { useAppStore } from '../store';
import { getCurrentWindow } from '@tauri-apps/api/window';

export const SettingsModal: React.FC = () => {
  const { slots, theme, setTheme, updateSlot, isSettingsOpen, toggleSettings } = useAppStore();
  const [localSlots, setLocalSlots] = useState(slots);

  useEffect(() => {
    setLocalSlots(slots);
  }, [slots]);

  if (!isSettingsOpen) return null;

  const handleSave = () => {
    localSlots.forEach(slot => {
      updateSlot(slot.id, slot.content, slot.name);
    });
    toggleSettings();
  };

  const handleCloseApp = async () => {
    await getCurrentWindow().close();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 animate-slide-in no-drag">
      <div className="glass-container w-[400px] max-h-[85vh] flex flex-col p-6 shadow-2xl relative">
        <div className="flex justify-between items-center mb-6 drag-region">
          <h2 className="text-xl font-bold">Settings</h2>
          <div className="flex gap-2 no-drag">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={toggleSettings}
              className="p-2 rounded-full hover:bg-red-500/20 text-red-500 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 no-drag">
          {localSlots.map(slot => (
            <div key={slot.id} className="flex flex-col gap-2 p-3 bg-white/20 dark:bg-black/20 rounded-lg border border-[var(--border-color)]">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">Slot {slot.id} <span className="text-[var(--text-muted)] text-xs font-normal ml-1">(Alt+{slot.id})</span></span>
                <input
                  type="text"
                  value={slot.name}
                  onChange={(e) => setLocalSlots(prev => prev.map(s => s.id === slot.id ? { ...s, name: e.target.value } : s))}
                  className="bg-transparent border-b border-[var(--border-color)] focus:border-[var(--primary-color)] outline-none text-sm px-1 py-0.5 w-32"
                  placeholder="Name"
                />
              </div>
              <textarea
                value={slot.content}
                onChange={(e) => setLocalSlots(prev => prev.map(s => s.id === slot.id ? { ...s, content: e.target.value } : s))}
                className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-md p-2 text-sm resize-none focus:outline-none focus:border-[var(--primary-color)] transition-colors h-20"
                placeholder="Content..."
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center no-drag">
          <button
            onClick={handleCloseApp}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer text-sm font-medium"
          >
            <Power size={16} /> Exit App
          </button>
          
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] transition-colors cursor-pointer text-sm font-medium shadow-lg"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
