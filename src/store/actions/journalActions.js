//import { AsyncStorage } from 'react-native';
import uuid from 'react-native-uuid';
import realm from '../../database/realm';

import {
  GET_JOURNALS,
  CLEAR_JOURNALS,

  JOURNAL_SAVING,
  JOURNAL_LOADING,

  JOURNAL_LOAD_SUCCESS,

  JOURNAL_CREATE_SUCCESS,
  JOURNAL_ENTRY_CREATE_SUCCESS,

  JOURNAL_DELETE_SUCCESS,
  JOURNAL_ENTRY_DELETE_SUCCESS,

  JOURNAL_ACTION_FAILED
} from './actionTypes'

// Journal Actions

// Get Journals by userId
export function getJournals(userId) {
  return (dispatch) => {
    if(userId) {
      const journals = realm.objects('Journal').filtered('user.id = $0', userId);
      dispatch({
        type: GET_JOURNALS,
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
    type: CLEAR_JOURNALS
  }
}

// Get Journal by Id
export function getJournal(journalId) {
  return (dispatch) => {
    if (journalId) {
      const journal = realm.objects('Journal').filtered('id = $0', journalId);
      if (journal) {
        dispatch({
          type: JOURNAL_LOAD_SUCCESS,
          journal: journal[0]
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

// Create Journal in local Realm
export function createJournal(journalName, userId) {
  return (dispatch) => {
    try {
      realm.write(() => {
        const journal = realm.create('Journal', {
          id: uuid.v4(),
          name: journalName,
          dateCreated: Date(),
          dateModified: Date(),
          user: {
            id: userId
          }
        },
        true
        );
        if (journal) {
          dispatch({
            type: JOURNAL_CREATE_SUCCESS,
            journal: journal
          });  
        }
      });
    } catch (error) {
      dispatch({
        type: JOURNAL_ACTION_FAILED,
        error: error
      });  
    }
  }
}

// Delete Journal from local Realm
export function deleteJournal(journalId) {
  return (dispatch) => {
    try {
      realm.write(() => {
        // get journal object to delete
        const journal = realm.objects('Journal').filtered('id = $0', journalId);
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
export function createJournalEntry(journalId, journalEntry) {
  return (dispatch) => {
    try {
      realm.write(() => {
        const journalEntry = realm.create('JournalEntry', {
          id: uuid.v4(),
          park: { id: journalEntry.parkId },
          attraction: { id: journalEntry.attractionId },
          dateJournaled: journalEntry.dateJournaled,
          dateCreated: Date(),
          dateModified: Date(),
          minutesWaited: journalEntry.minutesWaited,
          rating: journalEntry.rating,
          pointsScored: journalEntry.pointsScored,
          usedFastPass: journalEntry.usedFastPass,
          comments: journalEntry.comments
        });
        if (journalEntry) {
          dispatch({
            type: JOURNAL_ENTRY_CREATE_SUCCESS,
          });  
        }
      });
    } catch (error) {
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
      realm.write(() => {
        // get journal entry object to delete
        const journalEntry = realm.objects('JournalEntry').filtered('id = $0', journalEntryId);
        // delete journal entry object
        realm.delete(journalEntry);

        dispatch({
          type: JOURNAL_ENTRY_DELETE_SUCCESS
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





// // Local Storage Methods - Dont think we need

// // Save item to local storage
// const _saveItem = async (key, value) => {
//   try {
//     await AsyncStorage.setItem(key, value);
//   } catch (error) {
//     throw error;
//   }
// };

// // Get item from local storage
// const _getItem = async (key) => {
//   try {
//     return await AsyncStorage.getItem(key);
//   } catch (error) {
//     throw error;
//   }
// };

// // Remove item from local storage
// const _removeItem = async (key) => {
//   try {
//     return await AsyncStorage.removeItem(key);
//   } catch (error) {
//     throw error;
//   }
// };
