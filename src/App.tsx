import React from 'react';
import { AppProvider } from './store';
import { FloatingWidget } from './components/FloatingWidget';
import { SettingsModal } from './components/SettingsModal';

const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="w-screen h-screen overflow-hidden">
        <FloatingWidget />
        <SettingsModal />
      </div>
    </AppProvider>
  );
};

export default App;
