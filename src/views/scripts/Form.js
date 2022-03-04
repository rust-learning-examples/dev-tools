import { Component, createRef } from 'react'
import { Form, Input } from 'antd'
export default class _ extends Component {
  constructor(props) {
    super(...arguments)
    this.formRef = createRef()
  }
  
  onFinish = async () => {
    return await this.formRef.current.validateFields()
  }
  
  componentDidMount() {
    this.props.onRef && this.props.onRef(this)
  }
  
  render() {
    return (
      <Form ref={this.formRef} initialValues={this.props.initialValues}>
        <Form.Item name="remark" rules={[{ required: true, message: '请输入备注', },]}>
          <Input placeholder="请输入备注"></Input>
        </Form.Item>
        <Form.Item name="shell" rules={[{ required: true, message: '请输入脚本内容', },]}>
          <Input.TextArea showCount rows={8} placeholder="请输入脚本内容"></Input.TextArea>
        </Form.Item>
      </Form>
    )
  }
  
}