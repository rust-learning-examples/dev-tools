// https://tauri.studio/docs/api/js/modules/globalShortcut
// https://github.com/tauri-apps/tauri/issues/2311
use tauri::{AppHandle, WindowUrl};
pub fn new_window(app_handle: AppHandle) -> Result<(), String> {
    println!("new w");
    app_handle.clone().create_window("剪切板".to_string(), WindowUrl::default(), |window_builder, webview_attributes| {
            let builder = window_builder
                .resizable(false)
                .transparent(false)
                .decorations(true)
                .always_on_top(true)
                .inner_size(800.0, 600.0)
                .fullscreen(false)
                .visible(true);
            println!("- struct created");
            return (builder, webview_attributes);
        })
        .expect("Error creating window");
    println!("- done");
    Ok(())
}