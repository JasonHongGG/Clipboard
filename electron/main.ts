import { app, BrowserWindow, ipcMain, screen, globalShortcut, clipboard } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(__dirname, '../public')

let win: BrowserWindow | null

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
// JSON 設定檔放在執行檔同一個資料夾
const SETTINGS_FILE = app.isPackaged
  // 打包後：放在 resources 同一層（portable / 安裝版都一樣）
  ? path.join(process.resourcesPath, 'slots.json')
  // dev 模式：寫在專案根目錄（與 package.json 同一層）
  : path.join(__dirname, '..', 'slots.json')

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().bounds

  win = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    icon: path.join(__dirname, '..', 'logo', 'icon.ico'),
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    fullscreen: false,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  win.setAlwaysOnTop(true, 'screen-saver')
  win.setSkipTaskbar(false)

  // Make the window click-through initially (or not, depending on where the widget starts)
  // We'll start with click-through enabled for the whole window, 
  // and the renderer will disable it when hovering over the widget.
  // Actually, it's safer to start with it capturing events so we can see it, 
  // but the user wants "background transparent and penetrable".
  // So we default to ignore mouse events, but we need a way to catch them on the widget.
  // The standard way is: setIgnoreMouseEvents(true, { forward: true })
  // This lets the mouse move event pass through to the webview so it can detect hover.
  win.setIgnoreMouseEvents(true, { forward: true })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

function registerGlobalShortcuts() {
  const copyHotkeys = ['Alt+1', 'Alt+2', 'Alt+3', 'Alt+4', 'Alt+5']

  copyHotkeys.forEach((accelerator, index) => {
    const success = globalShortcut.register(accelerator, () => {
      if (!win || win.isDestroyed()) return
      win.webContents.send('global-hotkey', {
        action: 'copy-slot',
        slotIndex: index,
      })
    })

    if (!success) {
      console.warn(`Failed to register global shortcut ${accelerator}`)
    }
  })

  const toggleSuccess = globalShortcut.register('Insert', () => {
    if (!win || win.isDestroyed()) return
    win.webContents.send('global-hotkey', { action: 'toggle-visibility' })
  })

  if (!toggleSuccess) {
    console.warn('Failed to register global shortcut Insert')
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()
  registerGlobalShortcuts()

  // IPC handler for toggling mouse events
  ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.setIgnoreMouseEvents(ignore, options)
  })

  ipcMain.handle('copy-to-clipboard', async (_event, text: unknown) => {
    if (typeof text === 'string') {
      clipboard.writeText(text)
    }
    return true
  })

  // IPC: load slots config JSON
  ipcMain.handle('load-slots-config', async () => {
    try {
      if (!fs.existsSync(SETTINGS_FILE)) {
        return null
      }
      const raw = await fs.promises.readFile(SETTINGS_FILE, 'utf-8')
      return JSON.parse(raw)
    } catch (err) {
      console.error('Failed to load slots config:', err)
      return null
    }
  })

  // IPC: save slots config JSON
  ipcMain.handle('save-slots-config', async (_event, data: unknown) => {
    try {
      const dir = path.dirname(SETTINGS_FILE)
      await fs.promises.mkdir(dir, { recursive: true })
      await fs.promises.writeFile(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf-8')
      return true
    } catch (err) {
      console.error('Failed to save slots config:', err)
      return false
    }
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
