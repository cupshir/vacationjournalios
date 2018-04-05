import React, { Component } from 'react';
import uuid from 'react-native-uuid';
import {
    AlertIOS,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { 
    SearchBar,
    Text
} from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-datepicker';

import {
    currentUser,
    parkRealm,
    createJournalEntry,
    getJournalEntryById
} from '../../realm/userService';

import LoadingMickey from '../../components/LoadingMickey';
import CameraModal from "../../components/CameraModal";
import ListItem from '../../components/ListItem';
import ListItemAttraction from '../../components/ListItemAttraction';

class EditJournalEntry extends Component {
    static navigatorButtons = {
        rightButtons: [
          {
              title: 'Done',
              id: 'done'
          }
        ]
    };

    constructor(props) {
        super(props);
        this.state = {
            parks: currentUser.activeJournal.parks,
            attractions: parkRealm.objects('Attraction'),
            selectedPark: {
                parkId: '',
                parkName: '',
            },
            selectedAttraction: {
                attractionId: '',
                attractionName: '',
                attractionHasScore: false,
            },
            formValues: {
                journalEntryId: '',
                parkId: '',
                attractionId: '',
                photo: '',
                dateJournaled: new Date(),
                minutesWaited: '',
                usedFastPass: false,
                rating: '',
                pointsScored: '',
                comments: ''
            },
            formErrors: {
                parkId: '',
                attractionId: '',
                dateJournaled: '',
                rating: '',
                minutesWaited: ''
            },
            filteredAttractions: null,
            cameraModalVisible: false,
            parkModalVisible: false,
            attractionModalVisible: false,
            renderAttractions: false,
            submitErrorMessage: null,
            isEdit: false,
            isLoading: true
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) { 
        if (event.id === 'willAppear') {
            if (this.props.journalEntryId) {
                // get journal entry
                getJournalEntryById(this.props.journalEntryId).then((journalEntry) => {
                    // success - pass journal entry to edit screen
                    this.loadEntryIntoState(journalEntry);
                }).catch((error) => {
                    // failed
                    console.log('error: ', error);
                })
            } else {
                this.setState({
                    ...this.state,
                    isLoading: false
                })
            }
        }
        if (event.type == 'NavBarButtonPress') {
            if (event.id == 'done') {
                this.handleDonePress();
            }
        }
    }

    componentDidMount() {
        this.props.navigator.setStyle({
            navBarNoBorder: false
        });
    }

    // populate state with existing data
    loadEntryIntoState(journalEntry) {
        if (journalEntry) {
            this.setState({
                ...this.state,
                selectedPark: {
                    parkId: journalEntry.park.id,
                    parkName: journalEntry.park.name,
                },
                selectedAttraction: {
                    attractionId: journalEntry.attraction.id,
                    attractionName: journalEntry.attraction.name,
                    attractionHasScore: journalEntry.attraction.hasScore ? true : false,
                },
                formValues: {
                    journalEntryId: journalEntry.id,
                    parkId: journalEntry.park.id,
                    attractionId: journalEntry.attraction.id,
                    photo: journalEntry.photo ? journalEntry.photo : '',
                    dateJournaled: journalEntry.dateJournaled,
                    minutesWaited: journalEntry.minutesWaited.toString(),
                    usedFastPass: journalEntry.usedFastPass ? true : false,
                    rating: journalEntry.rating.toString(),
                    pointsScored: journalEntry.pointsScored ? journalEntry.pointsScored.toString() : '',
                    comments: journalEntry.comments ? journalEntry.comments :  ''
                },
                renderAttractions: true,
                isEdit: true,
                isLoading: false
            });

        }
    }

    // set park modal visible
    setParkModalVisible(visible) {
        this.setState({
            ...this.state,
            parkModalVisible: visible
        });
    }

    // set attraction modal visible
    setAttractionModalVisible(visible) {
        this.setState({
            ...this.state,
            attractionModalVisible: visible
        });
    }

    // toggle camera modal
    toggleCameraModal = () => {
        this.setState({
            ...this.state,
            cameraModalVisible: !this.state.cameraModalVisible
        });
    }

    // save photo to state
    savePhoto = (photo) => {
        this.setState({
            ...this.state,
            formValues: {
                ...this.state.formValues,
                photo: photo
            },
            cameraModalVisible: false,
        });
    }

    // row delete press event
    onPhotoDeletePress = () => {
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
                    onPress: (enteredText) => this.handleDeletePhoto(enteredText)
                }
            ]
        );
    }

    handleDeletePhoto = (enteredText) => {
        if (enteredText === 'CONFIRM') {
            this.setState({
                formValues: {
                    ...this.state.formValues,
                    photo: ''
                }
            });
        } else {
            AlertIOS.alert('Incorrect CONFIRM text entered. Photo not deleted!')
        }

    }

    // handle minutes waited change
    handleMinutesWaitedChange = (value) => {
        this.setState({
            formValues: {
                ...this.state.formValues, 
                minutesWaited: value.replace(/[^0-9]/g, '')
            }
        });
    }

    // handle rating change
    handleRatingChange = (value) => {
        this.setState({
            formValues: {
                ...this.state.formValues, 
                rating: value.replace(/[^1-5]/g, '')
            }
        });
    }

    // handle comments change
    handleCommentsChange = (value) => {
        this.setState({
            formValues: {
                ...this.state.formValues,
                comments: value
            }
        })
    }

    // handle fastpass change
    handleFastpassChange = () => {
        this.setState({
            formValues: {
                ...this.state.formValues,
                usedFastPass: !this.state.formValues.usedFastPass
            }
        });
    }

    // handle points change
    handlePointsScoredChange = (value) => {
        this.setState({
            formValues: {
                ...this.state.formValues,
                pointsScored: value.replace(/[^0-9]/g, '')
            }
        });
    }

    // handle park change
    //  selectedAttraction is cleared out to reset attraction picker when park changes 
    //      (this forces attractions to reload for newly selected park)
    handleParkChange = (parkId, parkName) => {
        this.setState({
            selectedPark: {
                parkId: parkId,
                parkName: parkName
            },
            formValues: {
                ...this.state.formValues,
                parkId: parkId,
                attractionId: ''
            },
            selectedAttraction: {
                attractionId: '',
                attractionName: '',
                attractionHasScore: false
            },
            filteredAttractions: null,
            renderAttractions: true,
            parkModalVisible: false
        });
    }

    // handle attraction change
    handleAttractionChange = (attraction) => {
        this.setState({ 
            selectedAttraction: {
                attractionId: attraction.id,
                attractionName: attraction.name,
                attractionHasScore: (attraction.hasscore == true)
            },
            formValues: {
                ...this.state.formValues,
                attractionId: attraction.id
            },
            filteredAttractions: null,
            attractionModalVisible: false
        });
    }

    // handle date change
    handleDateJournaledChange = (date) => {
        this.setState({
            formValues: {
                ...this.state.formValues,
                dateJournaled: date
            }
        })
    }

    handleSearch = (searchInput) => {
        // create object from attractions filtered by selectedpark
        const unFilteredAttractions = this.state.attractions.filter((attraction) => {
            return (attraction.park.id === this.state.selectedPark.parkId)
        });

        // create object to filter
        let filteredAttractions = unFilteredAttractions;
    
        // if search input contains text, filter by that text
        if (searchInput !== '') {      
          filteredAttractions = unFilteredAttractions.filter((attraction) => {
              return (attraction.name.toLowerCase().includes(searchInput.toLowerCase()))
          });
        }
    
        // Save the updated filtered into state
        this.setState({
            ...this.state,
            filteredAttractions: filteredAttractions
        });
    }

    // handle save press
    handleDonePress = () => {
        // Check if form is ready to submit
        const ready = this.readyForSubmit(this.state.formValues)

        if (ready) {
            // scrub values (changes strings to numbers, etc)
            const submitValues = this.prepareValuesForDB(this.state.formValues);
            // Get Park
            const park = parkRealm.objectForPrimaryKey('Park', submitValues.parkId);
            // Get Attraction
            const attraction = parkRealm.objectForPrimaryKey('Attraction', submitValues.attractionId);

            if (park && attraction) {
                // start loading animation
                this.setState({
                    ...this.state,
                    isLoading: true
                });
                // save journal entry to realm db
                createJournalEntry(park, attraction, submitValues, this.state.isEdit).then(() => {
                    // success - stop loading animation and pop back to journal
                    this.setState({
                        ...this.state,
                        isLoading: false
                    });
                    this.props.navigator.popToRoot();
                }).catch((error) => {
                    //  error - stop loading animation
                    this.setState({
                        ...this.state,
                        submitErrorMessage: error,
                        isLoading: false
                    })
                });

            } else {
                AlertIOS.alert('Failed to get park or attraction from realm')
            }
            
        
        } else {
            // TODO: better message
            AlertIOS.alert('not ready to submit')
        }
    }

    // Format values as needed by database
    // IE Some values exist as strings in form for display purposes and need to be converted to numbers
    prepareValuesForDB = (values) => {
        // Create return object
        let returnValues = {
            journalEntryId: '',
            parkId: '',
            attractionId: '',
            photo: '',
            minutesWaited: '',
            pointsScored: '',
            rating: '',
            usedFastPass: '',
            dateJournaled: '',
            comments: ''
        };

        // Use existing journal ID or create new UUID for new journal entry
        returnValues.journalEntryId = (values.journalEntryId !== '') ? values.journalEntryId : uuid.v4();

        // If minutes waited is '' update to 0 else pass value
        returnValues.minutesWaited = (values.minutesWaited === '') ? 0 : parseInt(values.minutesWaited, 10); 

        // if pointsscored is '' update to -1 else pass value
        // -1 is used for attactions that dont keep score (realm db doesnt allow nulls)
        returnValues.pointsScored = (values.pointsScored === '') ? -1 : parseInt(values.pointsScored, 10);

        // add remaining fields (these are already formated correctly)
        returnValues.parkId = values.parkId;
        returnValues.attractionId = values.attractionId;
        returnValues.photo = values.photo;
        returnValues.rating = parseInt(values.rating, 10);
        returnValues.usedFastPass = values.usedFastPass;
        returnValues.dateJournaled = new Date(values.dateJournaled);
        returnValues.comments = values.comments;

        return returnValues;
    }
    
    // Check if form is ready for submit and return true/false
    readyForSubmit = (values) => {
        let ready = true;

        // Check that required formValues have a value, if value missing return false
        if (values.parkId === '') {
            return false;
        }
        if (values.attractionId === '') {
            return false;
        }
        if (values.rating === 0) {
            return false;
        }
        if (values.dateJournaled === '') {
            return false;
        }
        if (values.minutesWaited === '') {
            return false;
        }

        // If all required values present, Check that there are no formError messages
        if(ready) {
            // check returns true if errors, so we flip its return (readyForSubmit would be false on errors)
            ready = !this.checkForErrorMessages();
        }

        return ready;
    }

    // Check if error messages exist in state and return true/false
    checkForErrorMessages = () => {
        // loop through form errors object and look for values
        let errorCount = 0;
        Object.entries(this.state.formErrors).forEach(([key, val]) => {
            if (val || val !== '') {
                // value found, increase error count
                errorCount++;
            }
        });

        if (errorCount > 0) {
            return true;
        } else {
            return false;
        }
    }

    // Render Validation Error component
    renderError = (error) => {
        return (
            <FormValidationMessage>
                {error}
            </FormValidationMessage>            
        );
    }

    // Render points scored input
    renderPointsScored = () => {
        return (
            <View style={styles.pointsSection}>
                <TextInput
                    style={styles.points}
                    onChangeText={this.handlePointsScoredChange}
                    placeholder='Points Scored'
                    value={this.state.formValues.pointsScored} />
            </View>
        )
    }

      // Render Search Input (placed here to keep view below easier to read)
    renderSearchInput = () => {
        return (
            <SearchBar
                platform='ios'
                lightTheme
                containerStyle={styles.searchContainer}
                inputStyle={styles.searchInput}
                onChangeText={this.handleSearch}
                icon={{
                    style: {
                        marginLeft: 4
                    }
                }}
                clearIcon={{
                    name: 'close'
                }}
                placeholder='Search' />
        );
    }

    // Render attractions picker
    renderAttractionsPicker = () => {
        // Loading Graphic
        if (this.state.isLoading === true) {
            return (
                <View style={styles.container}>
                    <LoadingMickey />
                </View>
            );
        }

        // Double Check for selected park and attractions data, return if one or other not found
        if(!this.state.selectedPark.parkId || !this.state.attractions){ return; }


        // Load filteredAttractions from state, if not there load new filtered by parkId list from Props (this is so attractions load the first time)
        const filteredAttractions = this.state.filteredAttractions !== null ? this.state.filteredAttractions :        
            this.state.attractions.filter((attraction) => {
                return (attraction.park.id === this.state.selectedPark.parkId)
            });

        // build search input
        const searchInput = this.renderSearchInput();

        // Render Attractions field
        return (
            <View>
                <TouchableOpacity
                    onPress={() => { this.setAttractionModalVisible(true); }} >
                        <View style={styles.parkAttractionTitle}>
                            <Text style={styles.parkAttractionText}>
                                { this.state.selectedAttraction.attractionName !== '' ? this.state.selectedAttraction.attractionName : 'Select an Attraction'}
                            </Text>
                            <Icon style={styles.parkAttractionArrow} color='lightgrey' name="ios-arrow-forward" />
                        </View>
                </TouchableOpacity>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.attractionModalVisible}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity
                                    style={styles.modalCloseButton}
                                    onPress={() => { this.setAttractionModalVisible(false); }} >
                                    <Text style={styles.modalCloseButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>Select Attraction</Text>
                                {searchInput}
                            </View>
                            <View style={styles.modalBody}>
                            <FlatList
                                data={filteredAttractions}
                                renderItem={({ item }) =>     
                                    <ListItemAttraction
                                        item={item}
                                        onPress={this.handleAttractionChange}
                                        viewStyle={styles.listView}
                                        textStyle={styles.listText}
                                    />}
                                keyExtractor={item => item.id.toString()} />
                            </View>
                        </View>
                </Modal>
            </View>
        );
    }

    renderCameraButton = () => {
        return (
            <TouchableOpacity
                onPress={() => { this.toggleCameraModal(); }} 
            >
                <View style={styles.photo}>
                    <Icon style={{ fontSize: 80 }} name="ios-camera" /> 
                </View>
            </TouchableOpacity>
        );
    }

    renderPhoto = (photo) => {
        return (
            <TouchableOpacity
                onLongPress={() => { this.onPhotoDeletePress(); }} 
            >
                <View style={styles.photo}>
                    <Image 
                            style={{ width: 300, height: 225 }}
                            source={{uri: `data:image/png;base64,${photo}`}} 
                        />
                </View>
            </TouchableOpacity>
        );
    }

    // render View
    render() {
        // Loading Graphic
        if (this.state.isLoading === true) {
            return (
                <View style={styles.container}>
                    <LoadingMickey />
                </View>
            );
        }

        // Check if errors exist in state.formErrors
        // TODO: Update form with form errors, message or red colors or something
        const parkIdError = (this.state.formErrors.parkId !== '') ? this.renderError(this.state.formErrors.parkId) : null;
        const attractionIdError = (this.state.formErrors.attractionId !== '') ? this.renderError(this.state.formErrors.attractionId) : null;
        const dateJournaledError = (this.state.formErrors.dateJournaled !== '') ? this.renderError(this.state.formErrors.dateJournaled) : null;
        const ratingError = (this.state.formErrors.rating !== '') ? this.renderError(this.state.formErrors.rating) : null;
        const minutesWaitedError = (this.state.formErrors.minutesWaited !== '') ? this.renderError(this.state.formErrors.minutesWaited) : null;

        // if selected park render attraction picker
        let attractionPicker = null;
        if (this.state.renderAttractions) {
            attractionPicker = this.renderAttractionsPicker(); 
        }

        // render points scored if attraction keeps score
        let pointsScored = null;
        if (this.state.selectedAttraction.attractionHasScore) {
            pointsScored = this.renderPointsScored();
        }

        // Check that parks and attractions exist in state
        if (!this.state.parks.length > 0 || !this.state.attractions.length > 0) {
            return (
                <View style={styles.messageContainer}>
                    <Text>Parks and/or attractions data missing. Add better handling later...</Text>
                </View>
            )
        }

        const photo = (this.state.formValues.photo !== '') 
                    ? this.renderPhoto(this.state.formValues.photo)
                    : this.renderCameraButton()

        // Render form
        return (
            <KeyboardAwareScrollView style={styles.container}>
            
                <View style={styles.parkAttractionSection}>
                    <TouchableOpacity
                        onPress={() => { this.setParkModalVisible(true); }} >
                            <View style={styles.parkAttractionTitle}>
                                <Text style={styles.parkAttractionText}>
                                    { this.state.selectedPark.parkName !== '' ? this.state.selectedPark.parkName : 'Select a Park'}
                                </Text>
                                <Icon style={styles.parkAttractionArrow} color='lightgrey' name="ios-arrow-forward" />
                            </View>
                    </TouchableOpacity>
                    {attractionPicker}
                </View>
                <View style={styles.photoSection}>                   
                    {photo}
                </View>
                <View style={styles.minutesWaitedDateJournaledSection}>
                    <TextInput
                        style={styles.minuteswaited}
                        onChangeText={this.handleMinutesWaitedChange}
                        placeholder='Minutes Waited'
                        value={this.state.formValues.minutesWaited} />
                    <DatePicker
                        style={styles.datepicker}
                        date={this.state.formValues.dateJournaled}
                        mode="datetime"
                        placeholder="Select Date"
                        format="MM/DD/YYYY, hh:mm a"
                        confirmBtnText="Ok"
                        cancelBtnText="Cancel"
                        onDateChange={this.handleDateJournaledChange}
                        showIcon={false}
                        customStyles={{
                            dateInput: {
                                borderRadius: 5
                            },
                            btnTextConfirm: {
                                color: '#387EF7'
                            }
                        }} />
                </View>
                <View style={styles.ratingFastPassSection}>
                    <TextInput
                        style={styles.minuteswaited}
                        onChangeText={this.handleRatingChange}
                        placeholder='Rating'
                        value={this.state.formValues.rating} 
                    />
                    <View style={styles.fastpass}>
                        <Text style={{ marginRight: 5 }}>Fastpass</Text>
                        <Switch
                            onValueChange={this.handleFastpassChange}
                            value={this.state.formValues.usedFastPass}
                        />
                    </View>
                </View>
                {pointsScored}
                <View style={styles.commentsSection}>
                    <TextInput
                        style={styles.comments}
                        onChangeText={this.handleCommentsChange}
                        placeholder='Comments...'
                        value={this.state.formValues.comments}
                        multiline={true}
                        numberOfLines={5}
                        maxLength={400} />
                </View>

                <CameraModal 
                    quality={'.5'}
                    savePhoto={this.savePhoto}
                    visible={this.state.cameraModalVisible}
                    toggleCameraModal={this.toggleCameraModal}
                />

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.parkModalVisible}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => { this.setParkModalVisible(false); }}
                            >
                                <Text style={styles.modalCloseButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Select A Park</Text>
                        </View>
                        <View style={styles.modalBody}>
                            <FlatList
                                data={this.state.parks}
                                renderItem={({ item }) =>     
                                    <ListItem
                                        id={item.id.toString()}
                                        title={item.name}
                                        onPress={this.handleParkChange}
                                        viewStyle={styles.listView}
                                        textStyle={styles.listText} />
                                }
                                keyExtractor={item => item.id.toString()}
                            />
                        </View>
                    </View>
                </Modal>
            </KeyboardAwareScrollView>
        )
    }
}

