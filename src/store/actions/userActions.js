import request from 'superagent';
import uuid from 'react-native-uuid';
import { AsyncStorage } from 'react-native';
import { Navigation } from 'react-native-navigation';
import realm from '../../database/realm';

import {
    API_URL,

    AUTHENTICATION_START,
    AUTHENTICATION_SUCCESS,
    AUTHENTICATION_ERROR,
    AUTHENTICATION_ERROR_CLEAR,

    SIGN_OUT_USER,

    JOURNALS_LOAD_SUCCESS,
    JOURNALS_CLEAR_SUCCESS,
  
    JOURNAL_SAVING,
    JOURNAL_LOADING,
  
    JOURNAL_LOAD_SUCCESS,
  
    JOURNAL_CREATE_SUCCESS,
    JOURNAL_ENTRY_CREATE_SUCCESS,
  
    JOURNAL_DELETE_SUCCESS,
    JOURNAL_CLEAR_ACTIVE,
    JOURNAL_ENTRY_DELETE_SUCCESS,
    
    JOURNAL_ACTION_FAILED
} from './actionTypes'


// User Actions

// Signin user by verifying email / password and then authenticate user
export function signInUser(email, password) {
    return function(dispatch) {
      // Set authentication status to start
      dispatch({
        type: AUTHENTICATION_START
      });
      // make authentication request
      request
        .post(`${API_URL}/user`)
        .send({
          email: email,
          password: password
        })
        .then(async response => {
          // Check if response status is failed and return message if so
          if(response.body.status === 'failed') {
            return dispatch(authenticationError(response.body));
          }
          // response success - store userId in local storage for easy realm retrieval
          _saveItem('userId', String(response.body.data.id));
          // write user object to realm db
          realm.write(() => {
            const user = realm.create('User', {
                id: response.body.data.id,
                firstName: response.body.data.firstname,
                lastName: response.body.data.lastname,
                email: response.body.data.email,
                jwtToken: response.body.token
              },
              true
            );
            // authenticate user in redux
            dispatch(authenticateUserFromRealm(user, true));
          });
        })
        .catch(error => {
          dispatch(authenticationError(error));
        });
    }
}
  
// Signin user using jwt token ** Not sure if needed for react native app
// export function signInUserByToken(token) {
//     return function(dispatch) {
//       // Set authentication status to start
//       dispatch({
//         type: AUTHENTICATION_START
//       });
//       // make authentication request
//       request
//         .post(`${API_URL}/user`)
//         .set('Authorization', 'Bearer ' + token)
//         .then(response => {
//           // success response - Set user Id in local storage
//           _saveItem('userId', String(response.body.data.id));
//           // Write / Update user in realm dbb
//           realm.write(() => {
//             realm.create('User', {
//                 id: response.body.data.id,
//                 firstName: response.body.data.firstname,
//                 lastName: response.body.data.lastname,
//                 email: response.body.data.email,
//                 jwtToken: response.body.token
//               },
//               true
//             );
//           });
//           // authenticate user in Redux store
//         })
//         .catch(error => {
//           // token failed, remove it
//           //localStorage.removeItem('jwtToken');
//           dispatch(authenticationError(error));
//         });
//     }
// }
  
// Signup user and then authorize newly created user
export function signUpUser(credentials) {
  return function(dispatch) {
    // Set authentication status to start
    dispatch({
      type: AUTHENTICATION_START
    });
    // Send API request to create user
    request
      .post(`${API_URL}/user/create`)
      .send({
        email: credentials.email,
        password: credentials.password,
        firstname: credentials.firstname,
        lastname: credentials.lastname
      })
      .then(response => {
        // Check if response status is failed and return message if so
        if(response.body.status === 'failed') {
          return dispatch(authenticationError(response.body));
        }
        // success response - Set user Id in local storage
        _saveItem('userId', String(response.body.data.id));
        // Write / Update user in realm db
        realm.write(() => {
          const user = realm.create('User', {
              id: response.body.data.id,
              firstName: response.body.data.firstname,
              lastName: response.body.data.lastname,
              email: response.body.data.email,
              jwtToken: response.body.token
            },
            true
          );
          // authenticate user in Redux Store
          dispatch(authenticateUserFromRealm(user, true));
        });
      })
      .catch(error => {
        dispatch(authenticationError(error));
      });
  }
}

