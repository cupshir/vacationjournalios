//import request from 'superagent';
import uuid from 'react-native-uuid';
//import { AsyncStorage } from 'react-native';
import { Navigation } from 'react-native-navigation';
import Realm from 'realm';
import {
  Person, 
  Park, 
  Attraction, 
  Journal, 
  JournalEntry
} from '../../database/realm';

import {
    API_URL,
    AUTH_URL,
    REALM_URL,
    REALM_PARKS_PATH,
    REALM_USER_PATH,

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
    
    JOURNAL_ACTION_FAILED,

    LOAD_ATTRACTIONS_START,
    LOAD_ATTRACTIONS_SUCCESS,
    LOAD_ATTRACTIONS_FAILED,

    REQUEST_ATTRACTIONS_START,
    REQUEST_ATTRACTIONS_SUCCESS,
    REQUEST_ATTRACTIONS_FAILED,

    LOAD_PARKS_START,
    LOAD_PARKS_SUCCESS,
    LOAD_PARKS_FAILED,

    REQUEST_PARKS_START,
    REQUEST_PARKS_SUCCESS,
    REQUEST_PARKS_FAILED
} from './actionTypes'

// User Actions
export let parkRealm;
export let userRealm;

// Register user and build userRealm
export function registerUser(userObject) {
  return function(dispatch) {
    // Set authentication status to start
    dispatch({
      type: AUTHENTICATION_START
    });
    // Send register request to create user
    Realm.Sync.User.register(AUTH_URL, userObject.email, userObject.password).then(user => {
      // Open a new user Realm        
      userRealm = new Realm({
        schema: [Person, Park, Attraction, Journal, JournalEntry],
        sync: {
          user,
          url: `${REALM_URL}/${REALM_USER_PATH}`
        }
      });

      // Open the park/attraction seed realm
      parkRealm = new Realm({
        schema: [Park, Attraction],
        sync: {
          user,
          url: `${REALM_URL}/${REALM_PARKS_PATH}`
        }
      });

      let newUser;
      // Create a new Person object in the userRealm
      try {
        userRealm.write(() => {
          newUser = userRealm.create('Person', {
            id: user.identity,
            email: userObject.email,
            firstName: userObject.firstName,
            lastName: userObject.lastName,
            activeJournal: null,
            journals: [],
            dateCreated: new Date(),
            dateModified: new Date(),
          });
        })
  
      } catch (e) {
        // Something went wrong userRealm write
        console.log('userRealmWriteError: ', e);
        return dispatch(authenticationError(e));
      }

      // load user into redux
      if (newUser) {
        return dispatch(loadUserFromRealm(newUser));
      } else {
        // something went wrong - user object missing
        console.log('newUserObject missing: ', newUser);
        return dispatch(authenticationError('Something went wrong with userObject'));
      }
    }).catch(error =>  {
      // Something went wrong with register
      console.log('registerCatchError1: ', error);
      return dispatch(authenticationError(error));
    })
  }
}

// // Signin user by verifying email / password and then authenticate user
export function signInUser(email, password) {
  return function(dispatch) {
    // Set authentication status to start
    dispatch({
      type: AUTHENTICATION_START
    });
    // make authentication request
    Realm.Sync.User.login(AUTH_URL, email, password)
      .then(user => {
        // Open the park/attraction seed realm
        parkRealm = new Realm({
          schema: [Park, Attraction],
          sync: {
            user,
            url: `${REALM_URL}/${REALM_PARKS_PATH}`
          }
        });

        // Open userRealm
        userRealm = new Realm({
          schema: [Person, Park, Attraction, Journal, JournalEntry],
          sync: {
            user,
            url: `${REALM_URL}/${REALM_USER_PATH}`,
          }
        });

        const userObject = userRealm.objectForPrimaryKey('Person', user.identity);

        // load user into redux
        if (userObject) {
          return dispatch(loadUserFromRealm(userObject));
        } else {
          // something went wrong - user object missing
          console.log('userObject missing: ', userObject);
          return dispatch(authenticationError('Something went wrong with userObject'));
        }
      })
      .catch(error => {
        console.log('Error authenticating: ', error)
        dispatch(authenticationError(error));
      })
  }
}

// Load user from cache
export function loadUserFromCache() {
  return function (dispatch) {
    // Try to load user from cache
    const user = Realm.Sync.User.current;

    if (user) {
      // Open userRealm
      userRealm = new Realm({
        schema: [Person, Park, Attraction, Journal, JournalEntry],
        sync: {
          user,
          url: `${REALM_URL}/${REALM_USER_PATH}`,
        }
      });

      // Open the park/attraction seed realm
      parkRealm = new Realm({
        schema: [Park, Attraction],
        sync: {
          user,
          url: `${REALM_URL}/${REALM_PARKS_PATH}`
        }
      });

      const userObject = userRealm.objectForPrimaryKey('Person', user.identity);

      // load user into redux
      if (userObject) {
        return dispatch(loadUserFromRealm(userObject));
      } else {
        // something went wrong - user object missing
        console.log('userObject missing: ', userObject);
        return dispatch(authenticationError('Something went wrong with userObject'));
      }
    } 
    // user doesnt exist
    return null;
  }
}





