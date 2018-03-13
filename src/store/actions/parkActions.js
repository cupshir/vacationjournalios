import request from 'superagent';

import {
    API_URL,
    REQUEST_PARKS_START,
    REQUEST_PARKS_SUCCESS,
    REQUEST_PARKS_FAILED
} from './actionTypes'

// Park Actions

// Request all parks from api
// TODO:  Better Handle bad token
export function requestParks() {
    // get token from local storage
    const token = localStorage.getItem('jwtToken');
    if(token){
      // token found - make api call to request parks
      return function(dispatch) {
        // Set start status
        dispatch({
          type: REQUEST_PARKS_START
        });
        request
          .get(`${API_URL}/parks`)
          .set('Authorization', 'Bearer ' + token)
          .then(response => {
            dispatch({
              type: REQUEST_PARKS_SUCCESS,
              payload: response
            });
          })
          .catch(error => {
            dispatch({
              type: REQUEST_PARKS_FAILED
            });
          });
      }
    } else {
      // token doesnt exist - fail request / signout user as precaution?
      return function(dispatch) {
        dispatch({
          type: REQUEST_PARKS_FAILED
        });
      }
    }
  }