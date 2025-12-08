import { app, BrowserWindow, ipcMain, screen } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.DIST = path.join(__dirname$1, "../dist");
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(__dirname$1, "../public");
let win;
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const SETTINGS_FILE = process.env.VITE_DEV_SERVER_URL ? path.join(__dirname$1, "..", "slots.json") : path.join(path.dirname(process.execPath), "slots.json");
function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().bounds;
  win = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    fullscreen: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.setAlwaysOnTop(true, "screen-saver");
  win.setIgnoreMouseEvents(true, { forward: true });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.env.DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  createWindow();
  ipcMain.on("set-ignore-mouse-events", (event, ignore, options) => {
    const win2 = BrowserWindow.fromWebContents(event.sender);
    win2 == null ? void 0 : win2.setIgnoreMouseEvents(ignore, options);
  });
  ipcMain.handle("load-slots-config", async () => {
    try {
      if (!fs.existsSync(SETTINGS_FILE)) {
        return null;
      }
      const raw = await fs.promises.readFile(SETTINGS_FILE, "utf-8");
      return JSON.parse(raw);
    } catch (err) {
      console.error("Failed to load slots config:", err);
      return null;
    }
  });
  ipcMain.handle("save-slots-config", async (_event, data) => {
    try {
      const dir = path.dirname(SETTINGS_FILE);
      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.writeFile(SETTINGS_FILE, JSON.stringify(data, null, 2), "utf-8");
      return true;
    } catch (err) {
      console.error("Failed to save slots config:", err);
      return false;
    }
  });
});
