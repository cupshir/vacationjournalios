import { 
    LOAD_ATTRACTIONS_START,
    LOAD_ATTRACTIONS_SUCCESS,
    LOAD_ATTRACTIONS_FAILED,

    REQUEST_ATTRACTIONS_START,
    REQUEST_ATTRACTIONS_SUCCESS,
    REQUEST_ATTRACTIONS_FAILED,
} from '../actions/actionTypes';

const initialState =  {
    attractions: [],
    status: null
};

export function attractions(state = initialState, action) {
    switch (action.type) {
        case LOAD_ATTRACTIONS_START:
            return {
                ...state,
                status: 'loading'
            };
        case LOAD_ATTRACTIONS_SUCCESS:
            return {
                ...state,
                attractions: action.attractions,
                status: 'success'
            };
        case LOAD_ATTRACTIONS_FAILED:
            return {
                ...state,
                status: 'failed'
            };
        case REQUEST_ATTRACTIONS_START:
            return {
                ...state,
                status: 'requesting'
            };
        case REQUEST_ATTRACTIONS_SUCCESS:
            return {
                ...state,
                attractions: action.payload.body.data,
                status: 'success'
            };
        case REQUEST_ATTRACTIONS_FAILED:
            return {
                ...state,
                status: 'failed'
            };
        default:
            return state;
    }
}