import React, {Component} from 'react'
import { connect } from 'react-redux'
import { Space, Input, Select } from 'antd'
import './index.scss'
import CardList from './components/CardList'

export default connect(state => state)(class extends Component {
  constructor (props) {
    super(...arguments)
    this.state = {
      search: {
        keyword: '',
        type: null,
      },
    }
  }
  
  render() {
    const dataSource = this.props.clipboardHistory.data.filter(item => {
      const { search } = this.state
      const matchKeyword = search.keyword ? (new RegExp(search.keyword, 'i').test(item.data) || new RegExp(search.keyword, 'i').test(item.remark)) : true
      const matchType = search.type ? item.type === search.type : true
      return matchType && matchKeyword
    })
    return <div className="page page-shortcut-clipboard-histories">
      <div className="header flex-layout">
        <div className="left-panel">
          <Space>
            <Input value={this.state.search.keyword} onChange={(event) => this.setState({search: {...this.state.search, keyword: event.target.value}})} allowClear autoFocus placeholder="包含内容"></Input>
            <Select defaultValue={this.state.search.type} style={{ width: 120 }} onChange={(value) => this.setState({search: {...this.state.search, type: value}})} allowClear placeholder="类型">
              <Select.Option value="Text">文本</Select.Option>
              <Select.Option value="Image">图片</Select.Option>
            </Select>
          </Space>
        </div>
        <div className="right-panel"></div>
      </div>
      <CardList dataSource={dataSource} {...this.props}></CardList>
    </div>
  }
})