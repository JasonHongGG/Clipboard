/// <reference types="vite/client" />

type GlobalHotkeyPayload = {
  action: 'copy-slot' | 'toggle-visibility'
  slotIndex?: number
}

interface Window {
  electronAPI: {
    setIgnoreMouseEvents: (ignore: boolean, options?: { forward: boolean }) => void
    loadSlotsConfig: () => Promise<unknown>
    saveSlotsConfig: (data: unknown) => Promise<boolean>
    copyToClipboard: (text: string) => Promise<boolean>
    onGlobalHotkey: (callback: (payload: GlobalHotkeyPayload) => void) => () => void
  }
}
