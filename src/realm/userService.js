import uuid from 'react-native-uuid';
import moment from 'moment';
import { CameraRoll } from 'react-native';
import { Navigation } from 'react-native-navigation';
import Realm from 'realm';
import {
    Person, 
    Park, 
    Attraction, 
    Journal, 
    JournalEntry
} from './model/user';

import * as AppConstants from './config';

// Class Properties?
export let parkRealm;
export let userRealm;
export let currentUser;
export let attractions;
export let parks;

//// User Functions

// Register user and build realms
export function registerUser(userObject) {
    return new Promise((resolve, reject) => {
        const userCheck = Realm.Sync.User.current;
        if (!userCheck) {
            // Send register request to create user
            Realm.Sync.User.register(AppConstants.AUTH_URL, userObject.email, userObject.password).then(user => {
                // Open a new user Realm        
                userRealm = new Realm({
                    schema: [Person, Park, Attraction, Journal, JournalEntry],
                    sync: {
                        user,
                        url: `${AppConstants.REALM_URL}/${AppConstants.REALM_USER_PATH}`
                    }
                });

                // Create a new Person object in the userRealm
                try {
                    userRealm.write(() => {
                        currentUser = userRealm.create('Person', {
                            id: user.identity,
                            email: userObject.email,
                            firstName: userObject.firstName,
                            lastName: '',
                            profilePhoto: '',
                            savePhotosToCameraRoll: false,
                            activeJournal: null,
                            journals: [],
                            dateCreated: new Date(),
                            dateModified: new Date(),
                            parksLastSynced: new Date(1900,0,1),
                            attractionsLastSynced: new Date(1900,0,1)
                        });
                    });
                    // horrible hack? wait 2s then try the initial seed user realm
                    setTimeout(initialSeedFromParkRealm(), 2000);
                    resolve(currentUser);
                } catch (e) {
                    // Something went wrong userRealm write
                    console.log('userRealmWriteError: ', e);
                    reject(e);
                }
            }).catch(error =>  {
                // Something went wrong with register
                console.log('registerCatchError1: ', error);
                reject(error);
            });
        } else {
            signOutUser();
            reject('Error: Current user logged out, please try again.');
        }
    });
}

// Update user photo
export function saveUserPhoto(photo) {
    return new Promise((resolve, reject) => {
        if (currentUser) {
            try {
                userRealm.write(() => {
                    currentUser.profilePhoto = photo;
                    currentUser.dateModified = new Date();
                });

                resolve(currentUser);
            } catch (e) {
                reject('Save Photo failed: ', e);
            }
        } else {
            reject('User not logged in.');
        }
    });
}

// Update user info in realm (currently only supports firstname and lastname)
export function saveUser(updatedUserInfo) {
    return new Promise((resolve, reject) => {
        if (currentUser) {
            // Update Person object in the userRealm
            try {
                userRealm.write(() => {
                    currentUser.firstName = updatedUserInfo.firstName;
                    currentUser.lastName = updatedUserInfo.lastName;
                    currentUser.savePhotosToCameraRoll = updatedUserInfo.savePhotosToCameraRoll;
                    currentUser.dateModified = new Date();
                });
                resolve(currentUser);
            } catch (e) {
                // Something went wrong userRealm write
                reject('Updating user in Realm failed: ', e);
            }
        } else {
            reject('User not logged in');
        }
    });
}

// Change user password
export function changeUserPassword(oldPassword, newPassword) {
    return new Promise((resolve, reject) => {
        // ensure passed user matches logged in user
        if (oldPassword !== newPassword) {
            if (currentUser) {
                // verify old password is good
                Realm.Sync.User.login(AppConstants.AUTH_URL, currentUser.email, oldPassword)
                    .then(user => {
                        fetch(`${AppConstants.AUTH_URL}/auth/password`, {
                            method: 'PUT',
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                Authorization: Realm.Sync.User.current.token
                            },
                            body: JSON.stringify({
                                'user_id': currentUser.id,
                                'data': {
                                    'new_password': newPassword
                                }
                            })
                        }).then((response) => { 
                            resolve('Success');
                        }).catch((error) => {
                            reject('something went wrong with password change: ', error);
                        });
                    }).catch(error => {
                        reject(error.message);
                    });
            } else {
                reject('User not logged in');
            }    
        } else {
            reject('New password cant be the same as the old password');
        }
    });
}

