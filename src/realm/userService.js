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
} from './model/user';

import {
    API_URL,
    AUTH_URL,
    REALM_URL,
    REALM_PARKS_PATH,
    REALM_USER_PATH,
} from './config'

// Class Properties?
export let parkRealm;
export let userRealm;
export let currentUser;

// User Functions

// Register user and build realms
export function registerUser(userObject) {
    return new Promise((resolve, reject) => {
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

            // Create a new Person object in the userRealm
            try {
                userRealm.write(() => {
                    currentUser = userRealm.create('Person', {
                        id: user.identity,
                        email: userObject.email,
                        firstName: userObject.firstName,
                        lastName: userObject.lastName,
                        activeJournal: null,
                        journals: [],
                        dateCreated: new Date(),
                        dateModified: new Date(),
                    });
                });
            } catch (e) {
                // Something went wrong userRealm write
                console.log('userRealmWriteError: ', e);
                reject(e);
            }
            console.log('registerUserSuccess: ', currentUser);
            resolve(currentUser);
        }).catch(error =>  {
            // Something went wrong with register
            console.log('registerCatchError1: ', error);
            reject(error);
        });
    });
}

// Signin user by verifying email / password and then load realms
export function signInUser(email, password) {
    return new Promise((resolve, reject) => {
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

            currentUser = userRealm.objectForPrimaryKey('Person', user.identity);
            console.log('signInSuccess: ', currentUser);
            resolve(currentUser);
        }).catch(error => {
            console.log('Error authenticating: ', error);
            reject(error);
        });
    });
}

// Load user from cache then load realms
export function loadUserFromCache() {
    return new Promise((resolve, reject) => {
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

            currentUser = userRealm.objectForPrimaryKey('Person', user.identity);
            resolve(currentUser);
        } 
        // user doesnt exist
        reject();
    });
}

// Signout User and close out realms
export function signOutUser() {
    return new Promise((resolve, reject) => {
        if(currentUser) {
            currentUser = null;
            Realm.Sync.User.current.logout();
            userRealm = null;
            parkRealm = null;      
            console.log('signOutUserSuccess');
            resolve(currentUser);
        }
        reject('Something went wrong with signout');
    });
}

// End User Functions

// Journal Functions

// Get Journals by userId
export function getJournals(userId) {
    if(userId) {
      // Get all journals
      const journals = realm.objects('Journal').filtered('user.id = $0', userId);
    } else {
    }
  
}

// Get Journal by Id
export function getJournal(journalId) {
    if (journalId) {
      const journal = realm.objectForPrimaryKey('Journal', journalId);
      if (journal) {
      } else {
      }
    } else {
    }
  
}

// Get Journal by Id and set as activeJournal
export function setActiveJournal(person, journal) {
    if (person && journal) {
      try {
       userRealm.write(() => {
          person.activeJournal = journal;
        });
        // send updated user object to redux store
      } catch (error) {
        // Action failed
        console.log('setActiveJournal Failed: ', error);
      }
      } else {
        // Action failed
      }
  
}

// Create Journal in local Realm
export function createJournal(journalName, person) {
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
        });
      } catch (error) {
        console.log('createJournalFailed: ', error);
      }        
    } else {
      // something went wrong
      console.log('createJournalFailed missing person');
    }
  
}

// Delete Journal from local Realm
export function deleteJournal(journalId, activeJournalId) {
    try {
      if (journalId === activeJournalId) {
      }
      // get Journal object to delete
      const journal = userRealm.objectForPrimaryKey('Journal', journalId);
      userRealm.write(() => {
        // delete journal object
        userRealm.delete(journal);
        
      })
    } catch (error) {
    }
  
}

// Save Journal Entry to Realm
export function createJournalEntry(person, park, attraction, entryValues) {
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
            }

          } else {
            console.log('Create Attraction Failed');
          }
        } else {
          console.log('Create Park Failed');
        }

        // dispatch success
      });
    } catch (error) {
      console.log('createJournalEntryError: ', error);
    }
  
}

// Delete Journal Entry from local Realm
export function deleteJournalEntry(journalEntryId) {
    try {
      // get journal entry object to delete
      const journalEntry = userRealm.objectForPrimaryKey('JournalEntry', journalEntryId);
      if (journalEntry) {
        userRealm.write(() => {
          // delete journal entry object
          userRealm.delete(journalEntry);
  
        })
      } else {
        // something failed
      }
    } catch (error) {
    }
  
}

