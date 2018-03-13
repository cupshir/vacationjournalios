import request from 'superagent';

import {  
    API_URL,

    CLEAR_JOURNAL_STATUSES,

    GET_JOURNALS,

    REQUEST_JOURNAL_BY_USER_START,
    REQUEST_JOURNAL_BY_USER_SUCCESS,
    REQUEST_JOURNAL_BY_USER_FAILED,

    SUBMIT_JOURNAL_ENTRY_BY_USER_START,
    SUBMIT_JOURNAL_ENTRY_BY_USER_SUCCESS,
    SUBMIT_JOURNAL_ENTRY_BY_USER_FAILED,

    DELETE_JOURNAL_ENTRY_BY_USER_START,
    DELETE_JOURNAL_ENTRY_BY_USER_SUCCESS,
    DELETE_JOURNAL_ENTRY_BY_USER_FAILED
} from './actionTypes'

// Journal Actions
// Clear all journal statuses
export function clearJournalStatuses() {
  return {
    type: CLEAR_JOURNAL_STATUSES
  }
}

export function submitJournalEntry(values) {
  try {
    //await AsyncStorage.setItem('@MySuperStore:key', 'I like to save it.');
  } catch (error) {
    // Error saving data
  }
}

// Add journal entry
export function submitJournalEntryToServer(values) {
    // get token from local storage
    const token = localStorage.getItem('jwtToken');
    if(token){
      return function(dispatch) {
        // Set start status
        dispatch({
          type: SUBMIT_JOURNAL_ENTRY_BY_USER_START
        });
        request
          .post(`${API_URL}/journal`)
          .set('Authorization', 'Bearer ' + token)
          .send({
            userid: values.userid,
            parkid: values.parkid,
            attractionid: values.attractionid,
            datejournaled: values.datejournaled,
            minuteswaited: values.minuteswaited,
            rating: values.rating,
            pointsscored: values.pointsscored,
            usedfastpass: values.usedfastpass,
            comments: values.comments
          })
          .then(response => {
            // Check if response status is failed
            if(response.body.status === 'failed') {
              dispatch({
                type: SUBMIT_JOURNAL_ENTRY_BY_USER_FAILED
              });
            }
            // response was success
            dispatch({
              type: SUBMIT_JOURNAL_ENTRY_BY_USER_SUCCESS,
              payload: response
            });
          })
          .catch(error => {
            // TODO: do something for now dispatch failed
            dispatch({
              type: SUBMIT_JOURNAL_ENTRY_BY_USER_FAILED
            });
          });
        }
    } else {
      // token doesnt exist - fail request / signout user as precaution?
      return function(dispatch) {
        dispatch({
          type: SUBMIT_JOURNAL_ENTRY_BY_USER_FAILED
        });
      }
    }
  }
  
  // Request all journal entries by user id in token
  export function requestJournalEntriesByToken() {
    // get token from local storage
    const token = localStorage.getItem('jwtToken');
    if(token){
      // token found - make api call to request park by id
      return function(dispatch) {
        // Set start status
        dispatch({
          type: REQUEST_JOURNAL_BY_USER_START
        });
        request
          .get(`${API_URL}/userjournal`)
          .set('Authorization', 'Bearer ' + token)
          .then(response => {
            dispatch({
              type: REQUEST_JOURNAL_BY_USER_SUCCESS,
              payload: response
            });
          })
          .catch(error => {
            dispatch({
              type: REQUEST_JOURNAL_BY_USER_FAILED
            })
          });
      }
    } else {
      // token doesnt exist - fail request / signout user as precaution?
      return function(dispatch) {
        dispatch({
          type: REQUEST_JOURNAL_BY_USER_FAILED
        });
      }
    }
  }
  
  // Delete journal entry by user id in token
  export function deleteJournalEntryById(journalId) {
    // get token from local storage
    const token = localStorage.getItem('jwtToken');
    if(token){
      // token found - make api call to request park by id
      return function(dispatch) {
        // Set start status
        dispatch({
          type: DELETE_JOURNAL_ENTRY_BY_USER_START
        });
        request
          .delete(`${API_URL}/journal/${journalId}`)
          .set('Authorization', 'Bearer ' + token)
          .then(response => {
            dispatch({
              type: DELETE_JOURNAL_ENTRY_BY_USER_SUCCESS,
              payload: response
            });
          })
          .catch(error => {
            dispatch({
              type: DELETE_JOURNAL_ENTRY_BY_USER_FAILED
            })
          });
      }
    } else {
      // token doesnt exist - fail request / signout user as precaution?
      return function(dispatch) {
        dispatch({
          type: DELETE_JOURNAL_ENTRY_BY_USER_FAILED
        });
      }
    }
  }


// Get Journals from realm dbb
  function getJournalsSuccess(journals) {
    return {
      type: actionTypes.GET_JOURNALS,
      isLoading: false,
      journals,
    };
  }
  
  function getJournals() {
    return (dispatch) => {
      const journalsData = realm.objects('Journal');
      if (journalsData.length === 0) {
        // moviesService.getMovies().then((movies) => {
        //   realm.write(() => {
        //     movies.map(async (movie) => {
        //       realm.create('Movie', {
        //         title: movie.title,
        //         releaseYear: movie.releaseYear,
        //       });
        //     });
        //   });
        //   dispatch(getMoviesSuccess(movies));
        //});
      } else {
        dispatch(getJournalsSuccess(Array.from(journalsData)));
      }
    };
  }
  