import { AsyncStorage } from 'react-native';
import uuid from 'react-native-uuid';
import realm from '../../database/realm';

import {
    GET_JOURNALS,
    CLEAR_JOURNALS,

    JOURNAL_SAVING,
    JOURNAL_LOADING,

    JOURNAL_ACTION_FAILED,

    JOURNAL_CREATE_SUCCESS,

    JOURNAL_DELETE_SUCCESS,

    JOURNAL_SET_SELECTED

} from './actionTypes'

// Journal Actions

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

// Set selected JournalId and load journal in Redux Store
export function setSelectedJournalId(journalId) {
  return (dispatch) => {
    if (journalId) {
      const journal = realm.objects('Journal').filtered('id = $0', journalId);
      if (journal) {
        dispatch({
          type: JOURNAL_SET_SELECTED,
          journal: journal[0],
          journalId: journalId
        })
      }
    }
  }
}

// Save Journal Entry to Realm
export function saveJournalEntry(journalId, entry) {

}

// Get Journals by userId
export function getJournals(userId) {
  return (dispatch) => {
    if(userId) {
      const journals = realm.objects('Journal').filtered('user.id = $0', userId);
      dispatch({
        type: GET_JOURNALS,
        journals: journals
      });  
    }
  };
}

// Clear journals from redux store
export function clearJournals() {
  return {
    type: CLEAR_JOURNALS
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
  