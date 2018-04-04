import React, { Component } from "react";
import { 
    View,
    Text,
    Button,
    FlatList,
    TouchableOpacity,
    SectionList, 
    AlertIOS, 
    StyleSheet 
} from "react-native";
import {
    SearchBar
} from 'react-native-elements';
import { 
    IconsMap,
    IconsLoaded
} from '../../AppIcons';
import moment from 'moment';

import {
    currentUser,
    deleteJournalEntry
} from '../../realm/userService';

import ListItemJournalEntry from "../../components/ListItemJournalEntry";
import SectionHeader from "../../components/SectionHeader";
import LoadingMickey from '../../components/LoadingMickey';

class Journal extends Component {
    static navigatorButtons = {
        leftButtons: [
            {
                title: 'Journals',
                id: 'journals'
            }
        ]
    };

    constructor(props) {
        super(props);
        this.state = {
            currentUser: null,
            isLoading: true,
            filteredEntries: null
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) {
        if (event.id === 'willAppear') {
            this.updateCurrentUserInState(currentUser);
        }
        if (event.type == 'NavBarButtonPress') {
            if (event.id === 'journals') {
                this.onJournalListPress();
            }
            if (event.id === 'addEntry') {
                if (this.state.currentUser !== null) {
                    if (this.state.currentUser.activeJournal !== null) {
                        this.props.navigator.push({
                            screen: 'vacationjournalios.EditJournalEntry',
                            title: 'Add Journal Entry',
                            animated: true,
                            animationType: 'fade'
                        });
                    } else {
                        AlertIOS.alert('Please select/create a journal');
                    }
                }
            }
        }
    }

    componentDidUpdate() {
        this.props.navigator.setTitle({
            title: ((this.state.currentUser !== null && this.state.currentUser.activeJournal !== null) ? this.state.currentUser.activeJournal.name : 'Select A Journal')
        });
    }

    // Hack to make nav bar look like native IOS with search under title without border
    componentDidMount() {
        this.props.navigator.setStyle({
            navBarNoBorder: true
        });

        IconsLoaded.then(() => {
            this.props.navigator.setButtons({
            rightButtons: [
                {
                    id: 'addEntry',
                    icon: IconsMap['add']
                }
            ]
            });
        });

        // Update screen title
        this.props.navigator.setTitle({
            title: ((this.state.currentUser !== null && this.state.currentUser.activeJournal !== null) ? this.state.currentUser.activeJournal.name : 'Select A Journal')
        });
    }

    updateCurrentUserInState = (user) => {
        if (user) {
            this.setState({
                ...this.state,
                currentUser: user,
                filteredEntries: null,
                isLoading: false
            });            
        } else {
            this.setState({
                ...this.state,
                currentUser: null,
                filteredEntries: null,
                isLoading: false
            });
        }
    }

    // lauch sign in modal
    onSignInPress = () => {
        this.props.navigator.showModal({
            screen: 'vacationjournalios.SignIn',
            title: 'Sign In',
            animated: true
        });
    }

    // navigate to journal list screen
    onJournalListPress = () => {
        this.props.navigator.push({
            screen: 'vacationjournalios.JournalList',
            title: 'Journals',
            backButtonTitle: '',
            animated: true,
            animationType: 'fade'
        });
    }

    // row on press event
    onPress = (id) => {

    }

    // row edit press event
    onEditPress = (id) => {
        this.props.navigator.push({
            screen: 'vacationjournalios.EditJournalEntry',
            title: 'Edit Journal Entry',
            passProps: {
                journalEntryId: id
            },
            animated: true,
            animationType: 'fade'
        });
    }

    // row delete press event
    onDeletePress = (id) => {
        // display confirm prompt, user must type CONFIRM to delete
        AlertIOS.prompt(
            'Confirm Delete',
            'Type CONFIRM (all caps) to proceed with deletion',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    onPress: (enteredText) => this.handleDeleteJournalEntry(id, enteredText)
                }
            ]
        );
    }

    // handle delete journal entry
    handleDeleteJournalEntry = (id, enteredText) => {
        // verify typed text is CONFIRM
        if(enteredText === 'CONFIRM' ) {
            this.setState({
                ...this.state,
                isLoading: true
            });
            // match, delete journal by id
            deleteJournalEntry(id).then(() => {
                // success - stop animation
                this.setState({
                    ...this.state,
                    isLoading: false
                });
            }).catch((error) => {
                // failed - stop animiation
                this.setState({
                    ...this.state,
                    isLoading: false
                });
            });
        } else {
            // dont match, display alert and do nothing
            AlertIOS.alert('Incorrect CONFIRM text entered. Journal entry not deleted!')
        }
    }

    // handle search input
    handleSearch = (searchInput) => {
        // Only process search if active journal is present and it has journal entries
        if (this.state.currentUser.activeJournal !== null && this.state.currentUser.activeJournal.journalEntries.length > 0) {
            // Get all journal entries
            const unFilteredEntries = this.state.currentUser.activeJournal.journalEntries;

            // if search input contains text, filter by that text
            if (searchInput !== '') {      
                newFilteredEntries = unFilteredEntries.filtered('attraction.name CONTAINS[c] $0 || park.name CONTAINS[c] $0', searchInput);
            } else {
                // search input empty, return all entries
                newFilteredEntries = unFilteredEntries;
            }

            // Save the updated filtered into state
            this.setState({
                ...this.state,
                filteredEntries: newFilteredEntries
            });
        }
    }

    // render row item
    renderItem = ({ item }) => (
        <ListItemJournalEntry
            item={item}
            onPress={this.onPress}
            onEditPress={this.onEditPress}
            onDeletePress={this.onDeletePress} />
    );

    // render Header row
    renderSectionHeader = ({ section }) => (
        <SectionHeader
            title={section.title} />
    );

    // Render Search Input (placed here to keep view below easier to read)
    renderSearchInput = () => {
        return (
            <SearchBar
                platform='ios'
                lightTheme
                containerStyle={styles.searchContainer}
                inputStyle={styles.searchInput}
                onChangeText={this.handleSearch}
                icon={{ style: { marginLeft: 4 } }}
                clearIcon={{ name: 'close' }}
                placeholder='Search' />
        );
    }

    // return list of unique dates in journal entries
    getListOfUniqueDates = (journalEntries) => {
        let returnList = [];

        // loop through each entry and if dateJournaled does not exist in return array add it
        journalEntries.forEach(entry => {
            const date = moment(entry.dateJournaled).format("MM/DD/YYYY");
            if (!returnList.includes(date)) {
                const dateObject = [ date, entry.dateJournaled ];
                returnList.push(date);
            }
        });

        // return the list sorted descending
        return returnList.sort().reverse();
    }

    // split journal entries array into sections
    splitJournalEntriesIntoSections = (journalEntries) => {
        // Get section headers
        const sectionHeaders = this.getListOfUniqueDates(journalEntries);

        let returnArray = [];

        // for each section header create a filtered array
        for (i = 0; i < sectionHeaders.length; i++) {
            // return objects
            let array = [];
            
            // add title
            const title = sectionHeaders[i];
            array.push(title);

            // build data
            // start date for filter...midnight of date. x/x/xxxx 00:00
            const dateStart = new Date(sectionHeaders[i]);
            // create end date, which is next day with time of midnight
            const dateEnd = new Date(sectionHeaders[i]);
            dateEnd.setDate(dateEnd.getDate() + 1);

            // Filter journal entries using start time and end time of current section
            const data = journalEntries.filtered('dateJournaled >= $0 && dateJournaled < $1', dateStart, dateEnd);

            // add data
            array.push(data);

            // add array to return array
            returnArray.push(array);
        }

        return returnArray;
    }

    renderJournalEntries = (journalEntries) => {
        // build search input
        const searchInput = this.renderSearchInput();
        
        return (
            <View>
                {searchInput}
                <View style={styles.listContainer}>
                    <SectionList
                        sections={journalEntries.map(function(object, i) {
                                return { title: object[0], data: object[1] };
                            })}
                        renderItem={this.renderItem}
                        renderSectionHeader={this.renderSectionHeader}
                        keyExtractor={ (item, index) => index } />
                </View>
            </View>
        );     
    }

    render() {
        // Loading Graphic
        if (this.state.isLoading === true) {
            return (
                <View style={styles.container}>
                    <LoadingMickey />
                </View>
            );
        }

        // If no current User, display Sign In button
        if (this.state.currentUser === null) {
            return (
                <View style={styles.container}>
                    <TouchableOpacity style={styles.button} onPress={() => this.onSignInPress()}>
                        <Text>Sign In</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // If no active Journal display Select a journal
        if (this.state.currentUser !== null && this.state.currentUser.activeJournal === null) {
            return (
                <View style={styles.container}>
                    <Button title='Select A Journal' onPress={this.onJournalListPress} />
                </View>
            );
        }
        
        let journalEntryList = null;

        if (this.state.currentUser !== null) {
            if (this.state.currentUser.activeJournal !== null) {
                // load journalEntries from state if filteredEntries in state is null (this is so something loads when view first renders) 
                const filteredEntries = this.state.filteredEntries !== null ? this.state.filteredEntries : this.state.currentUser.activeJournal.journalEntries;
    
                // Split filtered array into sections array
                const journalEntriesBySection = this.splitJournalEntriesIntoSections(filteredEntries);
    
                // render list
                journalEntryList = this.renderJournalEntries(journalEntriesBySection);
            }          
        }

        return (
            <View>
                {journalEntryList}
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    searchContainer: {
        backgroundColor: 'white',
        alignSelf: 'stretch',
        borderTopColor: 'white',
        marginTop: -10
    },
    listContainer: {
        marginBottom: 75
    },
    searchInput: {
        backgroundColor: '#EEEEEE',
        color: 'black',
        borderRadius: 5,
        marginLeft: 15,
        marginRight: 15
    },
    button: {
        width: 100,
        height: 50,
        borderWidth: 1,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10
    }
});

export default Journal;