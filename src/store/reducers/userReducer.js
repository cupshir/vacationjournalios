import { 
  SIGN_OUT_USER,

  AUTHENTICATION_START,
  AUTHENTICATION_SUCCESS,
  AUTHENTICATION_ERROR,
  AUTHENTICATION_ERROR_CLEAR,
  
  JOURNALS_LOAD_SUCCESS,
  JOURNALS_CLEAR_SUCCESS,

  JOURNAL_SAVING,
  JOURNAL_LOADING,

  JOURNAL_LOAD_SUCCESS,

  JOURNAL_CREATE_SUCCESS,
  JOURNAL_ENTRY_CREATE_SUCCESS,

  JOURNAL_DELETE_SUCCESS,
  JOURNAL_CLEAR_ACTIVE,
  JOURNAL_ENTRY_DELETE_SUCCESS,
  
  JOURNAL_ACTION_FAILED
} from '../actions/actionTypes';

const initialState = {
  authenticated: false,
  email: null,
  userId: null,
  firstName: null,
  lastName: null,
  journals: [],
  activeJournal: null,
  status: null,
  errorMessage: null
}

export function user(state = initialState, action) {
  switch (action.type) {
    case AUTHENTICATION_START:
      return{
        ...state,
        status: 'requesting'
      };
    case AUTHENTICATION_SUCCESS:
      return {
        ...state,
        authenticated: true,
        userId: action.userId,
        email: action.email,
        firstName: action.firstName,
        lastName: action.lastName,
        activeJournal: action.activeJournal,
        journals: action.journals,
        status: 'success',
        errorMessage: null
      };
    case AUTHENTICATION_ERROR:
      return {
        ...state,
        authenticated: false,
        status: 'failed',
        errorMessage: action.payload.message
      };
    case AUTHENTICATION_ERROR_CLEAR:
      return {
        ...state,
        status: null,
        errorMessage: null
      }
    case JOURNAL_LOADING:
      return {
        ...state,
        status: 'loading'
      };
    case JOURNAL_LOAD_SUCCESS:
      return {
        ...state,
        activeJournal: action.activeJournal,
        status: 'success'
      };
    case JOURNAL_SAVING:
      return {
        ...state,
        status: 'saving'
      };
    case JOURNAL_CREATE_SUCCESS:
      return {
          ...state,
          journals: action.journals,
          activeJournal: action.activeJournal,
          error: null,
          status: 'success'
      };
    case JOURNAL_DELETE_SUCCESS:
      return {
        ...state,
        error: null,
        status: 'success'
      };
    case JOURNAL_ENTRY_CREATE_SUCCESS:
      return {
        ...state,
        activeJournal: action.activeJournal,
        status: 'success'
      }
    case JOURNAL_ENTRY_DELETE_SUCCESS:
      return {
        ...state,
        status: 'success'
      }
    case JOURNAL_ACTION_FAILED:
      return {
        ...state,
        errorMessage: action.error,
        status: 'failed'
      };
    case JOURNALS_LOAD_SUCCESS:
      return {
        ...state,
        journals: action.journals,
        status: 'success'
      };
    case JOURNAL_CLEAR_ACTIVE:
      return {
        ...state,
        activeJournal: null
      }
    case JOURNALS_CLEAR_SUCCESS:
      return {
        ...state,
        journals: [],
        journal: null
      };    
    case SIGN_OUT_USER:
      return {
        ...state, 
        authenticated: false,
        status: null,
        errorMessage: null,
        userid: null,
        email: null,
        activeJournal: null,
        journals: null,
        firstname: null,
        lastname: null
      };
    default:
      return state;
  }
}
