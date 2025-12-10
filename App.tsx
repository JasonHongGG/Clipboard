import React, { useState, useEffect } from 'react';
import { FloatingClipboard } from './components/FloatingClipboard';
import { SettingsModal } from './components/SettingsModal';
import { ClipboardSlot, ThemeMode } from './types';
import { DEFAULT_SLOTS } from './constants';

const App: React.FC = () => {
  // Application State
  const [slots, setSlots] = useState<ClipboardSlot[]>(DEFAULT_SLOTS);

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('solarclip_theme');
    return (saved as ThemeMode) || 'light';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load slots from JSON config (Electron) or localStorage fallback (web)
  useEffect(() => {
    const load = async () => {
      try {
        if (window.electronAPI?.loadSlotsConfig) {
          const data = await window.electronAPI.loadSlotsConfig();
          if (Array.isArray(data)) {
            setSlots(data as ClipboardSlot[]);
          }
        } else {
          const saved = localStorage.getItem('solarclip_slots');
          if (saved) {
            setSlots(JSON.parse(saved));
          }
        }
      } catch (err) {
        console.error('Failed to load slots config:', err);
      } finally {
        setIsLoaded(true);
      }
    };
    load();
  }, []);

  // Persistence: save slots to JSON config or localStorage
  useEffect(() => {
    if (!isLoaded) return;

    const save = async () => {
      try {
        if (window.electronAPI?.saveSlotsConfig) {
          await window.electronAPI.saveSlotsConfig(slots);
        } else {
          localStorage.setItem('solarclip_slots', JSON.stringify(slots));
        }
      } catch (err) {
        console.error('Failed to save slots config:', err);
      }
    };
    save();
  }, [slots, isLoaded]);

  useEffect(() => {
    localStorage.setItem('solarclip_theme', themeMode);
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  // Initial Electron Mouse Event Setup
  // We use a Set to track multiple concurrent interaction sources (e.g. dragging widget while settings is open)
  const [activeInteractions, setActiveInteractions] = useState<Set<string>>(new Set());

  // Centralized handler for managing pass-through state
  const handleInteraction = React.useCallback((id: string, isActive: boolean) => {
    setActiveInteractions(prev => {
      const next = new Set(prev);
      if (isActive) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  // Sync Electron window state with active interactions
  useEffect(() => {
    if (window.electronAPI) {
      if (activeInteractions.size > 0) {
        // If there's any active interaction, capture mouse events
        window.electronAPI.setIgnoreMouseEvents(false);
      } else {
        // Otherwise, let them pass through to the background
        window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
      }
    }
  }, [activeInteractions]);

  // Handlers
  const handleUpdateSlot = (id: number, field: keyof ClipboardSlot, value: string) => {
    setSlots(prev => prev.map(slot =>
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  const handleCloseApp = () => {
    window.close();
  };

  const [isElectronAvailable, setIsElectronAvailable] = useState(true);
  useEffect(() => {
    if (!window.electronAPI) {
      setIsElectronAvailable(false);
      console.error('Electron API not found');
    }
  }, []);

  // Global Hotkeys: Alt+1~5 copy slots, Insert toggle visibility
  useEffect(() => {
    if (window.electronAPI?.onGlobalHotkey) {
      return;
    }

    const handleKeyDown = async (event: KeyboardEvent) => {
      // Alt + 1~5 => copy corresponding slot
      if (event.altKey) {
        const num = Number(event.key);
        if (num >= 1 && num <= 5) {
          event.preventDefault();
          const slot = slots[num - 1];
          if (slot && slot.content) {
            try {
              await navigator.clipboard.writeText(slot.content);
            } catch (err) {
              console.error('Failed to copy via hotkey:', err);
            }
          }
          return;
        }
      }

      // Insert => toggle app visibility
      if (event.key === 'Insert') {
        event.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slots]);

  // Electron global hotkey bridge
  useEffect(() => {
    if (!window.electronAPI?.onGlobalHotkey) {
      return;
    }

    const unsubscribe = window.electronAPI.onGlobalHotkey(async (payload) => {
      if (payload.action === 'copy-slot' && typeof payload.slotIndex === 'number') {
        const slot = slots[payload.slotIndex];
        if (slot?.content) {
          try {
            if (window.electronAPI?.copyToClipboard) {
              await window.electronAPI.copyToClipboard(slot.content);
            } else {
              await navigator.clipboard.writeText(slot.content);
            }
          } catch (err) {
            console.error('Failed to copy via global hotkey:', err);
          }
        }
        return;
      }

      if (payload.action === 'toggle-visibility') {
        setIsVisible((prev) => !prev);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [slots]);

  return (
    <div className={`w-full h-full relative transition-colors duration-300 ${themeMode === 'dark' ? 'dark' : ''}`}>

      {!isElectronAvailable && (
        <div className="fixed top-0 left-0 bg-red-500 text-white p-2 z-[100]">
          Error: Electron API not loaded. Check preload script.
        </div>
      )}

      {/* Main Floating Widget */}
      {isVisible && (
        <FloatingClipboard
          slots={slots}
          themeMode={themeMode}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isSettingsOpen={isSettingsOpen}
          // ID used for tracking this specific interaction source
          onInteraction={(active) => handleInteraction('floating-widget', active)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && isVisible && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          themeMode={themeMode}
          onToggleTheme={() => setThemeMode(prev => prev === 'light' ? 'dark' : 'light')}
          slots={slots}
          onUpdateSlot={handleUpdateSlot}
          onCloseApp={handleCloseApp}
          // ID used for tracking this specific interaction source
          onInteraction={(active) => handleInteraction('settings-modal', active)}
        />
      )}
    </div>
  );
};

export default App;