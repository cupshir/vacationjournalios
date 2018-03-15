import request from 'superagent';
import realm from '../../database/realm';

import {
    API_URL,

    LOAD_PARKS_START,
    LOAD_PARKS_SUCCESS,
    LOAD_PARKS_FAILED,

    REQUEST_PARKS_START,
    REQUEST_PARKS_SUCCESS,
    REQUEST_PARKS_FAILED
} from './actionTypes'

// Park Actions

// TODO: Load parks from realm

// Request all parks from api and save to realm
export function requestParks() {
  return function(dispatch) {
    // Set start status
    dispatch({
      type: REQUEST_PARKS_START
    });
    request
      .get(`${API_URL}/parks`)
      .then(response => {
        realm.write(() => {
          response.body.data.forEach(park => {
            realm.create('Park', {
                id: park.parkid,
                name: park.parkname
              },
              true
            );
          });
          dispatch({
            type: REQUEST_PARKS_SUCCESS,
            payload: response
          });
        })
      })
      .catch(error => {
        dispatch({
          type: REQUEST_PARKS_FAILED,
          error: error
        });
      });
  }
}