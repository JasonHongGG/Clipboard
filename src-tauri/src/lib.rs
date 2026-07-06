mod config;
mod window;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            config::get_slots,
            config::save_slots,
            window::set_ignore_cursor_events
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
