import { persistReducer } from 'redux-persist'
import md5 from 'js-md5'
import _ from 'lodash'
import indexDBStorage from 'redux-persist-indexeddb-storage'

const initData = {
  port: 3999,
  data: []
}

//function generateUid(prefix = '', length = 5) {
//  const randStr = Math.random().toString(36)
//  const subRandomStr = randStr.substring(randStr.length - length)
//  return `${prefix}${new Date().toString(36)}${subRandomStr}`.toLowerCase()
//}

const reducer = (state = {...initData}, action) => {
  const date = new Date()
  switch (action.type) {
    case 'addReverseProxyItem':
      return {
        ...state,
        data: _.uniqBy([
          {
            ...action.payload,
            key: md5(`${date}`),
            createdAt: date,
          },
          ...state.data,
        ], 'key')
      }
    case 'updateReverseProxyItem': {
      const item = state.data.find(i => i.key === action.payload.key)
      if (item) {
        const idx = state.data.indexOf(item)
        const data = [...state.data]
        data.splice(idx, 1, {
          ...action.payload,
        })
        return {
          ...state,
          data,
        }
      }
      return state
    }
    case 'delReverseProxyItem':
      return {
        ...state,
        data: state.data.filter(i => i.key !== action.payload.key)
      }
    case 'updateReverseProxyPort':
      return {
        ...state,
        port: action.payload
      }
    default:
      return state
  }
}

const reverseProxyPersistConfig = {
  key: 'reverseProxy',
  storage: indexDBStorage('devToolsIndexDB'),
}

export default persistReducer(reverseProxyPersistConfig, reducer)