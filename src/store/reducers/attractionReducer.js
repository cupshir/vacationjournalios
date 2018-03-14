import { 
    LOAD_ATTRACTIONS_START,
    LOAD_ATTRACTIONS_SUCCESS,
    LOAD_ATTRACTIONS_FAILED,

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
                data: action.payload.body.data,
                status: 'success'
            };
        case LOAD_ATTRACTIONS_FAILED:
            return {
                ...state,
                status: 'failed'
            };
        default:
            return state;
    }
}