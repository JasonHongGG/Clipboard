/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    setIgnoreMouseEvents: (ignore: boolean, options?: { forward: boolean }) => void
    loadSlotsConfig: () => Promise<unknown>
    saveSlotsConfig: (data: unknown) => Promise<boolean>
  }
}