// Signin user by verifying email / password and then load realms
export function signInUser(email, password) {
    return new Promise((resolve, reject) => {
        const userCheck = Realm.Sync.User.current;
        if (!userCheck) {
            // make authentication request
            Realm.Sync.User.login(AppConstants.AUTH_URL, email, password)
                .then(user => {
                    // Had problems with opening as new realm, using this method...not sure if correct...but for now its working
                    // setup realm config
                    const userConfig = {
                        schema: [Person, Park, Attraction, Journal, JournalEntry],
                        sync: {
                            user,
                            url: `${AppConstants.REALM_URL}/${AppConstants.REALM_USER_PATH}`
                        }
                    }
                    // open the realm
                    Realm.open(userConfig).then(realm => {
                        userRealm = realm;

                        // update currentUser object
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
                    url: `${AppConstants.REALM_URL}/${AppConstants.REALM_USER_PATH}`,
                }
            });

            currentUser = userRealm.objectForPrimaryKey('Person', user.identity);
            attractions = userRealm.objects('Attraction');
            parks = userRealm.objects('Park');

            resolve(currentUser);
        } 
        // user doesnt exist
        reject();
    });
}

// Signout User and close out realms
export function signOutUser() {
    return new Promise((resolve, reject) => {
        // hack to help prevent multiple logins by forcing all accounts to logout
        let users = Realm.Sync.User.all;
        for(const key in users) {
            const user = users[key];
            user.logout();
        }                

        currentUser = null;
        userRealm = null;
        parkRealm = null;      
        resolve(currentUser);
        
        reject('Something went wrong with signout');
    });
}

// save photo to camera roll
export function savePhotoToCameraRoll(photo) {
    return new Promise((resolve, reject) => {
        // save photo to camera roll if user setting is true
        if (currentUser.savePhotosToCameraRoll) {
            console.log('1test')
            if (photo) {
                console.log('test')
                CameraRoll.saveToCameraRoll(photo).then(() => {
                    resolve('success');
                }).catch((error) => {
                    console.log(error);
                    reject('Save to camera roll failed: ', error);
                });
            } else {
                reject('No photo to save');
            }
        } else {
            reject('User is set to not save to camera roll');
        }
    });
}

// update userRealm parks from seed realm
export function updateUserParks() {
    return new Promise((resolve, reject) => {
        // check for seed realm
        if (parkRealm) {
            // get parks from seed realm
            const seedParks = parkRealm.objects('Park');
            // horrible hack, delay to give time for parks object to load
            setTimeout(function(){
                    if (seedParks.length > 0) {
                        try {
                            // add/update parks in userRealm
                            userRealm.write(() => {
                                seedParks.forEach((park) => {
                                    const newPark = userRealm.create('Park', {
                                        id: park.id,
                                        name: park.name,
                                        photo: park.photo,
                                        dateCreated: park.dateCreated,
                                        dateModified: park.dateModified,
                                        dateSynced: new Date()
                                    },
                                    true);
                                });
                                // update lastSynced time
                                currentUser.parksLastSynced = new Date();
                            });
                            // update parks object with updated parks list
                            parks = userRealm.objects('Park');

                            resolve('success');
                        } catch (error) {
                            console.log(error);
                            reject('Updating parks in userRealm failed');
                        }
                    } else {
                        reject('Failed to load parks from park realm');
                    }
                },1000
            );
        } else {
            reject('Missing Seed Park Realm');
        }   
    });
}

// update userRealm attractions from seed realm
export function updateUserAttractions() {
    return new Promise((resolve, reject) => {
        // check for seed realm
        if (parkRealm) {
            // get attractions from seed realm
            const seedAttractions = parkRealm.objects('Attraction');
            // horrible hack, delay so attractions object has time to load
            setTimeout(function(){
                    if (seedAttractions.length > 0) {
                        try {
                            // add/update attractions in userRealm
                            userRealm.write(() => {
                                seedAttractions.forEach((attraction) => {
                                    const newAttraction = userRealm.create('Attraction', {
                                        id: attraction.id,
                                        name: attraction.name,
                                        photo: attraction.photo,
                                        park: attraction.park,
                                        description: attraction.description,
                                        heightToRide: attraction.heightToRide,
                                        hasScore: attraction.hasScore,
                                        dateCreated: attraction.dateCreated,
                                        dateModified: attraction.dateModified,
                                        dateSynced: new Date()
                                    },
                                    true);
                                });
                                // update lastSynced time
                                currentUser.attractionsLastSynced = new Date();
                            });
                            // update attractions object with updated attractions list
                            attractions = userRealm.objects('Attraction');
                            
                            resolve('success');
                        } catch (error) {
                            console.log(error);
                            reject('Updating attractions in userRealm failed');
                        }
                    } else {
                        reject('Failed to load attractions from park realm');
                    }
                },1000
            );
        } else {
            reject('Missing Seed Park Realm');
        }
    });
}

// initialize park realm
export function initializeParkRealm() {
    return new Promise((resolve, reject) => {
        try {
            // get current user
            const user = Realm.Sync.User.current;

            if (user) {
                // open seed realm
                parkRealm = new Realm({
                    schema: [Park, Attraction],
                    sync: {
                        user,
                        url: `${AppConstants.REALM_URL}/${AppConstants.REALM_PARKS_PATH}`
                    }
                });
                resolve('success');    
            } else {
                reject('User not logged in')
            }
        } catch (error) {
            console.log(error);
            reject('Failed to open park Realm');
        }
    });
}

function initialSeedFromParkRealm() {
    return function() {
        // seed parks and attractions into new users realm
        initializeParkRealm().then(() => {
            updateUserParks().then(() => {
                console.log('first time park sync success');
            }).catch((error) => {
                console.log(error);
                console.log('error seeding parks');
            });
            updateUserAttractions().then(() => {
                console.log('first time attraction sync success');
            }).catch((error) => {
                console.log(error);
                console.log('error seeding attractions');
            });
        }).catch((error) => {
            console.log(error);
            console.log('error loading seed realm');
        });
    }
}

//// End User Functions


//// Journal Functions

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
                    currentUser.dateModified = new Date();
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
                    // Update dateModified
                    person.dateModified = new Date();
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
    });
}

