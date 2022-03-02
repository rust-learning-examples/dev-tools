import React, {Component} from 'react'
import { Button } from 'antd'
import { connect } from 'react-redux'

export default connect(state => state)(class extends Component {
  //constructor () {
  //  super(...arguments)
  //}
  
  onLogin = () => {
    this.props.dispatch({
      type: 'SET_USER_AUTH_INFO',
      payload: {token: 'token'}
    })
    this.props.dispatch({
      type: 'SET_USER_INFO',
      payload: {username: 'username'}
    })
    console.log('login', this)
  }
  onLogout = () => {
    this.props.dispatch({
      type: 'SET_USER_LOGOUT',
    })
    console.log('logout', this)
  }
  render() {
    return <div>
      <Button onClick={this.onLogin}>登录</Button>
      <Button onClick={this.onLogout}>注销</Button>
      <div>{JSON.stringify(this.props.user)}</div>
    </div>
  }
})