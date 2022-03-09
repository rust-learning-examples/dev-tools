import React, {Component, createRef} from 'react'

export default class _ extends Component {
  constructor (props) {
    super(...arguments)
    this.blob = null
    this.state = {
      loaded: false
    }
    this.imageRef = createRef()
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
      }, 'image/jpeg', 0.5)
    })
  }
  
  componentDidMount () {
    this.trnasRecordBytesToBlob(this.props.record).then(blob => {
      this.blob = URL.createObjectURL(blob)
      this.setState({loaded: true})
    })
  }
  
  render() {
    /*revokeObjectURL后无法预览*/
    /*<span>{this.props.record.data.width}X{this.props.record.data.height}</span>*/
    const { width, height } = this.props.record.data
    return this.state.loaded ? <img
      ref={this.imageRef}
      className="image"
      src={this.blob} alt="图片"
      onMouseOver={() => this.imageRef.current.style=`transform: scale(1.8); transform-origin: ${ width >= height ? 'left center' : 'center top' }`}
      onMouseOut={() => this.imageRef.current.style=`transform: scale(1)`}
      onLoad={() => URL.revokeObjectURL(this.blob)} /> : null
  }
}