import { user } from './userReducer';
import { parks } from './parkReducer';
import { attractions } from './attractionReducer';

/*
This file exports the reducers as an object which 
will be passed onto combineReducers method at src/app.js
*/
export {
    user,
    parks,
    attractions
}