var styles = StyleSheet.create({
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContainer: {
        flex: 1
    },
    modalHeader: {
        backgroundColor: 'white',
        borderStyle: 'solid',
        borderBottomWidth: .5,
        borderBottomColor: 'lightgrey',
        paddingTop: 50,
        paddingBottom: 5
    },
    modalTitle: {
        paddingLeft: 15,
        paddingTop: 20,
        fontSize: 35,
        fontWeight: 'bold'
    },
    modalCloseButton: {
        paddingLeft: 25,
        paddingTop: 5
    },
    modalCloseButtonText: {
        fontSize: 16,
        color: 'blue'
    },
    searchContainer: {
        backgroundColor: 'white',
        alignSelf: 'stretch',
        borderTopColor: 'white',
        borderBottomColor: 'white',
        marginTop: -5,
        marginBottom: -5
    },
    searchInput: {
        backgroundColor: '#EEEEEE',
        color: 'black',
        borderRadius: 5,
        marginLeft: 15,
        marginRight: 15
    },
    modalBody: {
        flex: 1,
        backgroundColor: 'white',
        paddingBottom: 50
    },
    listView: {
        padding: 5,
        paddingRight: 10,
        paddingLeft: 10,
        borderBottomColor: 'lightgrey',
        borderBottomWidth: 1
    },
    listText: {
        color: 'blue',
        textAlign: 'center',
        fontSize: 20
    },
    container: {
        flex: 1,
        backgroundColor: '#DDDDDD'
    },
    parkAttractionSection: {
        flexDirection: 'column',
        backgroundColor: 'white',
        marginTop: 30,
        marginBottom: 15
    },
    parkAttractionTitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: .5,
        borderBottomColor: 'lightgrey',
        paddingTop: 5,
        paddingBottom: 5,
        paddingRight: 15,
        paddingLeft: 15
    },
    parkAttractionText: {
        color: 'blue',
        fontSize: 20,
        paddingRight: 10
    },
    parkAttractionArrow: {
        fontSize: 24
    },
    photoSection: {
        backgroundColor: 'white',
        padding: 15,
        marginTop: 15,
        marginBottom: 15
    },
    photo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    minutesWaitedDateJournaledSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        borderBottomWidth: .5,
        borderBottomColor: 'white',
        marginTop: 15,
        paddingRight: 15,
        paddingLeft: 15,
        paddingTop: 10,
        paddingBottom: 10
    },
    datepicker: {
        width: 160,
        borderRadius: 5
    },
    minuteswaited: {
        width: 145,
        borderWidth: .5,
        borderColor: '#aaa',
        borderRadius: 5,
        height: 40,
        fontSize: 18,
        textAlign: 'center'
    },
    ratingFastPassSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        paddingRight: 15,
        paddingLeft: 15
    },
    fastpass: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    pointsSection: {
        backgroundColor: 'white',
        borderTopWidth: .5,
        borderTopColor: 'white',
        borderBottomWidth: .5,
        borderBottomColor: 'white',
        paddingRight: 15,
        paddingLeft: 15,
        paddingTop: 10,
        paddingBottom: 10,
    },
    points: {
        borderWidth: .5,
        borderColor: '#aaa',
        borderRadius: 5,
        height: 40,
        width: 145,
        fontSize: 18,
        textAlign: 'center'
    },
    commentsSection: {
        backgroundColor: 'white',
        paddingRight: 15,
        paddingLeft: 15,
        paddingTop: 10,
        paddingBottom: 10,
        marginBottom: 30
    },
    comments: {
        borderWidth: .5,
        borderColor: '#aaa',
        borderRadius: 5,
        height: 150
    }
});

export default EditJournalEntry;