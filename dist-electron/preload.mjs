"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  setIgnoreMouseEvents: (ignore, options) => {
    electron.ipcRenderer.send("set-ignore-mouse-events", ignore, options);
  },
  loadSlotsConfig: () => electron.ipcRenderer.invoke("load-slots-config"),
  saveSlotsConfig: (data) => electron.ipcRenderer.invoke("save-slots-config", data)
});
