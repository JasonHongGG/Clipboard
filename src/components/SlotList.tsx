import React from 'react';
import { useAppStore } from '../store';
import { SlotCard } from './SlotCard';
import './SlotList.css';

export const SlotList: React.FC = () => {
  const { slots } = useAppStore();

  return (
    <div className="slot-list-container no-drag">
      {slots.map(slot => (
        <SlotCard key={slot.id} slot={slot} />
      ))}
    </div>
  );
};
