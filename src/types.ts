export type ThemeMode = 'light' | 'dark';

export interface ClipboardSlot {
  id: number;
  content: string;
  name: string;
  timestamp?: number;
}
