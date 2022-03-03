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
    case 'addClipboardHistory':
      const type = action.payload.Text ? 'Text' : 'Image'
      const data =  action.payload[type]
      return {
        ...state,
        data: _.uniqBy([
          {
            type,
            data,
            date: new Date(),
            key: md5(type === 'Text' ? data : data.bytes),
            remark: '',
          },
          ...state.data,
        ], 'key')
      }
    case 'delClipboardHistory':
      return {
        ...state,
        data: state.data.filter(i => i.key !== action.payload.key)
      }
    default:
      return state
  }
}

const clipboardHistoryPersistConfig = {
  key: 'clipboardHistory',
  storage: indexDBStorage('clipboardHistory'),
}

export default persistReducer(clipboardHistoryPersistConfig, reducer)