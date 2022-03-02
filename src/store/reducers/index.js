import { combineReducers } from 'redux'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
//import sessionStorage from 'redux-persist/lib/storage/session'
import user from './user'

const reducers = combineReducers({
  user
})

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'],
  //blacklist: []
}

export default persistReducer(persistConfig, reducers)