import { persistReducer } from 'redux-persist'
import md5 from 'js-md5'
import _ from 'lodash'
import indexDBStorage from 'redux-persist-indexeddb-storage'

const initData = {
  data: []
}

//function generateUid(prefix = '', length = 5) {
//  const randStr = Math.random().toString(36)
//  const subRandomStr = randStr.substring(randStr.length - length)
//  return `${prefix}${new Date().toString(36)}${subRandomStr}`.toLowerCase()
//}

const reducer = (state = {...initData}, action) => {
  switch (action.type) {
    case 'addScriptItem':
      return {
        ...state,
        data: _.uniqBy([
          {
            ...action.payload,
            key: md5(action.payload.shell),
            date: new Date()
          },
          ...state.data,
        ], 'key')
      }
    case 'delScriptItem':
      return {
        ...state,
        data: state.data.filter(i => i.key !== action.payload.key)
      }
    default:
      return state
  }
}

const clipboardHistoryPersistConfig = {
  key: 'script',
  storage: indexDBStorage('devToolsIndexDB'),
}

export default persistReducer(clipboardHistoryPersistConfig, reducer)