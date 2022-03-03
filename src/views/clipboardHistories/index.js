import React, {Component} from 'react'
import { connect } from 'react-redux'
import { Table, Space, Button, Popconfirm, notification } from 'antd'
import Image from './components/Image'
import {writeTextToClipboard, writeImageToClipboard} from '@/utils/libs/Clipboard'
import {strftime} from '@/utils/libs/date'

export default connect(state => state)(class extends Component {
  async trnasRecordBytesToBlob(record) {
    const { bytes, width, height } = record.data
    //console.log(444, bytes, width, height)
    //const content = new Uint8Array(bytes)
    //return new Blob([content.buffer], {type: 'image/png'})
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      const imgData = context.createImageData(width, height)
      for (let i = 0; i < bytes.length; i++) {
        imgData.data[i] = bytes[i]
      }
      context.putImageData(imgData, 10, 10)
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject()
      })
    })
  }
  
  async copyRecord(record) {
    if (record.type === 'Text') {
      writeTextToClipboard(record.data).then(() => {
        this.deleteRecord(record)
        notification.success({message: '已拷贝'})
      })
    } else if (record.type === 'Image') {
      writeImageToClipboard(record.data).then(() => {
        this.deleteRecord(record)
        notification.success({message: '已拷贝'})
      })
    }
  }
  deleteRecord(record) {
    this.props.dispatch({
      type: 'delClipboardHistory',
      payload: record
    })
  }
  
  render() {
    const columns = [{
      title: '类型',
      dataIndex: 'type',
      render: (text, record) => (
        <Button type="primary" onClick={() => this.copyRecord(record)}>复制{text}</Button>
      )
    }, {
      title: '内容',
      dataIndex: 'data',
      render: (text, record) => {
       if (record.type === 'Text') {
         return record.data
       } else if (record.type === 'Image') {
         //const blob = await this.trnasRecordBytesToBlob(record)
         return <Image width={50} record={record} trnasRecordBytesToBlob={this.trnasRecordBytesToBlob} />
       }
      }
    }, {
      title: '备注',
      dataIndex: 'remark',
    }, {
      title: '日期',
      dataIndex: 'date',
      render: (text, record) => strftime(new Date(text))
    }, {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Popconfirm title="确定删除?" onConfirm={() => this.deleteRecord(record)}>
            <Button danger type="link">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },]
    return <div className="page">
      <Table
        columns={columns}
        dataSource={this.props.clipboardHistory.data}
        rowKey={record => record.key}
      >
      </Table>
    </div>
  }
})