use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ClipboardSlot {
    pub id: u32,
    pub content: String,
    pub name: String,
    pub timestamp: Option<u64>,
}

pub fn get_config_path() -> PathBuf {
    let exe_path = std::env::current_exe().unwrap_or_else(|_| PathBuf::from("."));
    let mut dir = exe_path.parent().unwrap_or(&exe_path).to_path_buf();
    dir.push("slots.json");
    dir
}

#[tauri::command]
pub fn get_slots() -> Result<Vec<ClipboardSlot>, String> {
    let path = get_config_path();
    if !path.exists() {
        return Ok(get_default_slots());
    }

    match fs::read_to_string(&path) {
        Ok(data) => serde_json::from_str(&data).map_err(|e| e.to_string()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn save_slots(slots: Vec<ClipboardSlot>) -> Result<(), String> {
    let path = get_config_path();
    let data = serde_json::to_string_pretty(&slots).map_err(|e| e.to_string())?;
    fs::write(&path, data).map_err(|e| e.to_string())
}

fn get_default_slots() -> Vec<ClipboardSlot> {
    (1..=5).map(|id| ClipboardSlot {
        id,
        content: String::new(),
        name: format!("Slot {}", id),
        timestamp: None,
    }).collect()
}
