# Clipboard

A lightweight, system-tray based clipboard manager that helps you quickly store and paste frequently used text snippets.

## Hotkeys

This application provides the following global hotkeys that can be used from any active window:

- **`Insert`**: Toggle the visibility of the Clipboard window.
- **`Alt + 1` to `Alt + 5`**: Quickly paste the content from slots 1 through 5 directly into your current active window.

## System Tray Behavior

- **Minimize on Close**: Clicking the close (`X`) button will not exit the application. Instead, it will hide the window and keep the app running in the system tray (notification area).
- **Restore Window**: **Double-left-click** the system tray icon, or press the `Insert` key, to bring the window back.
- **Quit Application**: **Right-click** the system tray icon and select **Quit** to completely exit the application.

---

## Build Instructions

If you need to build the portable standalone executable (`.exe`) from the source code, please follow these steps:

### 1. Prerequisites
Ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/)
- [Rust](https://www.rust-lang.org/tools/install) (including Cargo)

### 2. Install Dependencies
Navigate to the project directory and install the required frontend dependencies:
```bash
npm install
```

### 3. Build the Application
Run the following command to compile and package the application (this may take a few minutes):
```bash
npm run tauri build
```

### 4. Locate the Portable Executable
Once the build process is complete, you can find the portable standalone executable at the following path. You can move this `.exe` file anywhere and run it without installation:
👉 `src-tauri/target/release/clipboard.exe`

*(Note: Installers like `.msi` and `.nsis` are also generated automatically in the `src-tauri/target/release/bundle/` directory.)*
