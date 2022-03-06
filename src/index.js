import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import store, { persistor } from './store'
import AppContext from './components/contexts/AppContext'
import 'normalize.css/normalize.css'
import '@/assets/stylesheets/application.scss'
import './index.less';
import App from './App';
import reportWebVitals from './reportWebVitals';
import zhCN from 'antd/lib/locale/zh_CN'
import { ConfigProvider } from 'antd'

import {initTauriApp} from './tauri'

async function startApp() {
  initTauriApp({
    store
  }).then(() => {
    ReactDOM.render(
      <React.StrictMode>
        <AppContext.Provider value={{startApp}}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <Router>
                <ConfigProvider locale={zhCN}>
                  <App />
                </ConfigProvider>
              </Router>
            </PersistGate>
          </Provider>
        </AppContext.Provider>
      </React.StrictMode>,
      document.getElementById('root')
    );
  })
}
startApp()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
