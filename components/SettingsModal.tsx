import React, { useState, useRef, useEffect } from 'react';
import { ClipboardSlot, ThemeMode } from '../types';
import { X, Moon, Sun, Power, GripHorizontal } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  slots: ClipboardSlot[];
  onUpdateSlot: (id: number, field: keyof ClipboardSlot, value: string) => void;
  onCloseApp: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  themeMode,
  onToggleTheme,
  slots,
  onUpdateSlot,
  onCloseApp
}) => {
  // Window State
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 250, y: 100 });
  const [size, setSize] = useState({ width: 500, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Electron Mouse Event Logic
  useEffect(() => {
    if (window.electronAPI) {
      if (isHovering || isDragging || isResizing) {
        window.electronAPI.setIgnoreMouseEvents(false);
      } else {
        window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
      }
    }
  }, [isHovering, isDragging, isResizing]);

  // Styles based on theme
  // Updated text color for dark mode to text-yellow-300 (Bright Yellow) instead of white
  const modalBaseClass = themeMode === 'light'
    ? 'bg-white/95 text-solar-dark'
    : 'bg-solar-dark/95 text-yellow-300';

  // Fixed the White Border issue by explicitly setting border colors for both modes
  const outerBorderClass = themeMode === 'light'
    ? 'border-yellow-400'
    : 'border-yellow-600';

  // Improved Dark Mode Input Styles
  // Changed text-yellow-100 to text-white for the inputs as requested
  const inputClass = themeMode === 'light'
    ? 'bg-white border-yellow-300 focus:ring-yellow-400 text-gray-800'
    : 'bg-neutral-900 border-neutral-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-white placeholder-neutral-500';

  // Improved Slot Container Styles
  const slotContainerClass = themeMode === 'light'
    ? 'border border-yellow-500/10 bg-black/5 hover:bg-black/10'
    : 'border border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800';

  // Text Colors for visibility - Bright Yellows for Dark Mode
  const labelColor = themeMode === 'light' ? 'opacity-50' : 'text-yellow-200 opacity-80';
  const subTitleColor = themeMode === 'light' ? 'opacity-60' : 'text-yellow-400/80';
  
  // Updated Note Box Class to be Yellow/Pale Yellow in both modes
  const noteBoxClass = themeMode === 'light' 
    ? 'bg-yellow-50 border border-yellow-300 text-yellow-900' 
    : 'bg-yellow-500/10 border border-yellow-500/50 text-yellow-200';

  // Dragging Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  // Resizing Logic
  const handleResizeDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y
        });
      } else if (isResizing) {
        const deltaX = e.clientX - dragStart.current.x;
        const deltaY = e.clientY - dragStart.current.y;
        setSize(prev => ({
          width: Math.max(400, prev.width + deltaX),
          height: Math.max(400, prev.height + deltaY)
        }));
        dragStart.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing]);

  if (!isOpen) return null;

  return (
    <div 
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`fixed shadow-2xl rounded-xl backdrop-blur-md flex flex-col overflow-hidden border-2 z-[60] ${outerBorderClass}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        transition: isDragging || isResizing ? 'none' : 'opacity 0.2s',
      }}
    >
      {/* Background/Theme Container */}
      <div className={`flex flex-col w-full h-full ${modalBaseClass}`}>
        
        {/* Header - Draggable Area */}
        <div 
          className="h-14 flex items-center justify-between px-4 cursor-move select-none border-b border-yellow-500/20"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <GripHorizontal size={20} className="opacity-50" />
            <h2 className="text-lg font-bold uppercase tracking-widest text-inherit">Settings</h2>
          </div>
          <button onClick={onClose} onMouseDown={(e) => e.stopPropagation()} className="p-2 hover:bg-red-500 hover:text-white rounded-full transition-colors text-inherit cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Sidebar Controls - Now Draggable */}
          <div 
            className="w-16 flex flex-col items-center py-6 gap-4 border-r border-yellow-500/20 cursor-move"
            onMouseDown={handleMouseDown}
          >
             
             {/* Spacer to push buttons to the bottom */}
             <div className="flex-1" />

             {/* Night Mode Toggle - Moved to bottom */}
             <button 
               onClick={onToggleTheme}
               onMouseDown={(e) => e.stopPropagation()}
               className="p-3 rounded-xl hover:bg-yellow-500/20 transition-all text-inherit cursor-pointer"
               title="Toggle Night Mode"
             >
               {themeMode === 'light' ? <Moon size={24} /> : <Sun size={24} />}
             </button>

             {/* Close Program */}
             <button 
               onClick={onCloseApp}
               onMouseDown={(e) => e.stopPropagation()}
               className="p-3 rounded-xl hover:bg-red-500 hover:text-white text-red-400 transition-all cursor-pointer"
               title="Close Application"
             >
               <Power size={24} />
             </button>
          </div>

          {/* Form Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className={`text-sm font-bold uppercase mb-4 ${subTitleColor}`}>Manage Clipboard Slots</h3>
            
            <div className="space-y-6">
              {slots.map((slot) => (
                <div key={slot.id} className={`p-4 rounded-lg transition-colors ${slotContainerClass}`}>
                  <div className="flex items-center gap-4 mb-2">
                    <span className={`text-xs font-bold w-12 ${labelColor}`}>Slot {slot.id}</span>
                    <input 
                      type="text"
                      value={slot.label}
                      onChange={(e) => onUpdateSlot(slot.id, 'label', e.target.value)}
                      placeholder="Button Name"
                      className={`flex-1 px-3 py-1 rounded text-sm outline-none transition-all ${inputClass}`}
                    />
                  </div>
                  <textarea 
                    value={slot.content}
                    onChange={(e) => onUpdateSlot(slot.id, 'content', e.target.value)}
                    placeholder="Content to copy to clipboard..."
                    rows={2}
                    className={`w-full px-3 py-2 rounded text-sm outline-none transition-all resize-y ${inputClass}`}
                  />
                </div>
              ))}
            </div>
            
            <div className={`mt-8 p-4 rounded-lg text-xs ${noteBoxClass}`}>
              <p><strong>Note:</strong> Changes are saved automatically.</p>
            </div>
          </div>
        </div>

        {/* Resizer Handle - Bottom Right */}
        <div 
          className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize z-50"
          onMouseDown={handleResizeDown}
        >
          {/* Diagonal Lines Visual Design */}
          <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none">
             <path d="M22 28L28 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-70" />
             <path d="M16 28L28 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-70" />
             <path d="M10 28L28 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-70" />
          </svg>
        </div>

      </div>
    </div>
  );
};