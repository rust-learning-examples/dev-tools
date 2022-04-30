import { persistReducer } from 'redux-persist'
import md5 from 'js-md5'
import _ from 'lodash'
import indexDBStorage from 'redux-persist-indexeddb-storage'

const initData = {
  maxCount: 30,
  data: []
}

//function generateUid(prefix = '', length = 5) {
//  const randStr = Math.random().toString(36)
//  const subRandomStr = randStr.substring(randStr.length - length)
//  return `${prefix}${new Date().toString(36)}${subRandomStr}`.toLowerCase()
//}

const reducer = (state = {...initData}, action) => {
  switch (action.type) {
    case 'addClipboardHistory': {
      const type = action.payload.Text ? 'Text' : 'Image'
      const data = action.payload.data || action.payload[type]
      return {
        ...state,
        data: _.uniqBy([
          {
            type,
            data: data,
            date: action.payload.date || new Date(),
            key: md5(type === 'Text' ? data : data.bytes),
            remark: action.payload.remark || '',
          },
          ...state.data,
        ], 'key').slice(0, state.maxCount)
      }
    }
    case 'updateClipboardHistory': {
      const { preRecord, newRecord } = action.payload
      const data = [...state.data]
      const item = data.find(i => i.key === preRecord.key)
      if (item) {
        const idx = data.indexOf(item)
        const newItem = Object.assign({}, item, {...newRecord})
        newItem.key = md5(item.data)
        data.splice(idx, 1, newItem)
      }
      return {
        ...state,
        data: _.uniqBy(data, 'key')
      }
    }
    case 'delClipboardHistory':
      return {
        ...state,
        data: state.data.filter(i => i.key !== action.payload.key)
      }
    case 'clearClipboardHistory':
      return {
        ...state,
        data: []
      }
    case 'updateClipboardMaxCount':
      return {
        ...state,
        maxCount: action.payload
      }
    default:
      return state
  }
}

const clipboardHistoryPersistConfig = {
  key: 'clipboardHistory',
  storage: indexDBStorage('devToolsIndexDB'),
}

export default persistReducer(clipboardHistoryPersistConfig, reducer)