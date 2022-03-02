import React, {Component} from 'react'
import './index.scss'
import { Link, Outlet } from 'react-router-dom'

export default class _ extends Component {
  render() {
    return (
      <div className="flex-layout page-settings">
        <div className="left-panel">
          <ul>
            <li><Link to="/settings/menus">menus</Link></li>
            <li><Link to="/settings/roles">roles</Link></li>
          </ul>
        </div>
        <div className="right-panel">
          <Outlet />
        </div>
      </div>
    )
  }
}