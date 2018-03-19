/* eslint-disable no-unused-vars */
import React from 'react';
import { Navigation } from 'react-native-navigation';
import { Provider } from 'react-redux';
import { registerScreens } from './screens';

// Initialize Redux Store
import configureStore from './store/configureStore';
const store = configureStore();


// Register screens passing store and navigate to dashboardee
registerScreens(store, Provider);

Navigation.startTabBasedApp({
	tabs: [
		{
			label: 'Home',
			screen: 'vacationjournalios.Dashboard',
			title: 'Dashboard',
			navigatorStyle: {
				largeTitle: true
			}
		},
		{
			label: 'Profile',
			screen: 'vacationjournalios.Profile',
			title: 'Profile',
			navigatorStyle: {
				largeTitle: true
			}
		},
		{
			label: 'Journal',
			screen: 'vacationjournalios.Journal',
			title: 'Select A Journal',
			navigatorStyle: {
				largeTitle: true,
				navBarNoBorder: true
			}
		}
	],
	tabsStyle: {
		tabBarButtonColor: 'black',
		tabBarSelectedButtonColor: 'black',
		tabBarBackgroundColor: 'white',
		tabBarHideShadow:  true
	}
});
