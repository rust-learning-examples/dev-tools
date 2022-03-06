#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use tauri::{Manager};
use app::clipboard::{Clipboard, ContentValue as ClipboardContentValue, ImageData};
use app::menu;
use app::shell;
use app::tray::{self, SystemTrayEvent};

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
                    //         "显示"
                    //       } else {
                    //         window.show().unwrap();
                    //         "隐藏"
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
                            window_clone.emit("currentClipboardValue", ClipboardContentValue::Text(text)).unwrap()
                        } else if let Ok(image) = clipboard.get_image() {
                            // println!("image");
                            window_clone.emit("currentClipboardValue", ClipboardContentValue::Image(image)).unwrap()
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
        .invoke_handler(tauri::generate_handler![write_text_to_clipboard, write_image_to_clipboard, exec_shell_text])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
