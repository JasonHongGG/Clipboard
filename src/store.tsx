import { create } from 'zustand';
import { temporal } from 'zundo';
import { invoke } from '@tauri-apps/api/core';
import { ClipboardSlot, ThemeMode } from './types';

interface AppState {
  slots: ClipboardSlot[];
  theme: ThemeMode;
  isVisible: boolean;
  setTheme: (theme: ThemeMode) => void;
  updateSlot: (id: number, content: string, name: string) => void;
  setSlots: (slots: ClipboardSlot[]) => void;
  toggleVisibility: () => void;
  setIsVisible: (visible: boolean) => void;
}

export const useAppStore = create<AppState>()(
  temporal(
    (set, get) => ({
      slots: [],
      theme: 'dark',
      isVisible: true,
      
      setTheme: (theme) => {
        if (get().theme === theme) return;
        set({ theme });
        localStorage.setItem('solarclip_theme', theme);
        document.documentElement.className = theme;
      },
      
      updateSlot: (id, content, name) => {
        const newSlots = get().slots.map(s => s.id === id ? { ...s, content, name } : s);
        set({ slots: newSlots });
      },
      
      setSlots: (slots) => set({ slots }),
      
      toggleVisibility: () => {
        set(state => ({ isVisible: !state.isVisible }));
      },
      
      setIsVisible: (visible) => set({ isVisible: visible }),
    }),
    {
      partialize: (state) => ({ slots: state.slots }),
      limit: 50,
    }
  )
);

export const initStore = async () => {
  const savedTheme = localStorage.getItem('solarclip_theme') as ThemeMode;
  if (savedTheme) {
    useAppStore.setState({ theme: savedTheme });
    document.documentElement.className = savedTheme;
  } else {
    useAppStore.setState({ theme: 'dark' });
    document.documentElement.className = 'dark';
  }

  try {
    const loadedSlots = await invoke<ClipboardSlot[]>('get_slots');
    useAppStore.getState().setSlots(loadedSlots);
    useAppStore.temporal.getState().clear();
  } catch (err) {
    console.error('Failed to load slots:', err);
  }

  // Cross-window synchronization using Native HTML5 Storage Events
  window.addEventListener('storage', (e) => {
    if (e.key === 'solarclip_theme' && e.newValue) {
      const newTheme = e.newValue as ThemeMode;
      if (useAppStore.getState().theme !== newTheme) {
        useAppStore.setState({ theme: newTheme });
        document.documentElement.className = newTheme;
      }
    }
    
    if (e.key === 'solarclip_sync_slots' && e.newValue) {
      const newSlotsStr = e.newValue;
      if (JSON.stringify(useAppStore.getState().slots) !== newSlotsStr) {
        useAppStore.temporal.getState().pause();
        useAppStore.setState({ slots: JSON.parse(newSlotsStr) });
        useAppStore.temporal.getState().resume();
      }
    }
  });
};

let lastSavedSlotsStr = '';
let isInitialLoad = true;

useAppStore.subscribe((state, prevState) => {
  if (state.slots !== prevState.slots) {
    if (isInitialLoad && state.slots.length > 0) {
      isInitialLoad = false;
      return; 
    }
    const newStr = JSON.stringify(state.slots);
    if (newStr !== lastSavedSlotsStr && state.slots.length > 0) {
      lastSavedSlotsStr = newStr;
      invoke('save_slots', { slots: state.slots }).then(() => {
        // Broadcast the update to other windows via localStorage
        localStorage.setItem('solarclip_sync_slots', newStr);
      }).catch(console.error);
    }
  }
});

useAppStore.subscribe((state, prevState) => {
  if (state.isVisible !== prevState.isVisible) {
    invoke('set_ignore_cursor_events', { ignore: !state.isVisible }).catch(console.error);
  }
});
