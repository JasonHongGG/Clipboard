import React, { useEffect } from 'react';
import { useAppStore } from '../store';
import { SlotCard } from './SlotCard';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { register, unregister } from '@tauri-apps/plugin-global-shortcut';
import { getCurrentWindow } from '@tauri-apps/api/window';
import './SlotList.css';

export const SlotList: React.FC = () => {
  const { slots } = useAppStore();

  useEffect(() => {
    let activeShortcuts = false;

    const setupShortcuts = async () => {
      try {
        for (let i = 1; i <= 5; i++) {
          const shortcut = `Alt+${i}`;
          await register(shortcut, async (event) => {
            if (event.state === 'Pressed') {
              const currentSlots = useAppStore.getState().slots;
              const slot = currentSlots[i - 1];
              if (slot && slot.content) {
                await writeText(slot.content);
              }
            }
          });
        }
        await register('Insert', async (event) => {
          if (event.state === 'Pressed') {
            const win = getCurrentWindow();
            const isVisible = await win.isVisible();
            if (isVisible) {
              await win.hide();
            } else {
              await win.show();
              await win.setFocus();
            }
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
  }, []);

  return (
    <div className="slot-list-container no-drag">
      {slots.map(slot => (
        <SlotCard key={slot.id} slot={slot} />
      ))}
    </div>
  );
};
