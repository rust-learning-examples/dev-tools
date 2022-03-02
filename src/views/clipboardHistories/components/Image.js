import React, {Component} from 'react'
import { Image } from 'antd'

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
    return this.state.loaded ? <Image width={this.props.width} src={this.blob} /> : null
  }
}