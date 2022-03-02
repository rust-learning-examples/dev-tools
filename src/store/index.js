import { createStore } from 'redux'
import { persistStore } from 'redux-persist'
import rootReducer from './reducers'

const store = createStore(rootReducer)
const persistor = persistStore(store)

export { persistor }
export default store
