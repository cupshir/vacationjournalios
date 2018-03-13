/* eslint-disable global-require */
/* eslint-disable no-undef */
import { createStore, applyMiddleware, combineReducers } from 'redux';
import ReduxThunk from 'redux-thunk';
import * as reducers from './reducers/index';
import { composeWithDevTools } from 'redux-devtools-extension';

let middleware = [ReduxThunk];

middleware = [...middleware];

export default function configureStore() {
	return createStore(
		combineReducers(reducers),
		composeWithDevTools(
			applyMiddleware(...middleware),
	));
}