// Load user from realm if userId exists in async local storage
export function loadUserFromRealm() {
  return function(dispatch) {
    // Load userId from storage if exists
    _getItem('userId')
      .then((userId) => {
        // load user object from realm db
        const user = realm.objectForPrimaryKey('User', parseInt(userId));

        // authenticate user in redux store
        dispatch(authenticateUserFromRealm(user, false));
    })
    .catch(error => {
      console.log('error: ', error);
    });
  }
}

// Authenticate user using realm object
export function authenticateUserFromRealm(user, dismissModal) {
  if (dismissModal) {
    Navigation.dismissModal();
  }
  return {
    type: AUTHENTICATION_SUCCESS,
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    activeJournal: user.activeJournal,
    journals: user.journals,
    token: user.jwtToken
  }
}
  
// Authenticate user using API response
export function authenticateUserFromAPI(response) {
  Navigation.dismissModal();
  return {
      type: AUTHENTICATION_SUCCESS,
      userId: response.data.id,
      email: response.data.email,
      firstName: response.data.firstname,
      lastName: response.data.lastname,
      token: response.token
  }
}
  
// Authentication Error
export function authenticationError(error) {
  return {
      type: AUTHENTICATION_ERROR,
      payload: error
  }
}

// Clear Authentication Error Message in Redux
export function authenticationErrorClear() {
  return {
    type: AUTHENTICATION_ERROR_CLEAR
  }
}
  
// Signout User and clear userId from local storage
export function signOutUser() {
  return function (dispatch) {
    _removeItem('userId');
    dispatch({
      type: SIGN_OUT_USER
    }); 
  }
}


  // Get Journals by userId
export function getJournals(userId) {
  return (dispatch) => {
    if(userId) {
      // Get all journals
      const journals = realm.objects('Journal').filtered('user.id = $0', userId);
      dispatch({
        type: JOURNALS_LOAD_SUCCESS,
        journals: journals
      });  
    } else {
      dispatch({
        type: JOURNAL_ACTION_FAILED,
        error: 'Failed to load journals'
      })
    }
  };
}

// Clear journals from redux store
export function clearJournals() {
  return {
    type: JOURNALS_CLEAR_SUCCESS
  }
}

// Get Journal by Id
export function getJournal(journalId) {
  return (dispatch) => {
    if (journalId) {
      const journal = realm.objectForPrimaryKey('Journal', journalId);
      if (journal) {
        dispatch({
          type: JOURNAL_LOAD_SUCCESS,
          activeJournal: journal
        });
      } else {
        dispatch({
          type: JOURNAL_ACTION_FAILED,
          error: 'Failed to load journal'
        });
      }
    } else {
      dispatch({
        type: JOURNAL_ACTION_FAILED,
        error: 'Failed to load journal'
      });
    }
  }
}

// Get Journal by Id and set as activeJournal
export function getJournalAndSetAsActiveJournal(userId, journalId) {
  return (dispatch) => {
    if (userId && journalId) {
      // load user object and journal object
      const user = realm.objectForPrimaryKey('User', userId);
      const journal = realm.objectForPrimaryKey('Journal', journalId);
      if (journal && user) {
        // write journal object to activeJournal of user object
        realm.write(() => {
          user.activeJournal = journal;
        });
        // send updated user object to redux store
        dispatch({
          type: JOURNAL_LOAD_SUCCESS,
          activeJournal: user.activeJournal
        });
      } else {
        // Action failed
        dispatch({
          type: JOURNAL_ACTION_FAILED,
          error: 'Failed to load journal'
        });
      }
    } else {
      // Missing userId or Journal id
      dispatch({
        type: JOURNAL_ACTION_FAILED,
        error: 'UserId and/or JournalId missing. Unable to get journal'
      });
    }
  }
}

