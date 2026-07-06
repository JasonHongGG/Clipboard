import React, { useEffect, useState } from 'react';
import { TitleBar } from './components/TitleBar';
import { SlotList } from './components/SlotList';
import { SettingsPanel } from './components/SettingsPanel';
import { AppProvider, useAppStore } from './store';
import { AnimatePresence, motion } from 'framer-motion';

const AppContent: React.FC = () => {
  const { theme } = useAppStore();
  const [isSettingsWindow, setIsSettingsWindow] = useState(false);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);
  
  useEffect(() => {
    // Check if this window was opened with ?window=settings
    const params = new URLSearchParams(window.location.search);
    if (params.get('window') === 'settings') {
      setIsSettingsWindow(true);
    }
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

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