// Delete Journal and associated journal entries from local Realm
export function deleteJournal(journalId) {
    return new Promise((resolve, reject) => {
        try {
            // get Journal object to delete
            const journal = userRealm.objectForPrimaryKey('Journal', journalId);
            //const journalEntries = journal.journalEntries;
            const person = userRealm.objectForPrimaryKey('Person', journal.owner);

            // if journal etries, build array of them to delete
            //   This is because the delete fails if we try to work in the live journal object
            let entriesToDelete = [];
            if (journal.journalEntries.length > 0) {
                journal.journalEntries.forEach((journalEntry) => {
                    const deleteMe = userRealm.objectForPrimaryKey('JournalEntry', journalEntry.id);
                    entriesToDelete.push(deleteMe);
                });    
            }

            userRealm.write(() => {
                // save length cause it will change as items are deleted
                const itemsLength = journal.journalEntries.length;
                // delete all the journal entries in the array
                if (itemsLength > 0 && entriesToDelete.length > 0) {
                    let itemsDeleted = 0;
                    entriesToDelete.forEach((entry) => {
                        itemsDeleted++
                        // delete entry
                        userRealm.delete(entry);
    
                        if (itemsDeleted === itemsLength) {
                            // all items deleted, delete the journal and update person dateModified
                            userRealm.delete(journal);
                            person.dateModified = new Date();
                        }
                    });                
                } else {
                    // no journal entries to delete, delete the journal and update person dateModified
                    userRealm.delete(journal);
                    person.dateModified = new Date();
                }
            });
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
                            dateCreated: (entryValues.dateCreated !== '') ? entryValues.dateCreated : new Date(),
                            dateModified: new Date(),
                            photo: entryValues.photo,
                            minutesWaited: entryValues.minutesWaited,
                            rating: entryValues.rating,
                            pointsScored: entryValues.pointsScored,
                            usedFastPass: entryValues.usedFastPass,
                            comments: entryValues.comments,
                            owner: currentUser.id  
                            },
                            true
                        );

                        if (newJournalEntry) {
                            // If not edit, add journal entry to journal
                            if (!isEdit) {
                                currentUser.activeJournal.journalEntries.push(newJournalEntry);
                            }
                            // update dateModified
                            currentUser.dateModified = new Date();
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
export function deleteJournalEntry(journalEntryId, activeJournalId) {
    return new Promise((resolve, reject) => {
        try {
            // get active journal object
            const activeJournal = userRealm.objectForPrimaryKey('Journal', activeJournalId);
            // get journal entry object to delete
            const journalEntry = userRealm.objectForPrimaryKey('JournalEntry', journalEntryId);

            if (journalEntry && activeJournal) {
                userRealm.write(() => {
                    // delete journal entry object
                    userRealm.delete(journalEntry);
                    // update dateModified's
                    activeJournal.dateModified = new Date();
                    currentUser.dateModified = new Date();

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

//// End Journal Functions



////   Stats Functions

// total minutes waited - today
export function totalMinutesWaitedToday() {
    let totalMinutes = 0;
    // get current date
    const currentDate = moment(new Date());
    
    if (currentUser) {
        // check for active journal
        if (currentUser.activeJournal) {
            // loop through journal entries
            currentUser.activeJournal.journalEntries.forEach((journalEntry) => {
                // check if entry is from today - format for comparison (so we dont have to worry about time)
                if (moment(journalEntry.dateJournaled).format('MM-DD-YYYY') === currentDate.format('MM-DD-YYYY')) {
                    // add to total minutes return string
                    totalMinutes = totalMinutes + journalEntry.minutesWaited;
                }
            });
        }
        return totalMinutes + '';
    } 
    return '0';
}

// total minutes waited - vacation
export function totalMinutesWaitedVacation() {
    let totalMinutes = 0;
    
    // check for current User
    if (currentUser) {
        // check for active journal
        if (currentUser.activeJournal) {
            // loop through journal entries
            currentUser.activeJournal.journalEntries.forEach((journalEntry) => {
                // add to total minutes return string
                totalMinutes = totalMinutes + journalEntry.minutesWaited;
            });            
        }
        return totalMinutes + '';
    } 
    return '0';
}

// total minutes waited - life time
export function totalMinutesWaitedLife() {
    let totalMinutes = 0;
    
    if (currentUser) {
        // loop through all journals
        currentUser.journals.forEach((journal) => {
            // loop through journal entries
            journal.journalEntries.forEach((journalEntry) => {
                // add to total minutes return string
                totalMinutes = totalMinutes + journalEntry.minutesWaited;
            });
        });
        return totalMinutes + '';
    } 
    return '0';
}

//
// Total Fastpasses
//

// total fastpasses used - today
export function totalFastpassesUsedToday() {
    let totalFastpasses = 0;
    // get current date
    const currentDate = moment(new Date());

    if (currentUser) {
        // check for active journal
        if (currentUser.activeJournal) {
            // loop through journal entries
            currentUser.activeJournal.journalEntries.forEach((journalEntry) => {
                // check if entry is from today - format for comparison (so we dont have to worry about time)
                if (moment(journalEntry.dateJournaled).format('MM-DD-YYYY') === currentDate.format('MM-DD-YYYY')) {
                    // check if fastpass used
                    if (journalEntry.usedFastPass) {
                        // tally ride
                        totalFastpasses = totalFastpasses + 1;
                    } 
                }
            });
        }
        return totalFastpasses + '';
    }
    return '0';
}

// total fastpasses used - vacation
export function totalFastpassesUsedVacation() {
    let totalFastpasses = 0;

    if (currentUser) {
        // check for active journal
        if (currentUser.activeJournal) {
            // loop through journal entries
            currentUser.activeJournal.journalEntries.forEach((journalEntry) => {
                // check if fastpass used
                if (journalEntry.usedFastPass) {
                    // tally ride
                    totalFastpasses = totalFastpasses + 1;
                } 
            });            
        }
        return totalFastpasses + '';
    }
    return '0';
}

// total fastpasses used - life time
export function totalFastpassesUsedLife() {
    let totalFastpasses = 0;

    if (currentUser) {
        // loop through all journals
        currentUser.journals.forEach((journal) => {
            // loop through journal entries
            journal.journalEntries.forEach((journalEntry) => {
                // check if fastpass used
                if (journalEntry.usedFastPass) {
                    // tally ride
                    totalFastpasses = totalFastpasses + 1;
                } 
            });
        });
        return totalFastpasses + '';
    }
    return '0';
}

//
// Total Rides
//

// total rides - today
export function totalRidesToday() {
    let totalRides = 0;
    // get current date
    const currentDate = moment(new Date());

    if (currentUser) {
        // check for active journal
        if (currentUser.activeJournal) {
            // loop through journal entries
            currentUser.activeJournal.journalEntries.forEach((journalEntry) => {
                // check if entry is from today - format for comparison (so we dont have to worry about time)
                if (moment(journalEntry.dateJournaled).format('MM-DD-YYYY') === currentDate.format('MM-DD-YYYY')) {
                    // tally ride
                    totalRides = totalRides + 1;
                }
            });
        }
        return totalRides + '';
    }
    return '0';
}

// total rides - vacation
export function totalRidesVacation() {
    let totalRides = 0;

    if (currentUser) {
        // check for active journal
        if (currentUser.activeJournal) {
            // loop through journal entries
            currentUser.activeJournal.journalEntries.forEach((journalEntry) => {
                // tally ride
                totalRides = totalRides + 1;
            });            
        }
        return totalRides + '';
    }
    return '0';
}

// total rides - life time
export function totalRidesLife() {
    let totalRides = 0;

    if (currentUser) {
        // loop through all journals
        currentUser.journals.forEach((journal) => {
            // loop through journal entries
            journal.journalEntries.forEach((journalEntry) => {
                // tally ride
                totalRides = totalRides + 1;
            });
        });
        return totalRides + '';
    }
    return '0';
}

// most ridden - today
export function mostRiddenToday() {
    if (currentUser) {
        if (currentUser.activeJournal) {
            // set current start date
            let currentDateStart = new Date();
            currentDateStart.setHours(0,0,0,0);
            // set current end date
            let currentDateEnd = new Date();
            currentDateEnd.setHours(23,59,59,59);

            // first build unique list of attractions from active journal journal entries
            let attractionIds = [];
            currentUser.activeJournal.journalEntries.forEach((journalEntry) => {
                if (!attractionIds.includes(journalEntry.attraction.id)) {
                    attractionIds.push(journalEntry.attraction.id);
                }
            });

            // loop through each unique attraction and check if its count is greater than current highest count
            let highestCount = 0;
            let highestAttractionId = '';
            attractionIds.forEach((attraction) => {
                // get number of entries that match attraction id and were journaled today
                let currentCount = currentUser.activeJournal.journalEntries.filtered('attraction.id == $0 AND dateJournaled > $1 AND dateJournaled < $2', attraction, currentDateStart, currentDateEnd).length;

                // check if current count is higher than highest count
                if (currentCount > highestCount) {
                    // greater count of attractions, update objects with new attraction
                    highestCount = currentCount;
                    highestAttractionId = attraction;
                }
            });

            // return first found highest count attraction
            return userRealm.objectForPrimaryKey('Attraction', highestAttractionId);
        }
    }
    // missing user or active journal, return empty string
    return '';
}

// most ridden - vacation
export function mostRiddenVacation() {
    if (currentUser) {
        if (currentUser.activeJournal) {
            // first build unique list of attractions from active journal journal entries
            let attractionIds = [];
            currentUser.activeJournal.journalEntries.forEach((journalEntry) => {
                if (!attractionIds.includes(journalEntry.attraction.id)) {
                    attractionIds.push(journalEntry.attraction.id);
                }
            });

            // loop through each unique attraction
            let highestCount = 0;
            let highestAttractionId = '';
            attractionIds.forEach((attraction) => {
                // get number of entries that match attraction id
                let currentCount = currentUser.activeJournal.journalEntries.filtered('attraction.id == $0', attraction).length;

                // check if current count is higher than highest count
                if (currentCount > highestCount) {
                    // greater count of attractions, update objects with new attraction
                    highestCount = currentCount;
                    highestAttractionId = attraction;
                }
            });

            // return first found highest count attraction
            return userRealm.objectForPrimaryKey('Attraction', highestAttractionId);
        }
    }
    // missing user or active journal, return empty string
    return '';
}

// most ridden - life time
export function mostRiddenLife() {
    if (currentUser) {
        // first build unique list of attractions id's from all journal entries
        let attractionIds = [];
        currentUser.journals.forEach((journal) => {
            journal.journalEntries.forEach((journalEntry) => {
                if (!attractionIds.includes(journalEntry.attraction.id)) {
                    attractionIds.push(journalEntry.attraction.id);
                }
            });
        });

        // get all journal entries
        const allJournalEntries = userRealm.objects('JournalEntry');

        // loop through each unique attraction
        let highestCount = 0;
        let highestAttractionId = '';
        attractionIds.forEach((attraction) => {
            // get number of entries that match attraction id and current user
            let currentCount = allJournalEntries.filtered('attraction.id == $0 AND owner == $1', attraction, currentUser.id).length;

            // check if current count is higher than highest count
            if (currentCount > highestCount) {
                // greater count of attractions, update objects with new attraction
                highestCount = currentCount;
                highestAttractionId = attraction;
            }
        });

        // return first found highest count attraction
        return userRealm.objectForPrimaryKey('Attraction', highestAttractionId);
    }
    // missing user
    return '';
}