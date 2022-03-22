import { combineReducers } from 'redux'
import { persistReducer } from 'redux-persist'
import localStorage from 'redux-persist/lib/storage'
//import sessionStorage from 'redux-persist/lib/storage/session'
import user from './user'
import clipboardHistory from './clipboardHistory'
import script from './script'
import reverseProxy from './reverseProxy'

const reducers = combineReducers({
  user,
  clipboardHistory,
  script,
  reverseProxy,
})

const persistConfig = {
  key: 'root',
  storage: localStorage,
  whitelist: ['user'],
  //blacklist: []
}

export default persistReducer(persistConfig, reducers)