import { 
    GET_JOURNALS,
    CLEAR_JOURNALS,

    JOURNAL_SAVING,
    JOURNAL_LOADING,

    JOURNAL_LOAD_SUCCESS,

    JOURNAL_CREATE_SUCCESS,
    JOURNAL_ENTRY_CREATE_SUCCESS,

    JOURNAL_DELETE_SUCCESS,
    JOURNAL_ENTRY_DELETE_SUCCESS,
    
    JOURNAL_ACTION_FAILED
} from '../actions/actionTypes';
  
const initialState = {
    journals: [],
    journal: null,
    status: null,
    error: null
}

export function journal(state = initialState, action) {
    switch (action.type) {
        case JOURNAL_SAVING:
            return {
                ...state,
                status: 'saving'
            };
        case JOURNAL_LOADING:
            return {
                ...state,
                status: 'loading'
            };
        case JOURNAL_CREATE_SUCCESS:
            return {
                ...state,
                journal: action.journal,
                error: null,
                status: 'success'
            };
        case JOURNAL_DELETE_SUCCESS:
            return {
                ...state,
                journal: null,
                error: null,
                status: 'success'
            };
        case JOURNAL_LOAD_SUCCESS:
            return {
                ...state,
                journal: action.journal,
                status: 'success'
            };
        case JOURNAL_ENTRY_CREATE_SUCCESS:
            return {
                ...state,
                journal: action.journal,
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
                error: action.error,
                status: 'failed'
            };
        case GET_JOURNALS:
            return {
                ...state,
                journals: action.journals,
                status: 'success'
            };
        case CLEAR_JOURNALS:
            return {
                ...state,
                journals: [],
                journal: null,
                status: null,
                error: null
            };
        default:
        return state;
    }
}