import { contextBridge, ipcRenderer } from 'electron'

type GlobalHotkeyPayload = {
  action: 'copy-slot' | 'toggle-visibility'
  slotIndex?: number
}

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electronAPI', {
  setIgnoreMouseEvents: (ignore: boolean, options?: { forward: boolean }) => {
    ipcRenderer.send('set-ignore-mouse-events', ignore, options)
  },
  loadSlotsConfig: () => ipcRenderer.invoke('load-slots-config'),
  saveSlotsConfig: (data: unknown) => ipcRenderer.invoke('save-slots-config', data),
  copyToClipboard: (text: string) => ipcRenderer.invoke('copy-to-clipboard', text),
  onGlobalHotkey: (callback: (payload: GlobalHotkeyPayload) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: GlobalHotkeyPayload) => callback(payload)
    ipcRenderer.on('global-hotkey', listener)
    return () => ipcRenderer.removeListener('global-hotkey', listener)
  },
})
