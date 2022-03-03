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

import { appWindow } from '@tauri-apps/api/window'
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
          <App />
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
