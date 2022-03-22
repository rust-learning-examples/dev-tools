import React, { Component, createRef } from 'react'
import {
  Form,
  Input,
  Switch,
  //Radio
} from 'antd'
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
      <Form ref={this.formRef} initialValues={{type: 'proxy', ...this.props.initialValues}}  labelCol={{ flex: '120px' }}>
        {/*<Form.Item name="type" label="类型" >*/}
        {/*  <Radio.Group>*/}
        {/*    <Radio.Button value="redirect">302 Redirect</Radio.Button>*/}
        {/*    <Radio.Button value="proxy">反向代理</Radio.Button>*/}
        {/*  </Radio.Group>*/}
        {/*</Form.Item>*/}
        <Form.Item name="target" label="目标地址" rules={[{ required: true, message: '请输入目标地址正则', },]}>
          <Input placeholder="请输入目标地址正则"></Input>
        </Form.Item>
        <Form.Item name="finalTarget" label="代理到地址" rules={[{ required: true, message: '请输入最终目标地址', },]}>
          <Input placeholder="请输入目标地址正则"></Input>
        </Form.Item>
        <Form.Item name="remark" label="备注">
          <Input.TextArea showCount rows={2} placeholder="请输入备注"></Input.TextArea>
        </Form.Item>
        <Form.Item label="是否启用" name="checked" valuePropName="checked">
          <Switch checkedChildren="开启" unCheckedChildren="关闭" />
        </Form.Item>
      </Form>
    )
  }
  
}