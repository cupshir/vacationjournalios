import request from 'superagent';
import uuid from 'react-native-uuid';
import { AsyncStorage } from 'react-native';
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

      // load user into redux, close signup modal
      if (newUser) {
        dispatch(loadUserFromRealm(newUser));
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

// Load user using realm object
function loadUserFromRealm(user) {
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

        // authentication successful, open users realm
        const config = {
          schema: [Person, Park, Attraction, Journal, JournalEntry],
          sync: {
            user: user,
            url: `${REALM_URL}/${REALM_USER_PATH}`,
          }
        }
        
        userRealm = Realm.open(config)
          .then((userRealm) => {
            // Load user object from realm
            const userObject = userRealm.objectForPrimaryKey('Person', user.identity);

            // load user into redux
            if (userObject != null) {
              dispatch(loadUserFromRealm(userObject));
            } else {
              // something went wrong - user object missing
              console.log('newUserObject missing: ', userObject);
              return dispatch(authenticationError('Something went wrong with userObject'));
            }
          });
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
          dispatch(loadUserFromRealm(userObject));
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

// // Load Realm using cached user
// function loadRealmFromCachedUser(cachedUser) {
//   let returnRealm = null;
//   if (cachedUser) {
//     try {
//       returnRealm = new Realm({
//         schema: [Person, Park, Attraction, Journal, JournalEntry],
//         sync: {
//           user: cachedUser,
//           url: 'realm://10.114.14.115:9080/~/vacationjournal',
//         }
//       })
//     } catch(error) {
//       console.log('catchError: ', error);
//       return null;
//     }
//   }

//   return returnRealm;
// }

// // Load user from realm into Redux
// export function loadUserFromCache() {
//   const cachedUser = Realm.Sync.User.current;
//   let syncedRealm = new Promise((resolve, reject) => {
//     const returnRealm = new Realm({
//       schema: [Person, Park, Attraction, Journal, JournalEntry],
//       sync: {
//         user: cachedUser,
//         url: 'realm://10.114.14.115:9080/~/vacationjournal',
//       }
//     });
//     resolve(returnRealm);
//   })

//   realm.then((syncedRealm) => {
    
//   })

// }

// // Load user from realm into Redux
// export function loadUserFromCache2() {
//   return function(dispatch) {
//     const cachedUser = Realm.Sync.User.current;
//     let userObject = null;
//     console.log('cached: ', cachedUser);
//     if (cachedUser) {
//       realm = loadRealmFromCachedUser(cachedUser);
//       console.log('realm: ', realm);
//       if(realm){
//         userObject = realm.objectForPrimaryKey('User', cachedUser.identity);
//       }
//       console.log('userObject: ', userObject);
//       if (userObject) {
//         dispatch(loadReduxUserFromRealm(userObject, false));
//       } else {
//         dispatch(authenticationError('Failed to get user object from Realm'));
//       }
//     } else {
//       dispatch(authenticationError('No user in cache. Please connect to the internet and sign in or create an account'));
//     }
//   }
// }

 
  
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
    const user = Realm.Sync.User.current;
    user.logout();
    //_removeItem('userId');
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
export function setActiveJournal(realmUser, journal) {
  return (dispatch) => {
    if (realmUser && journal) {
      try {
       userRealm.write(() => {
          realmUser.activeJournal = journal;
        });
        // send updated user object to redux store
        dispatch({
          type: JOURNAL_LOAD_SUCCESS,
          activeJournal: journal
        });
      } catch (error) {
        console.log('setActiveJournal Failed: ', error);
      }
      } else {
        // Action failed
        dispatch({
          type: JOURNAL_ACTION_FAILED,
          error: 'Failed to set active journal: missing realmUser or journal'
        });
      }
  }
}

// Create Journal in local Realm
export function createJournal(journalName, realmUser) {
  return (dispatch) => {
    if (realmUser) {
      try {
        // write new journal to users journals list
        userRealm.write(() => {
          // create new journal
          const newJournal = userRealm.create('Journal', {
              id: uuid.v4(),
              name: journalName,
              owner: realmUser.id,
              dateCreated: new Date(),
              dateModified: new Date(),
            },
            true
          );
          // add journal to users journals
          realmUser.journals.push(newJournal);
          // set active journal
          realmUser.activeJournal = newJournal;

          // load journals and activeJournal into Redux
          dispatch({
            type: JOURNAL_CREATE_SUCCESS,
            journals: realmUser.journals,
            activeJournal: newJournal
          });
        });
      } catch (error) {
        console.log('createJournalFailed: ', error);
        dispatch({
          type: JOURNAL_ACTION_FAILED,
          error: error
        });  
      }        
    } else {
      // something went wrong
      console.log('createJournalFailed missing realm user');
      dispatch({
        type: JOURNAL_ACTION_FAILED,
        error: 'Missing realmUser. Failed to create journal'
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
      let journal = userRealm.objectForPrimaryKey('Journal', journalId);
      if (journal) {
        userRealm.write(() => {
          // save entry to journal
          journal.journalEntries.push(userRealm.create('JournalEntry', {
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
      const journalEntry = userRealm.objectForPrimaryKey('JournalEntry', journalEntryId);
      if (journalEntry) {
        userRealm.write(() => {
          // delete journal entry object
          userRealm.delete(journalEntry);
  
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








// Attraction and Park Actions
// TODO: Load from shared realm file

export function loadParksFromRealm() {
  return (dispatch) => {
    // Get all parks
    const parks = realm.objects('Park');
    dispatch({
      type: LOAD_PARKS_SUCCESS,
      parks: parks
    });  
  }
}

export function loadAttractionsFromRealm() {
  return (dispatch) => {
    // get all attractions
    const attractions = realm.objects('Attraction');
    console.log(attractions)
    dispatch({
      type: LOAD_ATTRACTIONS_SUCCESS,
      attractions: attractions
    });
  }
}


// Request all attractions from API and save to realm
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

// Temp populate attractions from API into realm
function seedAttractions() {
  return function(dispatch) {
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




// Utility functions

// temp, remove before go live
export function realmUtility() {

  const fullRealmURL = `${REALM_URL}/${REALM_PARKS_PATH}`;

  const realm_server = REALM_URL;
  const username = 'vacationjournal-admin';
  const password = 'wdw2021Go!';
  const source_realm_path = `${REALM_URL}/parksDataTemp`;
  const target_realm_path = `${REALM_URL}/seedDataParks`;


  Realm.Sync.User.login(AUTH_URL, username, password).then(user => {
    console.log('user: ', user);

    console.log("done");
  }).catch(error => {
    console.log('Login Failed: ', error);
  });
}

// next few functions for copying seed date to user realm
// copy object from source realm to new realm
function copyObject(obj, objSchema, targetRealm) {
  const copy = {};
  for (var key in objSchema.properties) {
    const prop = objSchema.properties[key];
    if (!prop.hasOwnProperty('objectType')) {
      copy[key] = obj[key];
    }
    else if (prop['type'] == "list") {
      copy[key] = [];
    }
    else {
      copy[key] = null;
    }
  }

  // Add object to target realm
  targetRealm.create(objSchema.name, copy);
}

// return matching objects in 2 realms
function getMatchingObjectInOtherRealm(sourceObj, source_realm, target_realm, class_name) {
  const allObjects = source_realm.objects(class_name);
  const ndx = allObjects.indexOf(sourceObj);

  // Get object on same position in target realm
  return target_realm.objects(class_name)[ndx];
}

// copy links from source realm to new realm
function addLinksToObject(sourceObj, targetObj, objSchema, source_realm, target_realm) {
  for (var key in objSchema.properties) {
    const prop = objSchema.properties[key];
    if (prop.hasOwnProperty('objectType')) {
      if (prop['type'] == "list") {
        var targetList = targetObj[key];
        sourceObj[key].forEach((linkedObj) => {
          const obj = getMatchingObjectInOtherRealm(linkedObj, source_realm, target_realm, prop.objectType);
          targetList.push(obj);
        });
      }
      else {
        // Find the position of the linked object
        const linkedObj = sourceObj[key];
        if (linkedObj === null) {
          continue;
        }

        // set link to object on same position in target realm
        targetObj[key] = getMatchingObjectInOtherRealm(linkedObj, source_realm, target_realm, prop.objectType);
      }
    }
  }
}

// Copy source realm to new realm
function copyRealm(user, source_realm_url, target_realm_url) {
  //open source realm
  const source_realm = new Realm({
    sync: {
      user: user,
      url: source_realm_url,
    }
  });
  const source_realm_schema = source_realm.schema;

  const target_realm = new Realm({
    sync: {
      user: user,
      url: target_realm_url,
    }
  });

  target_realm.write(() => {
    // Copy all objects, but ignore links for now
    source_realm_schema.forEach((objSchema) => {
      console.log('Copying objects: ', objSchema['name']);
      const allObjects = source_realm.objects(objSchema['name']);

      allObjects.forEach((obj) => {
        copyObject(obj, objSchema, target_realm)
      });
    });

    // Do a second pass to add links
    source_realm_schema.forEach((objSchema) => {
      console.log('Updating links in: ', objSchema['name']);
      const allSourceObjects = source_realm.objects(objSchema['name']);
      const allTargetObjects = target_realm.objects(objSchema['name']);

      for (var i = 0; i < allSourceObjects.length; ++i) {
        const sourceObject = allSourceObjects[i];
        const targetObject = allTargetObjects[i];

        addLinksToObject(sourceObject, targetObject, objSchema, source_realm, target_realm);
      }
    });
  });
}




// Local Storage functions

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
