import { Navigation } from 'react-native-navigation';

// pre-gate
import Login from './Login';
import SignUp from './SignUp';

// post-gate
import JournalEntry from './JournalEntry';


// register all screens of the app (including internal ones)
export function registerScreens() {
  // pre-gate
  Navigation.registerComponent('vacationjournalios.Login', () => Login);
  Navigation.registerComponent('vacationjournalios.SignUp', () => SignUp);

  // post-gate
  Navigation.registerComponent('vacationjournalios.JournalEntry', () => JournalEntry);
}