// Load user using realm object
export function loadUserFromRealm(user) {
  return {
    type: AUTHENTICATION_SUCCESS,
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    activeJournal: user.activeJournal,
    journals: user.journals
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
  
// Signout User
export function signOutUser() {
  return function (dispatch) {
    const user = Realm.Sync.User.current;
    user.logout();
    dispatch({
      type: SIGN_OUT_USER
    }); 
  }
}

// End User Actions

// Journal Actions

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
export function setActiveJournal(person, journal) {
  return (dispatch) => {
    if (person && journal) {
      try {
       userRealm.write(() => {
          person.activeJournal = journal;
        });
        // send updated user object to redux store
        return dispatch({
          type: JOURNAL_LOAD_SUCCESS,
          activeJournal: journal
        });
      } catch (error) {
        // Action failed
        console.log('setActiveJournal Failed: ', error);
        dispatch({
          type: JOURNAL_ACTION_FAILED,
          error: 'Failed to set active journal: Error writing active journal to person'
        });
      }
      } else {
        // Action failed
        dispatch({
          type: JOURNAL_ACTION_FAILED,
          error: 'Failed to set active journal: missing person or journal'
        });
      }
  }
}

// Create Journal in local Realm
export function createJournal(journalName, person) {
  return (dispatch) => {
    if (person) {
      try {
        userRealm.write(() => {
          // create new journal
          const newJournal = userRealm.create('Journal', {
              id: uuid.v4(),
              name: journalName,
              owner: person.id,
              dateCreated: new Date(),
              dateModified: new Date(),
            },
            true
          );
          // add journal to users journals
          person.journals.push(newJournal);
          // set active journal
          person.activeJournal = newJournal;

          // load journals and activeJournal into Redux
          return dispatch({
            type: JOURNAL_CREATE_SUCCESS,
            journals: person.journals,
            activeJournal: newJournal
          });
        });
      } catch (error) {
        console.log('createJournalFailed: ', error);
        return dispatch({
          type: JOURNAL_ACTION_FAILED,
          error: error
        });  
      }        
    } else {
      // something went wrong
      console.log('createJournalFailed missing person');
      return dispatch({
        type: JOURNAL_ACTION_FAILED,
        error: 'Missing person. Failed to create journal'
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
      const journal = userRealm.objectForPrimaryKey('Journal', journalId);
      userRealm.write(() => {
        // delete journal object
        userRealm.delete(journal);
        
        return dispatch({
          type: JOURNAL_DELETE_SUCCESS
        });
      })
    } catch (error) {
      return dispatch({
        type: JOURNAL_ACTION_FAILED,
        error: error
      });  
    }
  }
}

// Save Journal Entry to Realm
export function createJournalEntry(person, park, attraction, entryValues) {
  return (dispatch) => {
    dispatch({
      type: JOURNAL_SAVING
    });
    try {
      userRealm.write(() => {
        const selectedPark = userRealm.create('Park', {
          id: park.id,
          name: park.name,
          dateCreated: park.dateCreated,
          dateModified: park.dateModified,
          dateSynced: new Date()
          }, 
          true
        );

        if (selectedPark) {
          const selectedAttraction = userRealm.create('Attraction', {
            id: attraction.id,
            name: attraction.name,
            park: { id: selectedPark.id },
            description: attraction.description,
            heightToRide: attraction.heightToRide,
            hasScore: attraction.hasScore,
            dateCreated: attraction.dateCreated,
            dateModified: attraction.dateModified,
            dateSynced: new Date()
            }, 
            true
          );
          
          if (selectedAttraction) {
            // save new journal entry
            const newJournalEntry = userRealm.create('JournalEntry', {
              id: uuid.v4(),
              park: { id: selectedPark.id },
              attraction: { id: selectedAttraction.id },
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
            );

            if (newJournalEntry) {
              // add journal entry to journal
              person.activeJournal.journalEntries.push(newJournalEntry);
            } else {
              console.log('Create New Journal Entry Failed');
              return dispatch({
                type: JOURNAL_ACTION_FAILED,
                error: 'Create New Journal Entry Failed'
              });                
            }

          } else {
            console.log('Create Attraction Failed');
            return dispatch({
              type: JOURNAL_ACTION_FAILED,
              error: 'Create Attraction Failed'
            });  
          }
        } else {
          console.log('Create Park Failed');
          return dispatch({
            type: JOURNAL_ACTION_FAILED,
            error: 'Create Park Failed'
          });  
        }

        // dispatch success
        return dispatch({
          type: JOURNAL_ENTRY_CREATE_SUCCESS,
          activeJournal: person.activeJournal
        });  
      });
    } catch (error) {
      console.log('createJournalEntryError: ', error);
      return dispatch({
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
      const journalEntry = userRealm.objectForPrimaryKey('JournalEntry', journalEntryId);
      if (journalEntry) {
        userRealm.write(() => {
          // delete journal entry object
          userRealm.delete(journalEntry);
  
          return dispatch({
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

