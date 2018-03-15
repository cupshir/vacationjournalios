import request from 'superagent';
import realm from '../../database/realm';

import {
    API_URL,

    LOAD_ATTRACTIONS_START,
    LOAD_ATTRACTIONS_SUCCESS,
    LOAD_ATTRACTIONS_FAILED,

    REQUEST_ATTRACTIONS_START,
    REQUEST_ATTRACTIONS_SUCCESS,
    REQUEST_ATTRACTIONS_FAILED
} from '../actions/actionTypes'

// Attraction Actions

// TODO: Load Parks from realm

// Request all attractions
export function requestAttractions() {
  return function(dispatch) {
    // Set start status
    dispatch({
      type: REQUEST_ATTRACTIONS_START
    });
    request
      .get(`${API_URL}/attractionswithpark`)
      .then(response => {
        realm.write(() => {
          response.body.data.forEach(attraction => {
            realm.create('Attraction', {
                id: attraction.attractionid,
                name: attraction.attractionname,
                description: attraction.attractiondescription,
                heightToRide: 0,
                hasScore: attraction.attractionhasscore,
                park: {
                  id: attraction.attractionparkid
                }
              },
              true
            );
          });
          dispatch({
            type: REQUEST_ATTRACTIONS_SUCCESS,
            payload: response
          });
        });
      })
      .catch(error => {
        console.log('catch error: ', error)
        dispatch({
          type: REQUEST_ATTRACTIONS_FAILED,
          error: error
        });
      });
  }
}

