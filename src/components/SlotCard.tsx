import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { ClipboardSlot } from '../types';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { motion } from 'framer-motion';
import './SlotCard.css';

interface SlotCardProps {
  slot: ClipboardSlot;
}

export const SlotCard: React.FC<SlotCardProps> = ({ slot }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!slot.content) return;
    try {
      await writeText(slot.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <motion.div 
      className={`cyber-card slot-card ${copied ? 'slot-copied' : ''}`} 
      onClick={handleCopy}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="slot-card-header">
        <div className="slot-card-meta">
          <span className="cyber-badge">Alt+{slot.id}</span>
          {copied && <span className="cyber-badge badge-success"><Check size={10} style={{marginRight: 4}}/>COPIED</span>}
        </div>
      </div>
      <div className="slot-card-body">
        <h3 className="slot-card-name font-mono">{slot.name || `Slot ${slot.id}`}</h3>
        {slot.content && <p className="slot-card-preview">{slot.content}</p>}
      </div>
    </motion.div>
  );
};
