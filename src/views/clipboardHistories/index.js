import React, {Component} from 'react'
import { connect } from 'react-redux'
import { Table } from 'antd'

export default connect(state => state)(class extends Component {
  render() {
    const columns = [{
      title: '类型',
      dataIndex: 'type',
    }]
    console.log(132, this.props)
    return <div className="page">
      <Table columns={columns}></Table>
    </div>
  }
})