// TODO: Update to be dynamic
//export const API_URL = process.env.REACT_APP_API_URL;
export const API_URL = 'https://vacationjournal-express-api.herokuapp.com/api';

// User Types
export const SIGN_OUT_USER = 'USER::SIGN_OUT_USER';

export const AUTHENTICATION_START = 'USER::AUTHENTICATION_START';
export const AUTHENTICATION_SUCCESS = 'USER::AUTHENTICATION_SUCCESS';
export const AUTHENTICATION_ERROR = 'USER::AUTHENTICATION_ERROR';
export const AUTHENTICATION_ERROR_CLEAR = 'USER::AUTHENTICATION_ERROR_CLEAR';

// Park Types
export const LOAD_PARKS_START = 'PARK::LOAD_PARKS_START';
export const LOAD_PARKS_SUCCESS = 'PARK::LOAD_PARKS_SUCCESS';
export const LOAD_PARKS_FAILED = 'PARK::LOAD_PARKS_FAILED';

export const REQUEST_PARKS_START = 'PARK::REQUEST_PARKS_START';
export const REQUEST_PARKS_SUCCESS = 'PARK::REQUEST_PARKS_SUCCESS';
export const REQUEST_PARKS_FAILED = 'PARK::REQUEST_PARKS_FAILED';

// Attraction Types
export const LOAD_ATTRACTIONS_START = 'ATTRACTION::LOAD_ATTRACTIONS_START';
export const LOAD_ATTRACTIONS_SUCCESS = 'ATTRACTION::LOAD_ATTRACTIONS_SUCCESS';
export const LOAD_ATTRACTIONS_FAILED = 'ATTRACTION::LOAD_ATTRACTIONS__FAILED';

// Journal Types
export const CLEAR_JOURNAL_STATUSES = 'JOURNAL::CLEAR_JOURNAL_STATUSES';

export const GET_JOURNALS = 'JOURNAL::GET_JOURNALS';
export const CLEAR_JOURNALS = 'JOURNAL::CLEAR_JOURNALS'

export const JOURNAL_SET_SELECTED = 'JOURNAL:JOURNAL_SET_SELECTED';

export const JOURNAL_SAVING = 'JOURNAL::JOURNAL_SAVING';
export const JOURNAL_LOADING = 'JOURNAL::JOURNAL_LOADING';

export const JOURNAL_ACTION_FAILED = 'JOURNAL::JOURNAL_ACTION_FAILED';

export const JOURNAL_CREATE_SUCCESS = 'JOURNAL::JOURNAL_CREATE_SUCCESS';

export const JOURNAL_DELETE_SUCCESS = 'JOURNAL::JOURNAL_DELETE_SUCCESS';

export const REQUEST_JOURNAL_BY_USER_START = 'JOURNAL::REQUEST_JOURNAL_BY_USER_START';
export const REQUEST_JOURNAL_BY_USER_SUCCESS = 'JOURNAL::REQUEST_JOURNAL_BY_USER_SUCCESS';
export const REQUEST_JOURNAL_BY_USER_FAILED = 'JOURNAL::REQUEST_JOURNAL_BY_USER_FAILED';

export const SUBMIT_JOURNAL_ENTRY_BY_USER_START = 'JOURNAL::SUBMIT_JOURNAL_ENTRY_BY_USER_START';
export const SUBMIT_JOURNAL_ENTRY_BY_USER_SUCCESS = 'JOURNAL::SUBMIT_JOURNAL_ENTRY_BY_USER_SUCCESS';
export const SUBMIT_JOURNAL_ENTRY_BY_USER_FAILED = 'JOURNAL::SUBMIT_JOURNAL_ENTRY_BY_USER_FAILED';

export const DELETE_JOURNAL_ENTRY_BY_USER_START = 'JOURNAL::DELETE_JOURNAL_ENTRY_BY_USER_START';
export const DELETE_JOURNAL_ENTRY_BY_USER_SUCCESS = 'JOURNAL::DELETE_JOURNAL_ENTRY_BY_USER_SUCCESS';
export const DELETE_JOURNAL_ENTRY_BY_USER_FAILED = 'JOURNAL::DELETE_JOURNAL_ENTRY_BY_USER_FAILED';

// Stats Types
export const REQUEST_PERSONAL_STATS_START = 'STATS::REQUEST_PERSONAL_STATS_START';
export const REQUEST_PERSONAL_STATS_FAILED = 'STATS::REQUEST_PERSONAL_STATS_FAILED';
export const REQUEST_PERSONAL_STATS_SUCCESS = 'STATS::REQUEST_PERSONAL_STATS_SUCCESS';

export const REQUEST_FRIENDS_STATS_START = 'STATS::REQUEST_FRIENDS_STATS_START';
export const REQUEST_FRIENDS_STATS_FAILED = 'STATS::REQUEST_FRIENDS_STATS_FAILED';
export const REQUEST_FRIENDS_STATS_SUCCESS = 'STATS::REQUEST_FRIENDS_STATS_SUCCESS';
