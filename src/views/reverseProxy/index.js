import { invoke } from '@tauri-apps/api/tauri'
import React, {Component} from 'react'
import { connect } from 'react-redux'
import {
  Table,
  Space,
  Button,
  Popconfirm,
  Input,
  Tag,
  Checkbox,
  Divider,
  InputNumber, Form as AForm,
  notification,
} from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import {strftime} from '@/utils/libs/date'
import withModal from '@/components/enhance/withModal'
import Form from './Form'
import './index.scss'

export default connect(state => state)(withModal(class extends Component {
  constructor (props) {
    super(...arguments)
    this.state = {
      search: '',
      // running stopped
      serverState: 'stopped'
    }
  }
  async createRecord() {
    await this.updateRecord()
  }
  async updateRecord(record) {
    const {modal} = this.props
    let formRef = null
    modal.openModal({
      title: record ? '更新代理配置' : '新增代理配置',
      onOk: async () => {
        if (formRef) {
          const newRecord = {
            ...record,
            ...await formRef.onFinish()
          }
          if (record?.key) {
            await this.directUpdateRecord(newRecord)
          } else {
            await this.directCreateRecord(newRecord)
          }
        }
      },
      children: <Form onRef={(ref) => formRef = ref} initialValues={{...record}}></Form>
    })
  }
  async directCreateRecord(record) {
    this.props.dispatch({
      type: 'addReverseProxyItem',
      payload: record
    })
    await this.uploadConfig()
  }
  async directUpdateRecord(record) {
    this.props.dispatch({
      type: 'updateReverseProxyItem',
      payload: record
    })
    await this.uploadConfig()
  }
  async deleteRecord(record) {
    this.props.dispatch({
      type: 'delReverseProxyItem',
      payload: record
    })
    await this.uploadConfig()
  }
  
  async updatePort(port) {
    this.props.dispatch({type: 'updateReverseProxyPort', payload: port})
    await this.uploadConfig()
  }
  
  async uploadConfig() {
    const config = this.props.reverseProxy
    await invoke('upload_reverse_proxy_config', {config: {
        ...config,
        data: config.data.filter(i => i.checked)
      }
    })
  }

  async toggleServer() {
    this.setState({serverState: 'running'})
    await invoke('toggle_reverse_proxy_server').catch(e => {
      this.setState({serverState: 'stopped'})
      notification.error({message: e.message})
    })
  }
  
  onServerTips() {
    const {modal} = this.props
    modal.openModal({
      title: '提示',
      width: '800px',
      footer: null,
      onOk: async () => {},
      children: <div>
        <div className="redirect">
          <div>302重定向: <Tag>{`http://127.0.0.1:${this.props.reverseProxy.port}/redirect/[yourRealLink]`}</Tag></div>
          <div><Tag>{`http://127.0.0.1:${this.props.reverseProxy.port}/redirect/https:://www.baidu.com/a?a=1 => https:://www.baidu.com/a?a=1`}</Tag></div>
        </div>
        <Divider></Divider>
        <div className="proxy">
          <div>反向代理: <Tag>{`http://127.0.0.1:${this.props.reverseProxy.port}/proxy/[yourRealLink]`}</Tag></div>
          <div><Tag>{`http://127.0.0.1:${this.props.reverseProxy.port}/proxy/https:://www.baidu.com/a?a=1 => https:://www.baidu.com/a?a=1`}</Tag></div>
        </div>
        <Divider></Divider>
        <div className="config-proxy">
          <div>配置反向代理eg:</div>
          <div>目标地址：<Tag>^https:://www.baidu.com</Tag></div>
          <div>代理到目标地址: <Tag>https://www.taobao.com</Tag></div>
          <div><Tag>{`http://127.0.0.1:${this.props.reverseProxy.port}/proxy/https:://www.baidu.com/a?a=1 => https:://www.taobao.com/a?a=1`}</Tag></div>
        </div>
      </div>
    })
  }
  
  async componentDidMount () {
    await this.uploadConfig()
  }
  
  render() {
    const columns = [{
      title: '是否启用',
      dataIndex: 'enable',
      render: (text, record, idx) => <Checkbox checked={record.checked} onChange={(e) => this.directUpdateRecord({...record, checked: e.target.checked})}></Checkbox>
    }, {
      title: '地址',
      dataIndex: 'target',
    }, {
      title: '代理到地址',
      dataIndex: 'finalTarget',
      render: (text, record) => <div>
        {record.finalTarget}
      </div>
    }, {
      title: '备注',
      dataIndex: 'remark',
    }, {
      title: '创建时间',
      dataIndex: 'createdAt',
      render: (text, record) => strftime(new Date(text))
    }, {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Button onClick={() => this.updateRecord(record)}>编辑</Button>
          <Popconfirm title="确定删除?" onConfirm={() => this.deleteRecord(record)}>
            <Button danger type="link">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },]
    const dataSource = this.props.reverseProxy.data.filter(item => {
      const { search } = this.state
      const matchKeyword = search.keyword ? (new RegExp(search.keyword, 'i').test(item.target) || new RegExp(search.keyword, 'i').test(item.finalTarget) || new RegExp(search.keyword, 'i').test(item.remark)) : true
      return matchKeyword
    })
    return <div className="page page-reverse-proxy">
      <div className="header flex-layout">
        <div className="left-panel">
          <Space>
            <Input value={this.state.search.keyword} onChange={(event) => this.setState({search: {...this.state.search, keyword: event.target.value}})} allowClear placeholder="包含内容"></Input>
          </Space>
        </div>
        <div className="right-panel">
          <Button type="primary" onClick={() => this.createRecord()}>新增</Button>
          <Divider type="vertical" style={{margin: '0 30px'}}></Divider>
          <div className="server-config">
            <AForm.Item label="服务端口" style={{marginBottom: 0}}>
              <InputNumber disabled={this.state.serverState === 'running'} min={3000} max={9999} step={1} defaultValue={this.props.reverseProxy.port} onChange={ value => this.updatePort(value) } />
              <Button disabled={this.state.serverState === 'running'} type="primary" onClick={() => this.toggleServer()}>{ this.state.serverState === 'stopped' ? '启动' : '运行中...' }</Button>
              <InfoCircleOutlined className="pointer" onClick={() => this.onServerTips()} style={{marginLeft: '10px'}} />
            </AForm.Item>
          </div>
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