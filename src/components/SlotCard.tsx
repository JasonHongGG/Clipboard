import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { ClipboardSlot } from '../types';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { motion } from 'framer-motion';
import { Window } from '@tauri-apps/api/window';
import './SlotCard.css';

interface SlotCardProps {
  slot: ClipboardSlot;
}

export const SlotCard: React.FC<SlotCardProps> = ({ slot }) => {
  const [copied, setCopied] = useState(false);
  const isEmpty = !slot.content;

  const handleCopy = async () => {
    if (isEmpty) return;
    try {
      await writeText(slot.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleEditClick = async () => {
    if (isEmpty) {
      try {
        const settingsWin = new Window('settings');
        await settingsWin.show();
        await settingsWin.setFocus();
      } catch (e) {
        console.error('Failed to open settings', e);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <motion.div 
      className={`slot-row ${copied ? 'slot-copied' : ''} ${isEmpty ? 'slot-empty' : ''}`} 
      onClick={handleEditClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="slot-shortcut-indicator">
        <span className="font-display">{slot.id}</span>
      </div>
      
      <div className="slot-row-body">
        <div className="slot-name font-display">{slot.name || `Slot ${slot.id}`}</div>
        {isEmpty ? (
          <div className="slot-empty-text">Empty - Click to add content</div>
        ) : (
          <div className="slot-content-preview">{slot.content}</div>
        )}
      </div>

      {!isEmpty && (
        <button 
          className="slot-copy-action" 
          onClick={(e) => { e.stopPropagation(); handleCopy(); }}
          title="Copy"
        >
          {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
        </button>
      )}
    </motion.div>
  );
};
