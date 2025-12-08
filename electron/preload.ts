import { contextBridge, ipcRenderer } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electronAPI', {
  setIgnoreMouseEvents: (ignore: boolean, options?: { forward: boolean }) => {
    ipcRenderer.send('set-ignore-mouse-events', ignore, options)
  },
  loadSlotsConfig: () => ipcRenderer.invoke('load-slots-config'),
  saveSlotsConfig: (data: unknown) => ipcRenderer.invoke('save-slots-config', data),
})
