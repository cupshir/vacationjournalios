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
					navBarBackgroundColor: '#F9F9F9'
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
					navBarBackgroundColor: '#F9F9F9'
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
					navBarBackgroundColor: '#F9F9F9'
				}
			}
		],
		tabsStyle: {
			tabBarButtonColor: 'black',
			tabBarSelectedButtonColor: '#0080FF',
			tabBarBackgroundColor: '#F9F9F9'
		}
	});
})


	






