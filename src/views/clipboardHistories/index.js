import React, {Component} from 'react'
import { connect } from 'react-redux'
import { Table, Space, Button, Popconfirm, notification, Form as AForm, Input, Select, InputNumber } from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import Image from './components/Image'
import {writeTextToClipboard, writeImageToClipboard} from '@/utils/libs/Clipboard'
import {strftime} from '@/utils/libs/date'
import './index.scss'
import withModal from '@/components/enhance/withModal'
import Form from './Form'

export default connect(state => state)(withModal(class extends Component {
  constructor (props) {
    super(...arguments)
    this.state = {
      search: {
        keyword: '',
        type: null,
      }
    }
  }
  async trnasRecordBytesToBlob(record) {
    const { bytes, width, height } = record.data
    //console.log(444, bytes, width, height)
    //const content = new Uint8Array(bytes)
    //return new Blob([content.buffer], {type: 'image/png'})
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      const imgData = context.createImageData(width, height)
      for (let i = 0; i < bytes.length; i++) {
        imgData.data[i] = bytes[i]
      }
      context.putImageData(imgData, 0, 0)
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject()
      })
    })
  }
  
  async copyRecord(record) {
    if (record.type === 'Text') {
      writeTextToClipboard(record.data).then(() => {
        notification.success({message: '已拷贝'})
      })
    } else if (record.type === 'Image') {
      writeImageToClipboard(record.data).then(() => {
        notification.success({message: '已拷贝'})
      })
    }
  }
  updateRecord(record) {
    const {modal} = this.props
    let formRef = null
    modal.openModal({
      title: '更新',
      onOk: async () => {
        if (formRef) {
          const newRecord = await formRef.onFinish()
          this.props.dispatch({
            type: 'updateClipboardHistory',
            payload: {
              preRecord: record,
              newRecord,
            }
          })
        }
      },
      children: <Form onRef={(ref) => formRef = ref} initialValues={{...record}}></Form>
    })
  }
  deleteRecord(record) {
    this.props.dispatch({
      type: 'delClipboardHistory',
      payload: record
    })
  }
  deleteAllRecords() {
    this.props.dispatch({
      type: 'clearClipboardHistory',
      payload: null
    })
  }
  
  render() {
    const columns = [{
      title: '序号',
      dataIndex: 'idx',
      render: (text, record, idx) => idx + 1
    }, {
      title: '类型',
      dataIndex: 'type',
      render: (text, record) => (
        <Button type="primary" size="small" onClick={() => this.copyRecord(record)}>复制{text}</Button>
      )
    }, {
      title: '备注',
      dataIndex: 'remark',
    }, {
      title: '内容',
      dataIndex: 'data',
      render: (text, record) => {
       if (record.type === 'Text') {
         return <div className="clipboard-data">
           <pre>{record.data}</pre>
           <CopyOutlined className="copy" onClick={() => this.copyRecord(record)}/>
         </div>
       } else if (record.type === 'Image') {
         //const blob = await this.trnasRecordBytesToBlob(record)
         return <Image width={50} record={record} trnasRecordBytesToBlob={this.trnasRecordBytesToBlob} />
       }
      }
    }, {
      title: '日期',
      dataIndex: 'date',
      render: (text, record) => strftime(new Date(text))
    }, {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          { record.type === 'Text' ? <Button onClick={() => this.updateRecord(record)}>编辑</Button> : null }
          <Popconfirm title="确定删除?" onConfirm={() => this.deleteRecord(record)}>
            <Button danger type="link">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },]
    const dataSource = this.props.clipboardHistory.data.filter(item => {
      const { search } = this.state
      const matchKeyword = search.keyword ? (new RegExp(search.keyword, 'i').test(item.data) || new RegExp(search.keyword, 'i').test(item.remark)) : true
      const matchType = search.type ? item.type === search.type : true
      return matchType && matchKeyword
    })
    return <div className="page page-clipboard-histories">
      <div className="header flex-layout">
        <div className="left-panel">
          <Space>
            <Input value={this.state.search.keyword} onChange={(event) => this.setState({search: {...this.state.search, keyword: event.target.value}})} allowClear placeholder="包含内容"></Input>
            <Select defaultValue={this.state.search.type} style={{ width: 120 }} onChange={(value) => this.setState({search: {...this.state.search, type: value}})} allowClear placeholder="类型">
              <Select.Option value="Text">Text</Select.Option>
              <Select.Option value="Image">Image</Select.Option>
            </Select>
          </Space>
        </div>
        <div className="right-panel">
          <Popconfirm title="确定清空所有记录吗?" onConfirm={() => this.deleteAllRecords()}>
            <Button danger type="link">清空记录</Button>
          </Popconfirm>
          <AForm.Item label="最大记录数" style={{marginBottom: 0}}>
            <InputNumber min={100} max={100 * 100} step={100} defaultValue={this.props.clipboardHistory.maxCount} onChange={value => this.props.dispatch({type: 'updateClipboardMaxCount', payload: value}) } />
          </AForm.Item>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey={record => record.key}
      >
      </Table>
    </div>
  }
}))