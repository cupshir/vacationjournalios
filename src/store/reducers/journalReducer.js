import { 
    GET_JOURNALS,
    CLEAR_JOURNALS,

    JOURNAL_SAVING,
    JOURNAL_LOADING,

    JOURNAL_ACTION_FAILED,

    JOURNAL_CREATE_SUCCESS,

    JOURNAL_DELETE_SUCCESS,

    JOURNAL_SET_SELECTED
} from '../actions/actionTypes';
  
const initialState = {
    journals: [],
    journal: null,
    selectedJournalId: null,
    status: null,
    error: null
}

export function journal(state = initialState, action) {
    switch (action.type) {
        case JOURNAL_SAVING:
            return{
                ...state,
                status: 'saving'
            };
        case JOURNAL_LOADING:
            return{
                ...state,
                status: 'loading'
            };
        case JOURNAL_CREATE_SUCCESS:
            return{
                ...state,
                selectedJournalId: action.journal.id,
                journal: action.journal,
                error: null,
                status: 'success'
            };
        case JOURNAL_DELETE_SUCCESS:
            return{
                ...state,
                selectedJournalId: null,
                journal: null,
                error: null,
                status: 'success'
            };
        case JOURNAL_SET_SELECTED:
            return{
                ...state,
                journal: action.journal,
                selectedJournalId: action.journalId,
                status: 'success'
            };
        case JOURNAL_ACTION_FAILED:
            return{
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
                error: null,
                selectedJournalId: null
            }
        default:
        return state;
    }
}