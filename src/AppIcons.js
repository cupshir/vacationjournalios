import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const icons = {
    "home": [Ionicons, 'ios-home-outline', 40, '#000000'],
    "home-selected": [Ionicons, 'ios-home', 40, '#000000'],
    "person": [Ionicons, 'ios-person-outline', 40, '#000000'],
    "person-selected": [Ionicons, 'ios-person', 40, '#000000'],
    "journal": [Ionicons, 'ios-book-outline', 40, '#000000'],
    "journal-selected": [Ionicons, 'ios-book', 40, '#000000'],
    "add": [Ionicons, 'ios-add', 40, '#000000'],
    "sync": [Ionicons, 'ios-sync', 40, '#000000'],
    "checkmark": [Ionicons, 'ios-checkmark-circle-outline', 40, '#000000'],
    "parks": [MaterialCommunityIcons, 'map-marker-outline', 40, '#000000'],
    "parks-selected": [MaterialCommunityIcons, 'map-marker', 40, '#000000']
};

let IconsMap = {};
let IconsLoaded = new Promise((resolve, reject) => {
    new Promise.all(
        Object.keys(icons).map(iconName =>
            icons[iconName][0].getImageSource(
                icons[iconName][1],
                icons[iconName][2],
                icons[iconName][3],
                icons[iconName][4],
                icons[iconName][5],
                icons[iconName][6],
                icons[iconName][7],
                icons[iconName][8],
                icons[iconName][9],
                icons[iconName][10],
                icons[iconName][11]
            ))
        ).then(sources => {
            Object.keys(icons)
                .forEach((iconName, idx) => IconsMap[iconName] = sources[idx]);
            resolve(true);
        })
});

export {
    IconsMap,
    IconsLoaded
};