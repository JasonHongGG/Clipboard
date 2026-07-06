import React, { useState, useEffect } from 'react';
import { Minus, X, Moon, Sun, Save, Edit3 } from 'lucide-react';
import { useAppStore } from '../store';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { motion } from 'framer-motion';
import './SettingsPanel.css';
import './TitleBar.css';

export const SettingsPanel: React.FC = () => {
  const { slots, theme, setTheme, updateSlot } = useAppStore();
  const [localSlots, setLocalSlots] = useState(slots);

  useEffect(() => {
    setLocalSlots(slots);
  }, [slots]);

  const handleSave = () => {
    localSlots.forEach(slot => {
      updateSlot(slot.id, slot.content, slot.name);
    });
  };

  const minimizeWindow = async () => {
    await getCurrentWindow().minimize();
  };

  const hideWindow = async () => {
    await getCurrentWindow().hide();
  };

  return (
    <motion.div 
      className="settings-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="titlebar drag-region">
        <div className="titlebar-brand no-drag">
          <span className="titlebar-title">Setting</span>
        </div>
        <div className="titlebar-controls no-drag">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="titlebar-btn"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>
          <button className="titlebar-btn" onClick={minimizeWindow} title="Minimize">
            <Minus size={14} />
          </button>
          <button className="titlebar-btn titlebar-btn-close" onClick={hideWindow} title="Close">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="settings-body">
        <div className="settings-section-title">
          <Edit3 size={16} className="text-accent" />
          <span>Clipboard Slots</span>
        </div>
        <div className="settings-slots-grid">
          {localSlots.map(slot => (
            <div key={slot.id} className="settings-card">
              <div className="settings-card-header">
                <span className="settings-badge">Alt+{slot.id}</span>
                <input
                  type="text"
                  value={slot.name}
                  onChange={(e) => setLocalSlots(prev => prev.map(s => s.id === slot.id ? { ...s, name: e.target.value } : s))}
                  className="settings-input settings-input-title"
                  placeholder="Slot Name"
                />
              </div>
              <textarea
                value={slot.content}
                onChange={(e) => setLocalSlots(prev => prev.map(s => s.id === slot.id ? { ...s, content: e.target.value } : s))}
                className="settings-textarea"
                placeholder="Content..."
              />
            </div>
          ))}
        </div>
      </div>

      <div className="settings-footer">
        <button onClick={handleSave} className="btn-primary">
          <Save size={16} /> Save Changes
        </button>
      </div>
    </motion.div>
  );
};
