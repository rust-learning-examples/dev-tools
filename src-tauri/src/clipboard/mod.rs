mod watcher;

use std::{
    thread::{self, JoinHandle},
    sync::mpsc,
};
use serde::{Serialize, Deserialize};
use watcher::{Master as Watch, Handler as WatchHandler};
use arboard::{self, Clipboard as ClipboardCore, ImageData as ImageDataCore};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageData {
    pub width: usize,
    pub height: usize,
    pub bytes: Vec<u8>,
}

impl<'a> From<ImageData> for ImageDataCore<'a> {
    fn from(image_data: ImageData) -> Self {
        Self {
            width: image_data.width,
            height: image_data.height,
            bytes: image_data.bytes.into()
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub enum ContentValue {
    Text(String),
    Image(ImageData),
    None,
}

pub struct Clipboard {
    pub rx: Option<mpsc::Receiver<bool>>,
    handler: Option<JoinHandle<()>>,
    core: ClipboardCore,
}


impl Clipboard {
    pub fn new() -> Self {
        Clipboard {
            rx: None,
            handler: None,
            core: ClipboardCore::new().unwrap(),
        }
    }
    pub fn get_text(&mut self) -> Result<String, arboard::Error> {
        self.core.get_text()
    }
    pub fn set_text(&mut self, data: &str) -> Result<(), arboard::Error> {
        self.core.set_text(data.to_string())
    }
    pub fn get_image(&mut self) -> Result<ImageData, arboard::Error> {
        let result = self.core.get_image();
        match result {
            Ok(image) => {
                Ok(ImageData {
                    width: image.width,
                    height: image.height,
                    bytes: Vec::from(&*image.bytes),
                })
            },
            Err(e) => Err(e)
        }
    }
    pub fn set_image(&mut self, data: ImageData) -> Result<(), arboard::Error> {
        self.core.set_image(data.into())
    }

    pub fn listen(&mut self) {
        if let Some(_) = self.handler {
            return
        } else {
            let (tx, rx) = mpsc::channel();
            let handler = {
                thread::spawn(move || {
                    if let Err(e) = Watch::new(WatchHandler { tx }).run() {
                        panic!("=={:#}", e);
                    }
                })
            };
            self.handler = Some(handler);
            self.rx = Some(rx);
        }
    }
}

impl Drop for Clipboard {
    fn drop(&mut self) {
        if let Some(handler) = self.handler.take() {
            if let Err(e) = handler.join() {
                panic!("{:#?}", e);
            }
        }
    }
}