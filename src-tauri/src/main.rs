#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use tauri::{Manager, UserAttentionType};
use app::clipboard::{Clipboard, ContentValue as ClipboardContentValue, ImageData};
use app::menu;
use app::shell;
use app::proxy;
use app::tray::{self, SystemTrayEvent};
use std::sync::Mutex;

#[tauri::command]
fn write_text_to_clipboard(text: String) -> Result<(), &'static str> {
    let mut clipboard = Clipboard::new();
    if let Ok(_) = clipboard.set_text(&text) {
        return Ok(())
    }
    Err("")
}
#[tauri::command]
fn write_image_to_clipboard(image: ImageData) -> Result<(), &'static str> {
    let mut clipboard = Clipboard::new();
    if let Ok(_) = clipboard.set_image(image) {
        return Ok(())
    }
    Err("")
}

#[tauri::command]
fn exec_shell_text(shell: String, password: String) -> Result<String, String> {
    shell::exec_text(shell, password)
}

#[tauri::command]
fn upload_reverse_proxy_config(config: serde_json::Value) {
    println!("Uploading reverse proxy config: {}", config);
    proxy::update_server_config_cell(config);
}

lazy_static::lazy_static! {
    // running stopped
    static ref REVERSE_PROXY_SERVER_STATE: Mutex<String> = Mutex::new("stopped".to_string());
}
#[tauri::command]
async fn start_reverse_proxy_server() -> Result<(), &'static str> {
    *REVERSE_PROXY_SERVER_STATE.lock().unwrap() = "running".to_string();
    match proxy::start_reverse_proxy_server().await {
        Ok(()) => {
            Ok(())
        },
        Err(e) => {
            *REVERSE_PROXY_SERVER_STATE.lock().unwrap() = "stopped".to_string();
            Err(e)
        }
    }
}
#[tauri::command]
fn get_reverse_proxy_server_state() -> String {
    REVERSE_PROXY_SERVER_STATE.lock().unwrap().to_string()
}

fn main() {
    tauri::Builder::default()
        .system_tray(tray::create_system_tray())
        .on_system_tray_event(|app, event| match event {
            // https://tauri.studio/docs/guides/system-tray
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
                window.set_focus().unwrap();
                window.request_user_attention(Some(UserAttentionType::Critical)).unwrap();
            }
            // SystemTrayEvent::RightClick {
            //     position: _,
            //     size: _,
            //     ..
            // } => {
            //     println!("system tray received a right click");
            // }
            SystemTrayEvent::MenuItemClick { id, .. } => {
                // let item_handle = app.tray_handle().get_item(&id);
                match id.as_str() {
                    "quit" => {
                        std::process::exit(0);
                    }
                    "hide" => {
                        let window = app.get_window("main").unwrap();
                        window.hide().unwrap();
                    }
                    // "toggle_visible" => {
                    //     let window = app.get_window("main").unwrap();
                    //     let new_title = if window.is_visible().unwrap() {
                    //         window.hide().unwrap();
                    //         "??????"
                    //       } else {
                    //         window.show().unwrap();
                    //         "??????"
                    //       };
                    //     item_handle.set_title(new_title).unwrap();
                    // }
                    _ => {}
                }
            }
            _ => {}
        })
        .menu(menu::create_menu())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            let main_window = app.get_window("main").unwrap();
            let window_clone = main_window.clone();
            // clipboard
            std::thread::spawn(move || {
                let mut clipboard = Clipboard::new();
                clipboard.listen();
                if let Some(rx) = clipboard.rx.take() {
                    for _exists_msg in rx {
                        if let Ok(text) = clipboard.get_text() {
                            // println!("text: {:?}", text);
                            // TODO: ??????????????? ????????????5 * 1000?????????
                            if text.len() < 5 * 1000 {
                                window_clone.emit("currentClipboardValue", ClipboardContentValue::Text(text)).unwrap();
                            }
                        } else if let Ok(image) = clipboard.get_image() {
                            // println!("image");
                            window_clone.emit("currentClipboardValue", ClipboardContentValue::Image(image)).unwrap();
                        }
                    }
                }
            });
            // main_window envents https://tauri.studio/docs/api/js/modules/event#eventname
            // let window_clone = main_window.clone();
            // main_window.listen("tauri://close-requested", move |event| {
            //     // event.api.prevent_default();
            //     window_clone.hide().unwrap();
            //     println!("----{:?}", event);
            // });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![write_text_to_clipboard, write_image_to_clipboard, exec_shell_text, upload_reverse_proxy_config, start_reverse_proxy_server, get_reverse_proxy_server_state])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
