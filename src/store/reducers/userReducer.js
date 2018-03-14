import { 
  SIGN_OUT_USER,

  AUTHENTICATION_START,
  AUTHENTICATION_SUCCESS,

  AUTHENTICATION_ERROR,
  AUTHENTICATION_ERROR_CLEAR
} from '../actions/actionTypes';

const initialState = {
authenticated: false,
authenticationStatus: null,
authenticationErrorMessage: null
}

export function user(state = initialState, action) {
  switch (action.type) {
    case AUTHENTICATION_START:
      return{
        ...state,
        authenticationStatus: 'requesting'
      };
    case AUTHENTICATION_SUCCESS:
      return {
        ...state,
        authenticated: true,
        userid: action.userid,
        email: action.email,
        firstname: action.firstname,
        lastname: action.lastname,
        token: action.token,
        authenticationStatus: 'success',
        authenticationErrorMessage: null
      };
    case AUTHENTICATION_ERROR:
      return {
        ...state,
        authenticationStatus: 'failed',
        authenticationErrorMessage: action.payload.message
      };
    case AUTHENTICATION_ERROR_CLEAR:
      return {
        ...state,
        authenticationErrorMessage: null
      }
    case SIGN_OUT_USER:
      return {
        ...state, 
        authenticated: false,
        authenticationStatus: null,
        authenticationErrorMessage: null,
        userid: null,
        email: null,
        firstname: null,
        lastname: null,
        token: null
      };
    default:
      return state;
  }
}
