import { Component } from 'react'
import { Modal } from 'antd'

export default function withModal (WrappedComponent) {
  return class extends Component {
    constructor (props) {
      super(...arguments)
      this.state = {
        visible: false,
        title: null
      }
    }
    //setTitle (title) {
    //  this.setState({ title })
    //}
    //setVisible(value) {
    //  this.setState({ visible: value })
    //}
    
    openModal = (state) => this.setState({ ...state, visible: true, })
    closeModal = () => this.setState({ visible: false })
    onOk = async () => {
      if (this.state.onOk) {
        await this.state.onOk()
      }
      this.closeModal()
    }
    onCancel = async () => {
      if (this.state.onCancel) {
        await this.state.onCancel()
      }
      this.closeModal()
    }
    
    render() {
      const { openModal, closeModal, onOk, onCancel } = this
      const modalProps = {...this.state, onOk, onCancel}
      
      return <>
        <WrappedComponent modal={{openModal, closeModal}} {...this.props} />
        { this.state.visible ? <Modal {...modalProps} /> : null }
      </>
    }
  }
}