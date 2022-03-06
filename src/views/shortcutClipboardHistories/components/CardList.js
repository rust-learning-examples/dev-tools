import React, { Component } from 'react'
import { Card } from 'antd'
import { WebviewWindow } from '@tauri-apps/api/window'
import * as tauriEvent from '@tauri-apps/api/event'
import * as notification from '@tauri-apps/api/notification'
import * as globalShortcut from '@tauri-apps/api/globalShortcut'
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
      await this.curWindow.hide()
    }
  }
  
  hideWindow = async () => {
    if (this.scrollEl) this.scrollEl.scrollLeft = 0
    if (this.curWindow) await this.curWindow.hide()
  }
  
  onScrollElWheel = (event) => {
    if (!event.deltaX) {
      event.preventDefault()
      this.scrollEl.scrollBy({
        left: event.deltaY * 5,
      })
    }
  }
  
  componentDidMount () {
    withDragScroll(this.scrollEl, {horizontal: true})
    globalShortcut.isRegistered("ESC").then(async isRegistered => {
      if (!isRegistered) {
        await globalShortcut.register("ESC", async () => {
          await this.hideWindow()
        })
      }
    })
    // https://github.com/tauri-apps/tauri/blob/82b7f51/tooling/api/src/helpers/event.ts#L21
    this.curWindow?.listen('tauri://blur', async (...args) => {
      await this.hideWindow()
    })
    this.scrollEl.addEventListener('wheel', this.onScrollElWheel)
    // 监听mainWindow传过来的新clipboard数据
    tauriEvent.listen('addClipboardHistory', (event) => {
      this.props.dispatch({
        type: 'addClipboardHistory',
        payload: JSON.parse(event.payload),
      })
    })
  }
  
  componentWillUnmount () {
    this.scrollEl.removeEventListener('wheel', this.onScrollElWheel)
  }
  
  render () {
    return <div className="card-list" ref={ el => this.scrollEl = el }>
      { this.props.dataSource.map(record => {
        const color = (regex.colorRegex.test(record.data) ? record.data : 'inherit').replace(/^0x/i, '#')
        return <Card
          size="small"
          title={ record.type === 'Text' ? '文本' : '图片' }
          extra={ <span className="time">{moment(new Date(record.date)).fromNow()}</span> }
          key={ record.key }
          className={`item ${ record === this.state.activeRecord ? 'active' : ''}`}
          hoverable
          bodyStyle={ { width: '100%', height: '100%', padding: '5px', flex: 1, overflow: 'hidden', background: color } }
          onClick={ () => this.setState({activeRecord: record})}
          onDoubleClick={ () => this.copyRecord(record) }
        >
          { record.type === 'Text' ? <pre>
              { record.data }
            </pre> : <Image record={ record }/>
          }
        </Card>
      })
    }
    </div>
  }
}