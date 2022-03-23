import { Component } from 'react'
import { Modal } from 'antd'

export default function withModal (WrappedComponent) {
  return class extends Component {
    constructor (props) {
      super(...arguments)
      this.state = {
        modalProps: { title: null, visible: false },
      }
    }
    //setTitle (title) {
    //  this.setState({ title })
    //}
    //setVisible(value) {
    //  this.setState({ visible: value })
    //}
    
    openModal = (modalProps) => this.setState({ modalProps: {...modalProps, visible: true}, })
    closeModal = () => this.setState({ modalProps: {visible: false} })
    onOk = async () => {
      if (this.state.modalProps.onOk) {
        await this.state.modalProps.onOk()
      }
      this.closeModal()
    }
    onCancel = async () => {
      if (this.state.modalProps.onCancel) {
        await this.state.modalProps.onCancel()
      }
      this.closeModal()
    }
    
    render() {
      const { openModal, closeModal, onOk, onCancel } = this
      const modalProps = {...this.state.modalProps, onOk, onCancel}
      
      return <>
        <WrappedComponent modal={{openModal, closeModal}} {...this.props} />
        { this.state.modalProps.visible ? <Modal {...modalProps} /> : null }
      </>
    }
  }
}