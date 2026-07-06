import React, { createContext, useContext, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ClipboardSlot, ThemeMode } from './types';

interface AppState {
  slots: ClipboardSlot[];
  theme: ThemeMode;
  isSettingsOpen: boolean;
  isVisible: boolean;
  setTheme: (theme: ThemeMode) => void;
  updateSlot: (id: number, content: string, name: string) => void;
  toggleSettings: () => void;
  toggleVisibility: () => void;
  saveSlots: (newSlots: ClipboardSlot[]) => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [slots, setSlots] = useState<ClipboardSlot[]>([]);
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Initialize
  useEffect(() => {
    const init = async () => {
      try {
        const loadedSlots = await invoke<ClipboardSlot[]>('get_slots');
        setSlots(loadedSlots);
      } catch (err) {
        console.error('Failed to load slots:', err);
      }
      
      const savedTheme = localStorage.getItem('solarclip_theme') as ThemeMode;
      if (savedTheme) {
        setThemeState(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      }
    };
    init();
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('solarclip_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const saveSlots = async (newSlots: ClipboardSlot[]) => {
    setSlots(newSlots);
    try {
      await invoke('save_slots', { slots: newSlots });
    } catch (err) {
      console.error('Failed to save slots:', err);
    }
  };

  const updateSlot = (id: number, content: string, name: string) => {
    const newSlots = slots.map(s => s.id === id ? { ...s, content, name } : s);
    saveSlots(newSlots);
  };

  const toggleSettings = () => setIsSettingsOpen(prev => !prev);
  const toggleVisibility = () => setIsVisible(prev => !prev);

  // Handle Ignore cursor events (passthrough)
  useEffect(() => {
    const updateCursorEvents = async () => {
      try {
        // If not visible, ignore mouse events to pass them through
        await invoke('set_ignore_cursor_events', { ignore: !isVisible });
      } catch (err) {
        console.error('Ignore cursor error:', err);
      }
    };
    updateCursorEvents();
  }, [isVisible]);

  return (
    <AppContext.Provider value={{ slots, theme, isSettingsOpen, isVisible, setTheme, updateSlot, toggleSettings, toggleVisibility, saveSlots }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used within AppProvider');
  return ctx;
};
