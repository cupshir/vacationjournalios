/* eslint-disable import/prefer-default-export */
import { Navigation } from 'react-native-navigation';

import Dashboard from './screens/Dashboard';

import Profile from './screens/User/Profile';
import SignIn from './screens/User/SignIn';
import SignUp from './screens/User/SignUp';

import CreateJournal from './screens/Journal/CreateJournal';
import Journal from './screens/Journal/Journal';
import JournalList from './screens/Journal/JournalList';
import CreateJournalEntry from './screens/Journal/CreateJournalEntry';

import DrawerMenu from './screens/DrawerMenu';


import LoadingModal from './screens/LoadingModal';


// register all screens of the app (including internal ones)
export function registerScreens(store, Provider) {

  Navigation.registerComponent('vacationjournalios.Dashboard', () => Dashboard, store, Provider);
  Navigation.registerComponent('vacationjournalios.Profile', () => Profile, store, Provider);

  Navigation.registerComponent('vacationjournalios.Journal', () => Journal, store, Provider);
  Navigation.registerComponent('vacationjournalios.JournalList', () => JournalList, store, Provider);
  Navigation.registerComponent('vacationjournalios.CreateJournal', () => CreateJournal, store, Provider);
  Navigation.registerComponent('vacationjournalios.CreateJournalEntry', () => CreateJournalEntry, store, Provider);

  Navigation.registerComponent('vacationjournalios.DrawerMenu', () => DrawerMenu, store, Provider);
  
  Navigation.registerComponent('vacationjournalios.SignIn', () => SignIn, store, Provider);
  Navigation.registerComponent('vacationjournalios.SignUp', () => SignUp, store, Provider);

  Navigation.registerComponent('vacationjournalios.LoadingModal', () => LoadingModal, store, Provider);

}
