const initData = {
  authInfo: null,
  userInfo: null
}

const reducer = (state = {...initData}, action) => {
  switch (action.type) {
    case 'SET_USER_AUTH_INFO':
      return {
        ...state,
        authInfo: action.payload,
      }
    case 'SET_USER_INFO':
      return {
        ...state,
        userInfo: action.payload,
      }
    case 'SET_USER_LOGOUT':
      return {...initData}
    default:
      return state
  }
}

export default reducer