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


//
// TODO:  Delete Journal Entries when deleting journal to prevent Orphan records
//


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
        const userCheck = Realm.Sync.User.current;
        if (!userCheck) {
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

                // Had problems with opening as new realm, using this method...not sure if correct...but for now its working
                const userConfig = {
                    schema: [Person, Park, Attraction, Journal, JournalEntry],
                    sync: {
                        user,
                        url: `${REALM_URL}/${REALM_USER_PATH}`
                    }
                }
                Realm.open(userConfig).then(realm => {
                    userRealm = realm;

                    currentUser = userRealm.objectForPrimaryKey('Person', user.identity);
                    
                    resolve(currentUser);
                }).catch((error) => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        } else {
            const error = { message: 'User already signed in' };
            reject(error);
        }
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
        currentUser = null;
        Realm.Sync.User.current.logout();
        userRealm = null;
        parkRealm = null;      
        console.log('signOutUserSuccess');
        resolve(currentUser);
        
        reject('Something went wrong with signout');
    });
}


// End User Functions

// Journal Functions

// Get Journals by userId
export function getJournals(userId) {
    return new Promise((resolve, reject) => {
        if(userId) {
            // Get all journals
            const journals = userRealm.objects('Journal').filtered('user.id = $0', userId);
            if (journals) {
                // journals found, return them
                resolve(journals);
            } else {
                // failed
                reject('Failed to load journals: no journals found in realm');
            }
        } else {
            // failed
            reject('Failed to load journals: missing user id')
        }
    });  
}

// Get Journal by Id
export function getJournalById(id) {
    return new Promise((resolve, reject) => {
        if (id) {
            const journal = userRealm.objectForPrimaryKey('Journal', id);
            if (journal) {
                // journal found, return it
                resolve(journal);
            } else {
                // failed
                reject('Failed to load journal: journal not found in realm');
            }
        } else {
            // failed
            reject('Missing to load journal: missing id');
        }
    });
  
}

// Get Journal by Id and set as activeJournal
export function setActiveJournal(journalId) {
    return new Promise((resolve, reject) => {
        // Check for current user and userRealm
        if(!currentUser) {
            reject('Missing Current User');
        } else if (!userRealm){
            reject('Missing userRealm');
        }

        // Get journal object
        const journal = userRealm.objectForPrimaryKey('Journal', journalId);

        if(journal) {
            try {
                // write journal to user's active journal
                userRealm.write(() => {
                    currentUser.activeJournal = journal;
                });
            } catch (error) {
                reject('Something went wrong with realm write')
            }
            resolve(journal);
        } else {
            reject('Something went wrong with loading journal from realm');
        }
    });  
}

// Create Journal in local Realm
export function saveJournal(journal, isEdit) {
    return new Promise((resolve, reject) => {
        // Get owner of journal
        const person = userRealm.objectForPrimaryKey('Person', journal.owner);
        if (person) {
            try {
                userRealm.write(() => {
                    // create new journal
                    const journalObject = userRealm.create('Journal', {
                        id: journal.id,
                        name: journal.name,
                        photo: journal.photo,
                        startDate: journal.startDate,
                        endDate: journal.endDate,
                        parks: journal.parks,
                        owner: journal.owner,
                        dateCreated: journal.createdDate,
                        dateModified: new Date(),
                        },
                        true
                    );
                    // if not editing, add journal to persons journals and set as active
                    if (!isEdit) {
                        person.journals.push(journalObject);
                        person.activeJournal = journalObject;
                    }
    
                    // success return journal object
                    resolve(journalObject);
                });
            } catch (error) {
                console.log('createJournalFailed: ', error);
                reject('Create Journal Failed');
            }        
        } else {
            reject('Create Journal failed: couldnt find owner');
        }

    })
 
}

// Delete Journal from local Realm
export function deleteJournal(journalId) {
    return new Promise((resolve, reject) => {
        try {
            // get Journal object to delete
            const journal = userRealm.objectForPrimaryKey('Journal', journalId);

            userRealm.write(() => {
                // delete journal object
                userRealm.delete(journal);    
            })
            reslove();
        } catch (error) {
            reject('Failed to delete journal');
        }
    })
}

// Get Journal Entry by Id
// TODO: Delete all Journal Entries under Journal
export function getJournalEntryById(journalEntryId) {
    return new Promise((resolve, reject) => {
        const journalEntry = userRealm.objectForPrimaryKey('JournalEntry', journalEntryId);

        if (journalEntry) {
            resolve(journalEntry);
        } else {
            reject('Failed to load Journal Entry');
        }
    });
}

// Save Journal Entry to Realm
export function createJournalEntry(park, attraction, entryValues, isEdit) {
    return new Promise((resolve, reject) => {
        try {
            userRealm.write(() => {
                const selectedPark = userRealm.create('Park', {
                    id: park.id,
                    name: park.name,
                    photo: '',
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
                        photo: '',
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
                            id: entryValues.journalEntryId,
                            park: { id: selectedPark.id },
                            attraction: { id: selectedAttraction.id },
                            dateJournaled: entryValues.dateJournaled,
                            dateCreated: Date(),
                            dateModified: Date(),
                            photo: entryValues.photo,
                            minutesWaited: entryValues.minutesWaited,
                            rating: entryValues.rating,
                            pointsScored: entryValues.pointsScored,
                            usedFastPass: entryValues.usedFastPass,
                            comments: entryValues.comments  
                            },
                            true
                        );

                        if (newJournalEntry) {
                            // If not edit, add journal entry to journal
                            if (!isEdit) {
                                currentUser.activeJournal.journalEntries.push(newJournalEntry);
                            }
                            resolve();
                        } else {
                            console.log('Create New Journal Entry Failed');
                            reject('Write Journal Entry failed');
                        }

                    } else {
                        console.log('Create Attraction Failed');
                        reject('Write Attraction failed');
                    }
                } else {
                    console.log('Create Park Failed');
                    reject('Write Park Failed');
                }
            });
        } catch (error) {
            console.log('createJournalEntryError: ', error);
            reject('Write Journal Entry Failed');
        }
    })
}

// Delete Journal Entry from local Realm
export function deleteJournalEntry(journalEntryId) {
    return new Promise((resolve, reject) => {
        try {
            // get journal entry object to delete
            const journalEntry = userRealm.objectForPrimaryKey('JournalEntry', journalEntryId);
            if (journalEntry) {
                userRealm.write(() => {
                    // delete journal entry object
                    userRealm.delete(journalEntry);
                    
                    resolve();
                })
            } else {
                // something failed
                reject('Delete Journal Entry Failed');
            }
        } catch (error) {
            reject(error);
        }
    })
}

