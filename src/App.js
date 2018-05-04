/* eslint-disable no-unused-vars */
import React from 'react';

import { Navigation } from 'react-native-navigation';

// import icons
import { 
	IconsMap,
	IconsLoaded
} from './AppIcons';

import { registerScreens } from './screens';

// Register screens passing store
registerScreens();

// After icon map has loaded, start app
IconsLoaded.then(() => {

	Navigation.startTabBasedApp({
		
		tabs: [
			{
				label: 'Home',
				screen: 'vacationjournalios.Dashboard',
				title: 'Dashboard',
				icon: IconsMap['home'],
				selectedIcon: IconsMap['home-selected'],
				navigatorStyle: {
					largeTitle: true,
					navBarBackgroundColor: '#252525',
					navBarTextColor: '#FFFFFF',
					navBarButtonColor: '#FFFFFF',
					statusBarTextColorScheme: 'light',
					screenBackgroundColor: '#151515'
				}
			},
			{
				label: 'Journal',
				screen: 'vacationjournalios.Journal',
				title: 'Select A Journal',
				icon: IconsMap['journal'],
				selectedIcon: IconsMap['journal-selected'],
				navigatorStyle: {
					largeTitle: true,
					navBarNoBorder: true,
					navBarBackgroundColor: '#252525',
					navBarTextColor: '#FFFFFF',
					navBarButtonColor: '#FFFFFF',
					statusBarTextColorScheme: 'light',
					screenBackgroundColor: '#151515'
				}
			},
			{
				label: 'Profile',
				screen: 'vacationjournalios.Profile',
				title: 'Profile',
				icon: IconsMap['person'],
				selectedIcon: IconsMap['person-selected'],
				navigatorStyle: {
					largeTitle: true,
					navBarBackgroundColor: '#252525',
					navBarTextColor: '#FFFFFF',
					navBarButtonColor: '#FFFFFF',
					statusBarTextColorScheme: 'light',
					screenBackgroundColor: '#151515'
				}
			},
			{
				label: 'Parks',
				screen: 'vacationjournalios.ParkList',
				title: 'Parks',
				icon: IconsMap['parks'],
				selectedIcon: IconsMap['parks-selected'],
				navigatorStyle: {
					largeTitle: true,
					navBarNoBorder: true,
					navBarBackgroundColor: '#252525',
					navBarTextColor: '#FFFFFF',
					navBarButtonColor: '#FFFFFF',
					statusBarTextColorScheme: 'light',
					screenBackgroundColor: '#151515'
				}
			}
		],
		tabsStyle: {
			tabBarButtonColor: '#999999',
			tabBarSelectedButtonColor: '#FFFFFF',
			tabBarBackgroundColor: '#050505',
		},
		appStyle: {
			orientation: 'portrait'
		}
	});
})


	






