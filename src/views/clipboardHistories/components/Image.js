import React, {Component} from 'react'
import { Image, Space } from 'antd'

export default class _ extends Component {
  constructor (props) {
    super(...arguments)
    this.blob = null
    this.state = {
      loaded: false
    }
  }
  
  componentDidMount () {
    this.props.trnasRecordBytesToBlob(this.props.record).then(blob => {
      this.blob = URL.createObjectURL(blob)
      this.setState({loaded: true})
    })
  }
  
  render() {
    return this.state.loaded ? <Space>
      {/*revokeObjectURL后无法预览*/}
      {/*<Image width={100} src={this.blob} style={{maxHeight: '100px'}} onLoad={() => URL.revokeObjectURL(this.blob)}/>*/}
      <Image width={100} src={this.blob} style={{maxHeight: '100px'}} />
      <span>{this.props.record.data.width} X {this.props.record.data.height}</span>
    </Space> : null
  }
}