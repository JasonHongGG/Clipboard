import React, { useState } from 'react';
import { Copy, Check, MoreHorizontal } from 'lucide-react';
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
      className="slot-card" 
      onClick={handleCopy}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="slot-card-header">
        <div className="slot-card-title-group">
          <div className="slot-card-badge">Alt+{slot.id}</div>
          <span className="slot-card-name">{slot.name}</span>
        </div>
        <button 
          className={`slot-card-copy-btn ${copied ? 'copied' : ''}`} 
          title="Copy to clipboard"
          onClick={(e) => { e.stopPropagation(); handleCopy(); }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <div className="slot-card-body">
        {slot.content ? (
          <p className="slot-card-content">{slot.content}</p>
        ) : (
          <div className="slot-card-empty-icon">
            <MoreHorizontal size={18} />
          </div>
        )}
      </div>
    </motion.div>
  );
};
