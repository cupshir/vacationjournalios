import request from 'superagent';
import { AsyncStorage } from 'react-native';
import { Navigation } from 'react-native-navigation';
import realm from '../../database/realm';

import {
    API_URL,

    AUTHENTICATION_START,
    AUTHENTICATION_SUCCESS,
    AUTHENTICATION_ERROR,
    AUTHENTICATION_ERROR_CLEAR,

    SIGN_OUT_USER
} from './actionTypes'

import * as journalActions from './journalActions';

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
            realm.create('User', {
                id: response.body.data.id,
                firstName: response.body.data.firstname,
                lastName: response.body.data.lastname,
                email: response.body.data.email,
                jwtToken: response.body.token
              },
              true
            );
          });
          // authenticate user in redux
          dispatch(authenticateUserFromAPI(response.body));

          // load users journals into redux store
          dispatch(journalActions.getJournals(response.body.data.id));
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
            realm.create('User', {
                id: response.body.data.id,
                firstName: response.body.data.firstname,
                lastName: response.body.data.lastname,
                email: response.body.data.email,
                jwtToken: response.body.token
              },
              true
            );
          });
          // authenticate user in Redux store
          dispatch(authenticateUserFromAPI(response.body));
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
          dispatch(authenticateUserFromRealm(user));

          // load users journals into redux store
          dispatch(journalActions.getJournals(user.id));
      })
      .catch(error => {
        console.log('error: ', error);
      });
    }
  }

  // Authenticate user using realm object
  export function authenticateUserFromRealm(user) {
    return {
      type: AUTHENTICATION_SUCCESS,
      userid: user.id,
      email: user.email,
      firstname: user.firstName,
      lastname: user.lastName,
      token: user.jwtToken
    }
  }
  
  // Authenticate user using API response
  export function authenticateUserFromAPI(response) {
    Navigation.dismissModal();
    return {
        type: AUTHENTICATION_SUCCESS,
        userid: response.data.id,
        email: response.data.email,
        firstname: response.data.firstname,
        lastname: response.data.lastname,
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
      dispatch(journalActions.clearJournals());
      dispatch({
        type: SIGN_OUT_USER
      }) 
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
