import { combineReducers } from 'redux'
import { persistReducer } from 'redux-persist'
import localStorage from 'redux-persist/lib/storage'
//import sessionStorage from 'redux-persist/lib/storage/session'
import user from './user'
import clipboardHistory from './clipboardHistory'

const reducers = combineReducers({
  user,
  clipboardHistory
})

const persistConfig = {
  key: 'root',
  storage: localStorage,
  whitelist: ['user'],
  //blacklist: []
}

export default persistReducer(persistConfig, reducers)