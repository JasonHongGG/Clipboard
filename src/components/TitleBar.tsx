import React from 'react';
import { Minus, X, Settings } from 'lucide-react';
import { getCurrentWindow, Window } from '@tauri-apps/api/window';
import './TitleBar.css';

export const TitleBar: React.FC = () => {
  const minimizeWindow = async () => {
    await getCurrentWindow().minimize();
  };

  const hideWindow = async () => {
    // Hide instead of close so global shortcuts keep working in background
    await getCurrentWindow().hide(); 
  };

  const openSettings = async () => {
    try {
      const settingsWin = new Window('settings');
      await settingsWin.show();
      await settingsWin.setFocus();
    } catch (e) {
      console.error('Failed to open settings window', e);
    }
  };

  return (
    <div className="titlebar drag-region">
      <div className="titlebar-brand no-drag">
        <span className="titlebar-title font-mono">SolarClip</span>
      </div>
      <div className="titlebar-controls no-drag">
        <button className="btn-icon" onClick={openSettings} title="Settings">
          <Settings size={14} />
        </button>
        <button className="btn-icon" onClick={minimizeWindow} title="Minimize">
          <Minus size={14} />
        </button>
        <button className="btn-icon titlebar-btn-close" onClick={hideWindow} title="Close">
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
