import React, { Component, createRef } from 'react'
import { Card } from 'antd'
import { WebviewWindow } from '@tauri-apps/api/window'
import * as tauriEvent from '@tauri-apps/api/event'
import * as notification from '@tauri-apps/api/notification'
//import * as globalShortcut from '@tauri-apps/api/globalShortcut'
import AppContext from '@/components/contexts/AppContext'
import { writeTextToClipboard, writeImageToClipboard, } from '@/utils/libs/Clipboard'
import moment from '@/utils/libs/moment'
import withDragScroll from '@/utils/libs/withDragScroll'
import { regex } from '@/utils/libs/constData'
import Image from './Image'

export default class _ extends Component {
  static contextType = AppContext
  
  constructor () {
    super(...arguments)
    this.state = {
      activeRecord: null,
    }
    this.curWindow = WebviewWindow.getByLabel('ShortcutClipboardHistories')
    this.scrollElRef = createRef()
  }
  
  copyRecord = async (record) => {
    if (record.type === 'Text') {
      await writeTextToClipboard(record.data).then(async () => {
        if (await notification.isPermissionGranted()) {
          notification.sendNotification({title: '已拷贝'})
        }
      })
    } else if (record.type === 'Image') {
      await writeImageToClipboard(record.data).then(async () => {
        if (await notification.isPermissionGranted()) {
          notification.sendNotification({title: '已拷贝'})
        }
      })
    }
    if (this.curWindow) {
      await this.hideWindow()
    }
  }
  
  hideWindow = async () => {
    if (this.scrollElRef?.current) this.scrollElRef.current.scrollLeft = 0
    if (this.curWindow) {
      await this.curWindow.hide()
    }
  }
  
  onScrollElWheel = (event) => {
    if (!event.deltaX) {
      event.preventDefault()
      this.scrollElRef.current.scrollBy({
        left: event.deltaY * 5,
      })
    }
  }
  
  componentDidMount () {
    withDragScroll(this.scrollElRef.current, {horizontal: true})
    //globalShortcut.isRegistered("ESC").then(async isRegistered => {
    //  if (!isRegistered) {
    //    await globalShortcut.register("ESC", async () => {
    //      await this.hideWindow()
    //    })
    //  }
    //})
    document.addEventListener('keyup', async event => {
      //https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/key/Key_Values
      if (event.key === 'Escape') {
        await this.hideWindow()
      }
    });
    // https://github.com/tauri-apps/tauri/blob/82b7f51/tooling/api/src/helpers/event.ts#L21
    this.curWindow?.listen('tauri://blur', async (...args) => {
      await this.hideWindow()
    })
    this.scrollElRef.current.addEventListener('wheel', this.onScrollElWheel)
    // 监听mainWindow传过来的新clipboard数据
    tauriEvent.listen('addClipboardHistory', (event) => {
      this.props.dispatch({
        type: 'addClipboardHistory',
        payload: JSON.parse(event.payload),
      })
    })
  }
  
  componentWillUnmount () {
    this.scrollElRef.current.removeEventListener('wheel', this.onScrollElWheel)
  }
  
  render () {
    return <div className="card-list" ref={ this.scrollElRef }>
      { this.props.dataSource.map(record => {
        const color = (regex.colorRegex.test(record.data) ? record.data : 'inherit').replace(/^0x/i, '#')
        return <Card
          size="small"
          title={ record.type === 'Text' ? '文本' : <div>图片(<span>{record.data.width}X{record.data.height}</span>)</div> }
          extra={ <span className="time">{moment(new Date(record.date)).fromNow()}</span> }
          key={ record.key }
          className={`item ${ record === this.state.activeRecord ? 'active' : ''}`}
          hoverable
          bodyStyle={ { width: '100%', height: '250px', padding: '5px', flex: 1, overflow: 'hidden', background: color } }
          onClick={ () => this.setState({activeRecord: record})}
          onDoubleClick={ () => this.copyRecord(record) }
        >
          { record.type === 'Text' ? <pre>{ record.data }</pre> : <div className="image-container">
            <Image record={ record }/>
          </div>
          }
        </Card>
      })
    }
    </div>
  }
}