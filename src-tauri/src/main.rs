#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use tauri::{Manager};
use app::clipboard::{Clipboard, ContentValue as ClipboardContentValue, ImageData};
use app::menu;
use app::shell;

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
        .menu(menu::create_menu())
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();
            std::thread::spawn(move || {
                let mut clipboard = Clipboard::new();
                clipboard.listen();
                if let Some(rx) = clipboard.rx.take() {
                    for _exists_msg in rx {
                        if let Ok(text) = clipboard.get_text() {
                            // println!("text: {:?}", text);
                            main_window.emit("currentClipboardValue", ClipboardContentValue::Text(text)).unwrap()
                        } else if let Ok(image) = clipboard.get_image() {
                            // println!("image");
                            main_window.emit("currentClipboardValue", ClipboardContentValue::Image(image)).unwrap()
                        }
                    }
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![write_text_to_clipboard, write_image_to_clipboard, exec_shell_text])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
