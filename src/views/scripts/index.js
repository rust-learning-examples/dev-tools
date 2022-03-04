import { invoke } from '@tauri-apps/api/tauri'
import { platform as getPlatform } from '@tauri-apps/api/os'
import React, {Component, useState} from 'react'
import { connect } from 'react-redux'
import { Table, Space, Button, Popconfirm, Modal, Input } from 'antd'
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import {strftime} from '@/utils/libs/date'
import './index.scss'
import withModal from '@/components/enhance/withModal'
import Form from './Form'

export default connect(state => state)(withModal(class extends Component {
  constructor (props) {
    super(...arguments)
    this.state = {
      running: false
    }
  }
  createRecord() {
    this.updateRecord()
  }
  updateRecord(record) {
    const {modal} = this.props
    let formRef = null
    modal.openModal({
      title: record ? '更新脚本' : '新增脚本',
      onOk: async () => {
        if (formRef) {
          const newRecord = await formRef.onFinish()
          this.props.dispatch({
            type: 'addScriptItem',
            payload: newRecord
          })
          if (record?.key) {
            this.props.dispatch({
              type: 'delScriptItem',
              payload: record
            })
          }
        }
      },
      children: <Form onRef={(ref) => formRef = ref} initialValues={{...record}}></Form>
    })
  }
  deleteRecord(record) {
    this.props.dispatch({
      type: 'delScriptItem',
      payload: record
    })
  }
  async runRecordShell(record) {
    this.setState({running: true})
  
    function Password(props) {
      const [password, setPassword] = useState(props.initPassword);
      return <>
        <Input.Password
          value={ password }
          onInput={ (event) => {
            const newPassword = event.target.value
            setPassword(newPassword)
            props.changePassword(newPassword)
          }}
          placeholder="请输入管理员密码"
          iconRender={ visible => (visible ? <EyeTwoTone/> :
            <EyeInvisibleOutlined/>) }
        />
      </>
    }
    // https://tauri.studio/docs/api/js/modules/os
    const platform = await getPlatform()
    await new Promise((resolve, reject) => {
      let password = ''
      Modal.confirm({
        title: '确定执行该脚本？',
        content: platform === 'win32' || !/sudo/.test(record.shell) ? null : <Password initPassword={password} changePassword={(nv) => password = nv} />,
        onOk: async () => {
          await invoke('exec_shell_text', {shell: record.shell, password})
            .then(result => {
              Modal.info({
                width: '80%',
                title: '执行结果',
                content: <pre dangerouslySetInnerHTML={{__html: result}}></pre>
              })
              resolve()
            })
            .catch(e => {
              Modal.error({
                width: '80%',
                title: '执行错误',
                content: <pre dangerouslySetInnerHTML={{__html: e}}></pre>
              })
              reject(e)
            })
        },
        onCancel: () => {
          reject('cancel')
        }
      })
    }).finally(() => {
      this.setState({running: false})
    })
  }
  render() {
    const columns = [{
      title: '内容',
      dataIndex: 'shell',
      render: (text, record) => <pre>{record.shell}</pre>
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
          <Button loading={this.state.running} onClick={() => this.runRecordShell(record)}>执行</Button>
          <Button onClick={() => this.updateRecord(record)}>编辑</Button>
          <Popconfirm title="确定删除?" onConfirm={() => this.deleteRecord(record)}>
            <Button danger type="link">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },]
    return <div className="page page-scripts">
      <div className="header flex-layout">
        <div className="left-panel"></div>
        <div className="right-panel">
          <Button type="primary" onClick={() => this.createRecord()}>新增</Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={this.props.script.data}
        rowKey={record => record.key}
      >
      </Table>
    </div>
  }
}))