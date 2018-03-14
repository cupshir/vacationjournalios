import { 
    LOAD_PARKS_START,
    LOAD_PARKS_SUCCESS,
    LOAD_PARKS_FAILED,

    REQUEST_PARKS_START,
    REQUEST_PARKS_SUCCESS,
    REQUEST_PARKS_FAILED
} from '../actions/actionTypes';

const initialState =  {
    parks: [],
    loadStatus: null,
    requestStatus: null
};

export function parks(state = initialState, action) {
    switch (action.type) {
        case LOAD_PARKS_START:
            return {
                ...state,
                loadStatus: 'requesting'
            };
        case LOAD_PARKS_SUCCESS:
            return {
                ...state,
                parks: action.payload.body.data,
                loadStatus: 'success'
            };
        case LOAD_PARKS_FAILED:
            return {
                ...state,
                loadStatus: 'failed'
            };
        case REQUEST_PARKS_START:
            return {
                ...state,
                requestStatus: 'requesting'
            };
        case REQUEST_PARKS_SUCCESS:
            return {
                ...state,
                parks: action.payload.body.data,
                requestStatus: 'success'
            };
        case REQUEST_PARKS_FAILED:
            return {
                ...state,
                requestStatus: 'failed'
            };
        default:
            return state;
    }
}