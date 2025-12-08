import React, { useState, useEffect } from 'react';
import { FloatingClipboard } from './components/FloatingClipboard';
import { SettingsModal } from './components/SettingsModal';
import { ClipboardSlot, ThemeMode } from './types';
import { DEFAULT_SLOTS } from './constants';

const App: React.FC = () => {
  // Application State
  const [slots, setSlots] = useState<ClipboardSlot[]>(() => {
    const saved = localStorage.getItem('solarclip_slots');
    return saved ? JSON.parse(saved) : DEFAULT_SLOTS;
  });

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('solarclip_theme');
    return (saved as ThemeMode) || 'light';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('solarclip_slots', JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    localStorage.setItem('solarclip_theme', themeMode);
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  // Initial Electron Mouse Event Setup
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
    }
  }, []);

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

  return (
    <div className={`w-full h-full relative transition-colors duration-300 ${themeMode === 'dark' ? 'dark' : ''}`}>
      
      {!isElectronAvailable && (
        <div className="fixed top-0 left-0 bg-red-500 text-white p-2 z-[100]">
          Error: Electron API not loaded. Check preload script.
        </div>
      )}

      {/* Main Floating Widget */}
      <FloatingClipboard 
        slots={slots} 
        themeMode={themeMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isSettingsOpen={isSettingsOpen}
      />

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          themeMode={themeMode}
          onToggleTheme={() => setThemeMode(prev => prev === 'light' ? 'dark' : 'light')}
          slots={slots}
          onUpdateSlot={handleUpdateSlot}
          onCloseApp={handleCloseApp}
        />
      )}
    </div>
  );
};

export default App;