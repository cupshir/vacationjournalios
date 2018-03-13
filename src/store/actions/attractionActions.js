import request from 'superagent';

import {
    API_URL,
    REQUEST_ATTRACTIONS_WITH_PARK_START,
    REQUEST_ATTRACTIONS_WITH_PARK_SUCCESS,
    REQUEST_ATTRACTIONS_WITH_PARK_FAILED,

    REQUEST_ATTRACTIONS_BY_PARK_START,
    REQUEST_ATTRACTIONS_BY_PARK_SUCCESS,
    REQUEST_ATTRACTIONS_BY_PARK_FAILED
} from '../types'

// Attraction Actions
// Request all attractions including park info
// TODO: Better Handle Bad token
export function requestAttractionsWithPark() {
    // get token from local storage
    const token = localStorage.getItem('jwtToken');
    if(token){
      // token found - make api call to request attractions
      return function(dispatch) {
        // Set start status
        dispatch({
          type: REQUEST_ATTRACTIONS_WITH_PARK_START
        });
        request
          .get(`${API_URL}/attractionswithpark`)
          .set('Authorization', 'Bearer ' + token)
          .then(response => {
            dispatch({
              type: REQUEST_ATTRACTIONS_WITH_PARK_SUCCESS,
              payload: response
            });
          })
          .catch(error => {
            dispatch({
              type: REQUEST_ATTRACTIONS_WITH_PARK_FAILED
            })
          });
      }
    } else {
      // token doesnt exist - fail request / signout user as precaution?
      return function(dispatch) {
        dispatch({
          type: REQUEST_ATTRACTIONS_WITH_PARK_FAILED
        });
      }
    }
  }
  
  // Request all attractions for park by park id
  export function requestAttractionsByPark(parkId) {
    // get token from local storage
    const token = localStorage.getItem('jwtToken');
    if(token){
      // token found - make api call to request park by id
      return function(dispatch) {
        // Set start status
        dispatch({
          type: REQUEST_ATTRACTIONS_BY_PARK_START
        });
        request
          .get(`${API_URL}/attractions/park/${parkId}`)
          .set('Authorization', 'Bearer ' + token)
          .then(response => {
            dispatch({
              type: REQUEST_ATTRACTIONS_BY_PARK_SUCCESS,
              payload: response
            });
          })
          .catch(error => {
            dispatch({
              type: REQUEST_ATTRACTIONS_BY_PARK_FAILED
            })
          });
      }
    } else {
      // token doesnt exist - fail request / signout user as precaution?
      return function(dispatch) {
        dispatch({
          type: REQUEST_ATTRACTIONS_BY_PARK_FAILED
        });
      }
    }
  }