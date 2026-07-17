import React, { useEffect, useState } from 'react';
import { TitleBar } from './components/TitleBar';
import { SlotList } from './components/SlotList';
import { SettingsPanel } from './components/SettingsPanel';
import { useAppStore, initStore } from './store';
import { AnimatePresence, motion } from 'framer-motion';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { register, unregister } from '@tauri-apps/plugin-global-shortcut';
import { getCurrentWindow } from '@tauri-apps/api/window';

const App: React.FC = () => {
  const [isSettingsWindow, setIsSettingsWindow] = useState(false);

  useEffect(() => {
    initStore();

    // Check if this window was opened with ?window=settings
    const params = new URLSearchParams(window.location.search);
    if (params.get('window') === 'settings') {
      setIsSettingsWindow(true);
    }

    // Global Undo/Redo listener
    const handleKeyDown = (e: KeyboardEvent) => {
      // If we are in an input/textarea and the event isn't prevented, it will naturally undo text
      // However, the user explicitly asked for undo/redo of slots.
      // We will let natural undo happen inside inputs (browser handles it).
      // But if focus is not in an input, or if they press a custom shortcut, we can trigger global undo.
      
      const isInputFocused = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';
      
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          if (e.shiftKey) {
            // Redo
            if (!isInputFocused) {
              e.preventDefault();
              useAppStore.temporal.getState().redo();
            }
          } else {
            // Undo
            if (!isInputFocused) {
              e.preventDefault();
              useAppStore.temporal.getState().undo();
            }
          }
        } else if (e.key === 'y' && !isInputFocused) {
          // Redo alternate
          e.preventDefault();
          useAppStore.temporal.getState().redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Global Shortcuts
    let activeShortcuts = false;
    const setupShortcuts = async () => {
      try {
        for (let i = 0; i <= 9; i++) {
          const shortcut = `Alt+${i}`;
          await register(shortcut, async (event) => {
            if (event.state === 'Pressed') {
              const currentSlots = useAppStore.getState().slots;
              // i=1..9 maps to index 0..8. i=0 maps to index 9
              const slotIndex = i === 0 ? 9 : i - 1;
              const slot = currentSlots[slotIndex];
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
      window.removeEventListener('keydown', handleKeyDown);
      if (activeShortcuts) {
        for (let i = 0; i <= 9; i++) {
           unregister(`Alt+${i}`).catch(console.error);
        }
        unregister('Insert').catch(console.error);
      }
    };
  }, []);

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        {isSettingsWindow ? (
          <SettingsPanel key="settings" />
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}
          >
            <TitleBar />
            <SlotList />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
