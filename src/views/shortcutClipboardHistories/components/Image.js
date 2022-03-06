import React, {Component} from 'react'

export default class _ extends Component {
  constructor (props) {
    super(...arguments)
    this.blob = null
    this.state = {
      loaded: false
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
  
  componentDidMount () {
    this.trnasRecordBytesToBlob(this.props.record).then(blob => {
      this.blob = URL.createObjectURL(blob)
      this.setState({loaded: true})
    })
  }
  
  render() {
    return this.state.loaded ? <div>
      {/*revokeObjectURL后无法预览*/}
      <span>{this.props.record.data.width}X{this.props.record.data.height}</span>
      <img className="image" src={this.blob} alt="图片" onLoad={() => URL.revokeObjectURL(this.blob)} />
      {/*<Image width={100} src={this.blob} style={{maxHeight: '100px'}} />*/}
    </div> : null
  }
}