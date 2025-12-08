import { app as t, BrowserWindow as p, ipcMain as d, screen as m } from "electron";
import e from "node:path";
import { fileURLToPath as w } from "node:url";
import a from "node:fs";
const l = e.dirname(w(import.meta.url));
process.env.DIST = e.join(l, "../dist");
process.env.VITE_PUBLIC = t.isPackaged ? process.env.DIST : e.join(l, "../public");
let s;
const f = process.env.VITE_DEV_SERVER_URL, i = process.env.VITE_DEV_SERVER_URL ? e.join(l, "..", "slots.json") : e.join(e.dirname(process.execPath), "slots.json");
function u() {
  const { width: o, height: n } = m.getPrimaryDisplay().bounds;
  s = new p({
    width: o,
    height: n,
    x: 0,
    y: 0,
    icon: e.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    transparent: !0,
    frame: !1,
    alwaysOnTop: !0,
    hasShadow: !1,
    fullscreen: !1,
    skipTaskbar: !0,
    webPreferences: {
      preload: e.join(l, "preload.mjs"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), s.setAlwaysOnTop(!0, "screen-saver"), s.setIgnoreMouseEvents(!0, { forward: !0 }), s.webContents.on("did-finish-load", () => {
    s == null || s.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), f ? s.loadURL(f) : s.loadFile(e.join(process.env.DIST, "index.html"));
}
t.on("window-all-closed", () => {
  process.platform !== "darwin" && t.quit();
});
t.on("activate", () => {
  p.getAllWindows().length === 0 && u();
});
t.whenReady().then(() => {
  u(), d.on("set-ignore-mouse-events", (o, n, r) => {
    const c = p.fromWebContents(o.sender);
    c == null || c.setIgnoreMouseEvents(n, r);
  }), d.handle("load-slots-config", async () => {
    try {
      if (!a.existsSync(i))
        return null;
      const o = await a.promises.readFile(i, "utf-8");
      return JSON.parse(o);
    } catch (o) {
      return console.error("Failed to load slots config:", o), null;
    }
  }), d.handle("save-slots-config", async (o, n) => {
    try {
      const r = e.dirname(i);
      return await a.promises.mkdir(r, { recursive: !0 }), await a.promises.writeFile(i, JSON.stringify(n, null, 2), "utf-8"), !0;
    } catch (r) {
      return console.error("Failed to save slots config:", r), !1;
    }
  });
});
