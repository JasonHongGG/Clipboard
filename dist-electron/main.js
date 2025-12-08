import { app as n, BrowserWindow as f, ipcMain as d, screen as m } from "electron";
import o from "node:path";
import { fileURLToPath as w } from "node:url";
import i from "node:fs";
const a = o.dirname(w(import.meta.url));
process.env.DIST = o.join(a, "../dist");
process.env.VITE_PUBLIC = n.isPackaged ? process.env.DIST : o.join(a, "../public");
let e;
const p = process.env.VITE_DEV_SERVER_URL, l = n.isPackaged ? o.join(process.resourcesPath, "slots.json") : o.join(a, "..", "slots.json");
function u() {
  const { width: s, height: r } = m.getPrimaryDisplay().bounds;
  e = new f({
    width: s,
    height: r,
    x: 0,
    y: 0,
    icon: o.join(a, "..", "logo", "icon.ico"),
    transparent: !0,
    frame: !1,
    alwaysOnTop: !0,
    hasShadow: !1,
    fullscreen: !1,
    skipTaskbar: !0,
    webPreferences: {
      preload: o.join(a, "preload.mjs"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), e.setAlwaysOnTop(!0, "screen-saver"), e.setIgnoreMouseEvents(!0, { forward: !0 }), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), p ? e.loadURL(p) : e.loadFile(o.join(process.env.DIST, "index.html"));
}
n.on("window-all-closed", () => {
  process.platform !== "darwin" && n.quit();
});
n.on("activate", () => {
  f.getAllWindows().length === 0 && u();
});
n.whenReady().then(() => {
  u(), d.on("set-ignore-mouse-events", (s, r, t) => {
    const c = f.fromWebContents(s.sender);
    c == null || c.setIgnoreMouseEvents(r, t);
  }), d.handle("load-slots-config", async () => {
    try {
      if (!i.existsSync(l))
        return null;
      const s = await i.promises.readFile(l, "utf-8");
      return JSON.parse(s);
    } catch (s) {
      return console.error("Failed to load slots config:", s), null;
    }
  }), d.handle("save-slots-config", async (s, r) => {
    try {
      const t = o.dirname(l);
      return await i.promises.mkdir(t, { recursive: !0 }), await i.promises.writeFile(l, JSON.stringify(r, null, 2), "utf-8"), !0;
    } catch (t) {
      return console.error("Failed to save slots config:", t), !1;
    }
  });
});
