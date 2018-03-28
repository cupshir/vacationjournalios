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
    status: null
};

export function parks(state = initialState, action) {
    switch (action.type) {
        case LOAD_PARKS_START:
            return {
                ...state,
                status: 'requesting'
            };
        case LOAD_PARKS_SUCCESS:
            return {
                ...state,
                parks: action.parks,
                status: 'success'
            };
        case LOAD_PARKS_FAILED:
            return {
                ...state,
                status: 'failed'
            };
        case REQUEST_PARKS_START:
            return {
                ...state,
                status: 'requesting'
            };
        case REQUEST_PARKS_SUCCESS:
            return {
                ...state,
                parks: action.payload.body.data,
                status: 'success'
            };
        case REQUEST_PARKS_FAILED:
            return {
                ...state,
                status: 'failed'
            };
        default:
            return state;
    }
}