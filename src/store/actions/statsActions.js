import request from 'superagent';

import {
    API_URL,
    REQUEST_PERSONAL_STATS_SUCCESS,
    REQUEST_PERSONAL_STATS_START,
    REQUEST_PERSONAL_STATS_FAILED,
    REQUEST_FRIENDS_STATS_SUCCESS,
    REQUEST_FRIENDS_STATS_START,
    REQUEST_FRIENDS_STATS_FAILED
} from '../types'

// Stats Actions

// Request all personal Stats
export function requestPersonalStats() {
    // get token from local storage
    const token = localStorage.getItem('jwtToken');
    if(token){
      // token found - make api call to request parks
      return function(dispatch) {
        // Set start status
        dispatch({
          type: REQUEST_PERSONAL_STATS_START
        });


      }
    } else {
      // token doesnt exist - fail request / signout user as precaution?
      return function(dispatch) {
        dispatch({
          type: REQUEST_PERSONAL_STATS_FAILED
        });
      }
    }
  }

  // Request all parks from api
export function requestPersonalStats() {
    // get token from local storage
    const token = localStorage.getItem('jwtToken');
    if(token){
      // token found - make api call to request parks
      return function(dispatch) {
        // Set start status
        dispatch({
          type: REQUEST_PERSONAL_STATS_START
        });
        request
          .get(`${API_URL}/stats/`)
          .set('Authorization', 'Bearer ' + token)
          .then(response => {
            dispatch({
              type: REQUEST_PERSONAL_STATS_SUCCESS,
              payload: response
            });
          })
          .catch(error => {
            dispatch({
              type: REQUEST_PERSONAL_STATS_FAILED
            });
          });
      }
    } else {
      // token doesnt exist - fail request / signout user as precaution?
      return function(dispatch) {
        dispatch({
          type: REQUEST_PERSONAL_STATS_FAILED
        });
      }
    }
  }

  // Request all parks from api
export function requestPersonalStats() {
    // get token from local storage
    const token = localStorage.getItem('jwtToken');
    if(token){
      // token found - make api call to request parks
      return function(dispatch) {
        // Set start status
        dispatch({
          type: REQUEST_PERSONAL_STATS_START
        });
        request
          .get(`${API_URL}/stats/`)
          .set('Authorization', 'Bearer ' + token)
          .then(response => {
            dispatch({
              type: REQUEST_PERSONAL_STATS_SUCCESS,
              payload: response
            });
          })
          .catch(error => {
            dispatch({
              type: REQUEST_PERSONAL_STATS_FAILED
            });
          });
      }
    } else {
      // token doesnt exist - fail request / signout user as precaution?
      return function(dispatch) {
        dispatch({
          type: REQUEST_PERSONAL_STATS_FAILED
        });
      }
    }
  }

  // Request all parks from api
export function requestPersonalStats() {
    // get token from local storage
    const token = localStorage.getItem('jwtToken');
    if(token){
      // token found - make api call to request parks
      return function(dispatch) {
        // Set start status
        dispatch({
          type: REQUEST_PERSONAL_STATS_START
        });
        request
          .get(`${API_URL}/stats/`)
          .set('Authorization', 'Bearer ' + token)
          .then(response => {
            dispatch({
              type: REQUEST_PERSONAL_STATS_SUCCESS,
              payload: response
            });
          })
          .catch(error => {
            dispatch({
              type: REQUEST_PERSONAL_STATS_FAILED
            });
          });
      }
    } else {
      // token doesnt exist - fail request / signout user as precaution?
      return function(dispatch) {
        dispatch({
          type: REQUEST_PERSONAL_STATS_FAILED
        });
      }
    }
  }