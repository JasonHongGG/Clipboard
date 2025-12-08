"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  setIgnoreMouseEvents: (ignore, options) => {
    electron.ipcRenderer.send("set-ignore-mouse-events", ignore, options);
  },
  loadSlotsConfig: () => electron.ipcRenderer.invoke("load-slots-config"),
  saveSlotsConfig: (data) => electron.ipcRenderer.invoke("save-slots-config", data),
  copyToClipboard: (text) => electron.ipcRenderer.invoke("copy-to-clipboard", text),
  onGlobalHotkey: (callback) => {
    const listener = (_event, payload) => callback(payload);
    electron.ipcRenderer.on("global-hotkey", listener);
    return () => electron.ipcRenderer.removeListener("global-hotkey", listener);
  }
});
