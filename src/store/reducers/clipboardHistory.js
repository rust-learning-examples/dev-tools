import { persistReducer } from 'redux-persist'
import indexDBStorage from 'redux-persist-indexeddb-storage'

const initData = {
  data: []
}

const reducer = (state = {...initData}, action) => {
  switch (action.type) {
    case 'addHistory':
      return {
        ...state,
        data: [
          ...state.data,
          {
            date: new Date(),
            remark: '',
            ...action.payload,
          }
        ]
      }
    case 'delHistory':
      return {
        ...state,
        data: state.data.filter(i => i.date !== action.payload.date)
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