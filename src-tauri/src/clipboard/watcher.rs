use std::{
    sync::mpsc,
};
pub use clipboard_master::{ Master, ClipboardHandler, CallbackResult };
pub struct Handler {
    pub tx: mpsc::Sender<bool>
}
impl ClipboardHandler for Handler {
    fn on_clipboard_change(&mut self) -> CallbackResult {
        println!("Clipboard change happened!");
        self.tx.send(true).unwrap();
        CallbackResult::Next
    }

    fn on_clipboard_error(&mut self, error: std::io::Error) -> CallbackResult {
        eprintln!("Error: {}", error);
        CallbackResult::Next
    }
}