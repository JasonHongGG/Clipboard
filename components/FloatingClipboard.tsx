import React, { useState, useRef, useEffect } from 'react';
import { ClipboardSlot, ThemeMode } from '../types';
import { ChevronLeft, ChevronRight, Settings, Copy, Check } from 'lucide-react';

interface FloatingClipboardProps {
  slots: ClipboardSlot[];
  themeMode: ThemeMode;
  onOpenSettings: () => void;
  isSettingsOpen: boolean;
  onInteraction: (isActive: boolean) => void;
}

export const FloatingClipboard: React.FC<FloatingClipboardProps> = ({
  slots,
  themeMode,
  onOpenSettings,
  isSettingsOpen,
  onInteraction
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Dragging State
  const [topPosition, setTopPosition] = useState(32); // Default top-8 (32px)
  const [isDragging, setIsDragging] = useState(false);

  // Refs to track drag vs click distinction
  const dragStartY = useRef(0);
  const startTop = useRef(0);
  const hasDragged = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Local hover state for safety check
  const [isHovering, setIsHovering] = useState(false);

  // Notify parent about interaction state changes (hover/dragging)
  useEffect(() => {
    // If we are dragging, expanded, or hovering, we need interaction
    if (isDragging || isHovering) {
      onInteraction(true);
    } else {
      onInteraction(false);
    }
  }, [isDragging, isHovering, onInteraction]);

  // Safety Check: Global mouse move listener to catch cases where mouseleave is missed
  // This happens often when the widget collapses rapidly under the cursor
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      // If dragging, we are definitely interacting
      if (isDragging) return;

      // Check if mouse is actually over our component
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const isOver =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;

        if (!isOver && isHovering) {
          // Force reset if we think we're hovering but we're not
          setIsHovering(false);
        }
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging, isHovering]);

  const handleCopy = async (id: number, content: string) => {
    try {
      // User requested to allow empty string copying without alert
      if (window.electronAPI?.copyToClipboard) {
        await window.electronAPI.copyToClipboard(content);
      } else {
        await navigator.clipboard.writeText(content);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback
      alert(`Copied to clipboard: ${content}`);
    }
  };

  // Dragging Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    // Start tracking drag
    setIsDragging(true);
    hasDragged.current = false;
    dragStartY.current = e.clientY;
    startTop.current = topPosition;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaY = e.clientY - dragStartY.current;

        // Only consider it a "drag" if moved more than 3 pixels to prevent accidental micro-movements preventing clicks
        if (Math.abs(deltaY) > 3) {
          hasDragged.current = true;
        }

        const newTop = Math.max(0, Math.min(window.innerHeight - 100, startTop.current + deltaY));
        setTopPosition(newTop);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleToggleClick = (e: React.MouseEvent) => {
    // If we dragged, do not toggle the menu
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setIsExpanded(!isExpanded);
  };

  // Theme Classes
  // text-yellow-300 for bright yellow in dark mode
  const containerClasses = themeMode === 'light'
    ? 'bg-white/95 border-solar-yellow text-solar-dark'
    : 'bg-black/80 border-solar-yellow/50 text-yellow-300';

  // Changed text-yellow-100 to text-white for buttons in Dark Mode
  const buttonClasses = themeMode === 'light'
    ? 'bg-white hover:bg-yellow-50 text-gray-800 border-yellow-200'
    : 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700';

  // Config Icon Classes
  const settingsButtonClasses = themeMode === 'light'
    ? 'hover:bg-yellow-50 text-yellow-500'
    : 'hover:bg-yellow-900/30 text-yellow-400';

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    // Only release interaction if we are NOT dragging
    if (!isDragging) {
      setIsHovering(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`fixed right-0 z-50 flex items-start transition-transform duration-75 ease-out ${isExpanded ? 'translate-x-0' : 'translate-x-[calc(100%-50px)]'}`}
      style={{
        top: topPosition,
        transitionProperty: isDragging ? 'none' : 'transform'
      }}
    >

      {/* Main Container Panel */}
      <div
        className={`
          flex flex-row items-stretch shadow-2xl backdrop-blur-md rounded-l-2xl border-y border-l border-r-0
          transition-colors duration-300
          ${containerClasses}
        `}
        style={{ height: 'auto', minHeight: '80px' }}
      >

        {/* Section 1: Unified Toggle & Drag Handle */}
        <div
          className="flex flex-col w-[50px] border-r border-yellow-500/20 group cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onClick={handleToggleClick}
          title="Click to toggle, Drag to move"
        >
          <div
            className={`
                flex-1 flex flex-col items-center justify-center 
                hover:bg-yellow-500/10 transition-colors rounded-l-2xl
                relative
            `}
          >
            {isExpanded ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </div>
        </div>

        {/* Content Area (Visible when expanded) */}
        <div className={`flex flex-row overflow-hidden transition-all duration-500 ${isExpanded ? 'w-auto opacity-100 max-w-xl' : 'w-0 opacity-0 max-w-0'}`}>

          {/* Section 2: Copy Buttons */}
          <div className="flex flex-col p-3 gap-2 w-64 border-r border-yellow-500/20">
            <div className={`text-xs font-bold uppercase tracking-wider mb-1 pl-1 ${themeMode === 'light' ? 'opacity-50' : 'opacity-80 text-yellow-300'}`}>
              Quick Paste
            </div>
            {slots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => handleCopy(slot.id, slot.content)}
                className={`
                   flex items-center justify-between px-3 py-2 rounded-lg border shadow-sm text-sm font-medium
                   transition-all duration-200 active:scale-95
                   ${buttonClasses}
                 `}
              >
                <span className="truncate max-w-[150px]">{slot.label || 'Record'}</span>
                {copiedId === slot.id ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <Copy size={14} className="opacity-50" />
                )}
              </button>
            ))}
          </div>

          {/* Section 3: Settings Trigger */}
          <div className="flex flex-col items-center justify-center p-2 w-16">
            <button
              onClick={onOpenSettings}
              className={`
                p-3 rounded-full hover:rotate-90 transition-all duration-500
                ${settingsButtonClasses}
              `}
              title="Settings"
            >
              <Settings size={24} />
            </button>
            <span className={`text-[10px] uppercase font-bold mt-2 ${themeMode === 'light' ? 'opacity-60' : 'opacity-80 text-yellow-300'}`}>
              Config
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};