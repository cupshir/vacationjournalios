/* eslint-disable import/prefer-default-export */
import { Navigation } from 'react-native-navigation';

import Dashboard from './screens/Dashboard';

import Profile from './screens/User/Profile';
import SignIn from './screens/User/SignIn';
import Register from './screens/User/Register';

import EditJournal from './screens/Journal/EditJournal';
import Journal from './screens/Journal/Journal';
import JournalList from './screens/Journal/JournalList';
import EditJournalEntry from './screens/Journal/EditJournalEntry';

import DrawerMenu from './screens/DrawerMenu';


import LoadingModal from './screens/LoadingModal';


// register all screens of the app (including internal ones)
export function registerScreens() {

  Navigation.registerComponent('vacationjournalios.Dashboard', () => Dashboard);
  Navigation.registerComponent('vacationjournalios.Profile', () => Profile);

  Navigation.registerComponent('vacationjournalios.Journal', () => Journal);
  Navigation.registerComponent('vacationjournalios.JournalList', () => JournalList);
  Navigation.registerComponent('vacationjournalios.EditJournal', () => EditJournal);
  Navigation.registerComponent('vacationjournalios.EditJournalEntry', () => EditJournalEntry);

  Navigation.registerComponent('vacationjournalios.DrawerMenu', () => DrawerMenu);
  
  Navigation.registerComponent('vacationjournalios.SignIn', () => SignIn);
  Navigation.registerComponent('vacationjournalios.Register', () => Register);

  Navigation.registerComponent('vacationjournalios.LoadingModal', () => LoadingModal);

}
