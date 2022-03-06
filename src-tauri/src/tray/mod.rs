use tauri::SystemTray;
use tauri::{CustomMenuItem, SystemTrayMenu, SystemTrayMenuItem};
pub use tauri::{SystemTrayEvent};


pub fn create_system_tray() -> SystemTray {
    let quit = CustomMenuItem::new("quit".to_string(), "退出");
    let hide = CustomMenuItem::new("hide".to_string(), "隐藏");
    // let show = CustomMenuItem::new("show".to_string(), "显示");
    // let toggle_visible = CustomMenuItem::new("toggle_visible".to_string(), "显示/隐藏");
    let tray_menu = SystemTrayMenu::new()
        // .add_item(show)
        .add_item(hide)
        // .add_item(toggle_visible)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);
    SystemTray::new().with_menu(tray_menu)
}