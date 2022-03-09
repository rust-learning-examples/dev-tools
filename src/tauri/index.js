import { appWindow, WebviewWindow, LogicalPosition, getCurrent } from '@tauri-apps/api/window'
import * as tauriEvent from '@tauri-apps/api/event'
import * as notification from '@tauri-apps/api/notification'
import * as globalShortcut from '@tauri-apps/api/globalShortcut'
export async function initTauriApp({store}) {
  const currentWindow = getCurrent()
  if (currentWindow.label !== 'main') {
    return
  }
  
  // https://tauri.studio/docs/api/js/modules/event#eventname
  appWindow.listen('tauri://close-requested', () => {
    appWindow.hide();
  })
  appWindow.listen('currentClipboardValue', async event => {
    store.dispatch({
      type: 'addClipboardHistory',
      payload: event.payload,
    })
    await tauriEvent.emit('addClipboardHistory', JSON.stringify(event.payload))
  })
  
  if (!await notification.isPermissionGranted()) {
    notification.requestPermission().then((response) => {
      if (response === "granted") {
        console.log("OK")
      } else {
        console.log("Permission is " + response);
      }
    })
  }
  
  // globalShortcut https://tauri.studio/docs/api/js/modules/globalShortcut
  if (await globalShortcut.isRegistered("CmdOrControl+Shift+V")) {
    await globalShortcut.unregister('CmdOrControl+Shift+V')
  }
  // new window  https://github.com/tauri-apps/tauri/issues/1643
  // window options https://tauri.studio/docs/api/js/interfaces/window.WindowOptions
  const windowHeight = 320
  const webviewWindow = new WebviewWindow('ShortcutClipboardHistories', {
    url: '/shortcutClipboardHistories',
    title: '剪切板记录',
    alwaysOnTop: true,
    focus: true,
    skipTaskbar: true,
    decorations: false,
    transparent: true,
    fileDropEnabled: false,
    fullscreen: false,
    maximized: false,
    resizable: false,
    center: false,
    x: 0,
    y: window.screen.height - windowHeight,
    width: window.screen.width,
    minWidth: window.screen.width,
    maxWidth: window.screen.width,
    height: windowHeight,
    minHeight: windowHeight,
    maxHeight: windowHeight,
    visible: false
  })
  await globalShortcut.register("CmdOrControl+Shift+V", async () => {
    //console.log('CmdOrControl+Shift+V', window.screen.width)
    await webviewWindow.show()
    await webviewWindow.setPosition(new LogicalPosition(0, window.screen.height - windowHeight))
    await webviewWindow.setFocus()
    // https://tauri.studio/docs/api/js/classes/window.WebviewWindow#requestuserattention
    await webviewWindow.requestUserAttention()
  })
}