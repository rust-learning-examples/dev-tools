import { persistReducer } from 'redux-persist'
import indexDBStorage from 'redux-persist-indexeddb-storage'

const initData = {
  data: []
}

function generateUid(prefix = '', length = 5) {
  const randStr = Math.random().toString(36)
  const subRandomStr = randStr.substring(randStr.length - length)
  return `${prefix}${new Date().toString(36)}${subRandomStr}`.toLowerCase()
}

const reducer = (state = {...initData}, action) => {
  switch (action.type) {
    case 'addClipboardHistory':
      return {
        ...state,
        data: [
          {
            type: action.payload.Text ? 'Text' : 'Image',
            data: action.payload[action.payload.Text ? 'Text' : 'Image'],
            date: new Date(),
            key: generateUid(),
            remark: '',
          },
          ...state.data,
        ]
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