// Create Journal in local Realm
export function createJournal(journalName, userId) {
  return (dispatch) => {
    try {
      // load user object
      let user = realm.objectForPrimaryKey('User', userId);
      if (user) {
        // write new journal to users journals list
        realm.write(() => {
          user.journals.push(realm.create('Journal', {
              id: uuid.v4(),
              name: journalName,
              dateCreated: Date(),
              dateModified: Date(),
            },
            true
          ));
          // set newly created journal as activeJournal
          const activeJournal = user.journals.sorted('dateCreated', true)[0];
          user.activeJournal = activeJournal;
          // load journals and activeJournal into Redux
          dispatch({
            type: JOURNAL_CREATE_SUCCESS,
            journals: user.journals,
            activeJournal: activeJournal
          });
        });
      } else {
        // something went wrong
        dispatch({
          type: JOURNAL_ACTION_FAILED,
          error: 'Missing UserId. Failed to create journal'
        });          
      }
    } catch (error) {
      // something went wrong
      dispatch({
        type: JOURNAL_ACTION_FAILED,
        error: error
      });  
    }
  }
}

// Delete Journal from local Realm
export function deleteJournal(journalId, activeJournalId) {
  return (dispatch) => {
    try {
      if (journalId === activeJournalId) {
        dispatch({
          type: JOURNAL_CLEAR_ACTIVE
        });
      }
      // get Journal object to delete
      const journal = realm.objectForPrimaryKey('Journal', journalId);
      realm.write(() => {
        // delete journal object
        realm.delete(journal);
        
        dispatch({
          type: JOURNAL_DELETE_SUCCESS
        });
      })
    } catch (error) {
      dispatch({
        type: JOURNAL_ACTION_FAILED,
        error: error
      });  
    }
  }
}

// Save Journal Entry to Realm
export function createJournalEntry(journalId, entryValues) {
  return (dispatch) => {
    dispatch({
      type: JOURNAL_SAVING
    });
    try {
      // Get Journal
      let journal = realm.objectForPrimaryKey('Journal', journalId);
      if (journal) {
        realm.write(() => {
          // save entry to journal
          journal.journalEntries.push(realm.create('JournalEntry', {
            id: uuid.v4(),
            park: { id: entryValues.parkId },
            attraction: { id: entryValues.attractionId },
            dateJournaled: entryValues.dateJournaled,
            dateCreated: Date(),
            dateModified: Date(),
            minutesWaited: entryValues.minutesWaited,
            rating: entryValues.rating,
            pointsScored: entryValues.pointsScored,
            usedFastPass: entryValues.usedFastPass,
            comments: entryValues.comments  
            },
            true
          ));
          // dispatch success
          dispatch({
            type: JOURNAL_ENTRY_CREATE_SUCCESS,
            activeJournal: journal
          });  
        });
      }
    } catch (error) {
      console.log('createJournalEntryError: ', error);
      dispatch({
        type: JOURNAL_ACTION_FAILED,
        error: error
      });  
    }
  }
}

// Delete Journal Entry from local Realm
export function deleteJournalEntry(journalEntryId) {
  return (dispatch) => {
    try {
      // get journal entry object to delete
      const journalEntry = realm.objectForPrimaryKey('JournalEntry', journalEntryId);
      if (journalEntry) {
        realm.write(() => {
          // delete journal entry object
          realm.delete(journalEntry);
  
          dispatch({
            type: JOURNAL_ENTRY_DELETE_SUCCESS
          });
        })
      } else {
        // something failed
        dispatch({
          type: JOURNAL_ACTION_FAILED,
          error: 'Failed to load journal entry object for deletion'
        });  
      }
    } catch (error) {
      dispatch({
        type: JOURNAL_ACTION_FAILED,
        error: error
      });  
    }
  }
}


// Local Storage Methods

// Save item to local storage
const _saveItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    throw error;
  }
};

// Get item from local storage
const _getItem = async (key) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    throw error;
  }
};

// Remove item from local storage
const _removeItem = async (key) => {
  try {
    return await AsyncStorage.removeItem(key);
  } catch (error) {
    throw error;
  }
};
