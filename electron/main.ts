import { app, BrowserWindow, ipcMain, screen } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(__dirname, '../public')

let win: BrowserWindow | null

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().bounds

  win = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    fullscreen: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  win.setAlwaysOnTop(true, 'screen-saver')

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

  // IPC handler for toggling mouse events
  ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.setIgnoreMouseEvents(ignore, options)
  })
})
