import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import store, { persistor } from './store'
import 'normalize.css/normalize.css'
import '@/assets/stylesheets/application.scss'
import './index.less';
import App from './App';
import reportWebVitals from './reportWebVitals';
import zhCN from 'antd/lib/locale/zh_CN'
import { ConfigProvider } from 'antd'

import { appWindow } from '@tauri-apps/api/window'
// https://tauri.studio/docs/api/js/modules/event#eventname
appWindow.listen('tauri://close-requested', () => {
  appWindow.hide();
})
appWindow.listen('currentClipboardValue', async event => {
  store.dispatch({
    type: 'addClipboardHistory',
    payload: event.payload,
  })
})

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <ConfigProvider locale={zhCN}>
            <App />
          </ConfigProvider>
        </Router>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
