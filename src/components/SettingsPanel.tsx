import React, { useState, useEffect } from 'react';
import { Minus, X, Moon, Sun, Edit3 } from 'lucide-react';
import { useAppStore } from '../store';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { motion } from 'framer-motion';
import { ClipboardSlot } from '../types';
import './SettingsPanel.css';
import './TitleBar.css';

const SlotEditor: React.FC<{ slot: ClipboardSlot }> = ({ slot }) => {
  const updateSlot = useAppStore(state => state.updateSlot);
  const [name, setName] = useState(slot.name);
  const [content, setContent] = useState(slot.content);

  useEffect(() => {
    setName(slot.name);
    setContent(slot.content);
  }, [slot.name, slot.content]);

  // Debounce the update to store to create clean history steps
  useEffect(() => {
    const handler = setTimeout(() => {
      if (name !== slot.name || content !== slot.content) {
        updateSlot(slot.id, content, name);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [name, content, slot.id, slot.name, slot.content, updateSlot]);

  return (
    <div className="cyber-card settings-card">
      <div className="settings-card-header">
        <span className="cyber-badge">Alt+{slot.id}</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="settings-input"
          placeholder="Slot Name"
        />
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="settings-textarea"
        placeholder="Content..."
      />
    </div>
  );
};

export const SettingsPanel: React.FC = () => {
  const { slots, theme, setTheme } = useAppStore();

  const minimizeWindow = async () => {
    await getCurrentWindow().minimize();
  };

  const hideWindow = async () => {
    await getCurrentWindow().hide();
  };

  return (
    <motion.div 
      className="settings-panel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="titlebar drag-region">
        <div className="titlebar-brand no-drag">
          <span className="titlebar-title font-mono">Setting</span>
        </div>
        <div className="titlebar-controls no-drag">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="btn-icon"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>
          <button className="btn-icon" onClick={minimizeWindow} title="Minimize">
            <Minus size={14} />
          </button>
          <button className="btn-icon" onClick={hideWindow} title="Close">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="settings-body">
        <div className="settings-section-title">
          <Edit3 size={16} className="text-accent" />
          <span className="font-mono">Clipboard Slots</span>
        </div>
        <div className="settings-slots-grid">
          {slots.map(slot => (
            <SlotEditor key={slot.id} slot={slot} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
