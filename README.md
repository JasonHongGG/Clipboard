## SolarClip Manager

SolarClip Manager 是一個 Windows 剪貼簿 Floating Widget，
使用 **React + Vite + Electron** 打包成桌面應用程式。

視窗特色：
- 無邊框、全螢幕大小
- 透明背景，可穿透點擊到後方應用程式
- 只有 Widget 和 Settings 視窗區域會攔截滑鼠事件

目前 App 只有兩個主要元件：
- `FloatingClipboard`：右側可拖曳、展開/收合的剪貼簿 Widget
- `SettingsModal`：可拖曳、可調整大小的設定視窗，用來編輯各個剪貼槽內容與主題（亮/暗模式）

---

## 專案結構（重點）

- `App.tsx`：組合 FloatingClipboard 與 SettingsModal 的入口元件
- `components/FloatingClipboard.tsx`：浮動剪貼簿 Widget
- `components/SettingsModal.tsx`：設定視窗
- `electron/main.ts`：Electron 主程序，建立透明、置頂、可穿透視窗
- `electron/preload.ts`：Expose `window.electronAPI.setIgnoreMouseEvents` 給前端
- `vite.config.ts`：Vite + Electron 設定
- `package.json`：scripts 與相依套件

---

## 開發環境需求

- Node.js 18+（建議 20+）
- npm（隨 Node 一起安裝）
- Windows 10/11（Electron 桌面應用）

---

## 安裝與執行

第一次在本機啟動專案：

```bash
npm install
npm run dev
```

`npm run dev` 會同時：
- 啟動 Vite 開發伺服器
- 啟動 Electron，載入前端畫面

---

## 操作說明

### FloatingClipboard

- 預設貼在螢幕右側，可用滑鼠拖曳上下移動位置
- 點擊左側箭頭可展開/收合
- 中間區塊有多個剪貼槽按鈕：
	- 點擊會將對應文字寫入系統剪貼簿
- 右側「設定齒輪」按鈕會打開 Settings 視窗

### SettingsModal

- 可以拖曳標題列移動位置
- 右下角可調整視窗大小
- 可切換 Light / Dark 主題
- 可以編輯每個剪貼槽的：
	- Label（顯示名稱）
	- Content（實際複製到剪貼簿的文字）
-「關閉程式」按鈕會關閉整個 Electron App

---

## 透明視窗與滑鼠穿透行為

這個 App 的視窗設定在 `electron/main.ts`：

- `transparent: true`：視窗背景完全透明
- `frame: false`：無邊框
- `alwaysOnTop: true` + `setAlwaysOnTop(true, 'screen-saver')`：永遠置頂
- 預設呼叫 `setIgnoreMouseEvents(true, { forward: true })`：
	- 讓整個視窗的滑鼠事件穿透到後方應用程式

在前端：
- 滑鼠移到 `FloatingClipboard` 區域時：呼叫 `setIgnoreMouseEvents(false)`，Widget 可被點擊
- 滑鼠離開 Widget：呼叫 `setIgnoreMouseEvents(true, { forward: true })`，恢復穿透
- Settings 視窗類似邏輯，在拖曳或 hover 期間會暫時關閉穿透

---

## 打包（未完全設定）

目前已安裝 `electron-builder`，但還沒有完整的 build script 與設定。

如果之後要產生安裝檔，可以再補：
- 在 `package.json` 加入 `build` 設定
- 新增對應的 Windows NSIS / portable 設定

（如果你需要，我可以幫你再把打包流程完整配置好。）
