import React, { useEffect } from 'react';
import { Settings, Copy } from 'lucide-react';
import { useAppStore } from '../store';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { register, unregister } from '@tauri-apps/plugin-global-shortcut';

export const FloatingWidget: React.FC = () => {
  const { slots, isVisible, toggleSettings, toggleVisibility } = useAppStore();

  useEffect(() => {
    let activeShortcuts = false;

    const setupShortcuts = async () => {
      try {
        for (let i = 1; i <= 5; i++) {
          const shortcut = `Alt+${i}`;
          await register(shortcut, async (event) => {
            if (event.state === 'Pressed') {
              const slot = slots[i - 1];
              if (slot && slot.content) {
                await writeText(slot.content);
              }
            }
          });
        }
        await register('Insert', (event) => {
          if (event.state === 'Pressed') {
            toggleVisibility();
          }
        });
        activeShortcuts = true;
      } catch (e) {
        console.error('Failed to register shortcuts:', e);
      }
    };

    setupShortcuts();

    return () => {
      if (activeShortcuts) {
        for (let i = 1; i <= 5; i++) {
           unregister(`Alt+${i}`).catch(console.error);
        }
        unregister('Insert').catch(console.error);
      }
    };
  }, [slots, toggleVisibility]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-10 right-10 w-72 glass-container animate-slide-in p-4 drag-region text-sm">
      <div className="flex justify-between items-center mb-4 no-drag">
        <h2 className="font-semibold flex items-center gap-2">
          <Copy size={16} className="text-[var(--primary-color)]" />
          SolarClip
        </h2>
        <button 
          onClick={toggleSettings}
          className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
        >
          <Settings size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-2 no-drag">
        {slots.map((slot, idx) => (
          <div 
            key={slot.id}
            className="flex flex-col p-2.5 rounded-lg border border-[var(--border-color)] bg-white/30 dark:bg-black/30 hover:bg-white/50 dark:hover:bg-black/50 transition-colors cursor-pointer group"
            onClick={() => writeText(slot.content)}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-xs text-[var(--text-muted)]">Alt+{idx + 1} | {slot.name}</span>
            </div>
            <div className="text-xs truncate opacity-80" title={slot.content}>
              {slot.content || <span className="italic opacity-50">Empty</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
