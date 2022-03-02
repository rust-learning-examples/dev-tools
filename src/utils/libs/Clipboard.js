import { invoke } from '@tauri-apps/api/tauri'

export const writeTextToClipboard = async (data) => {
  await invoke('write_text_to_clipboard', {text: data})
}

export const writeImageToClipboard = async (data) => {
  await invoke('write_image_to_clipboard', {image: data})
}

export default class Clipboard {
  static async writeText(text) {
    await navigator.clipboard.writeText(text)
  }
  static async writeImage(blob) {
    const data = [new window.ClipboardItem({[blob.type]: blob})]
    await navigator.clipboard.write(data)
  }
}