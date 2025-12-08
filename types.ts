export interface ClipboardSlot {
  id: number;
  label: string;
  content: string;
}

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  bg: string;
  text: string;
  accent: string;
  border: string;
  panelBg: string;
}