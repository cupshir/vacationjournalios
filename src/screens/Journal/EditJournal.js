import React, { Component } from "react";
import { 
    AlertIOS,
    FlatList,
    Image,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { 
    FormValidationMessage,
    Text
} from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/Ionicons';
import uuid from 'react-native-uuid';
import DatePicker from 'react-native-datepicker';

import {
    currentUser,
    parkRealm,
    getJournalById,
    saveJournal
} from '../../realm/userService';

import LoadingMickey from '../../components/LoadingMickey';
import CameraModal from "../../components/CameraModal";

class EditJournal extends Component {
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
            currentUser: null,
            parks: [],
            formValues: {
                id: '',
                name: '',
                photo: '',
                description: '',
                startDate: '',
                endDate: '',
                parks: [],
                createdDate: '',
                owner: ''                                                             
            },
            formErrors: {
                name: '',
                date: '',
                parks: ''
            },
            journalLoaded: false,
            cameraModalVisible: false,
            isLoading: true,
            isEdit: false
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    // handle navigation events
    onNavigatorEvent(event) {
        if (event.id === 'willAppear') {
            this.updateCurrentUserInState(currentUser);
            // check if a journal id was passed, if so update state with journal data
            if (this.props.journalId && !this.state.journalLoaded) {
                // get journal
                getJournalById(this.props.journalId).then((journal) => {
                    // success - load journal data into state
                    this.loadJournalIntoState(journal);
                }).catch((error) => {
                    // failed - TODO: add better error handling or remove
                    console.log('error: ', error);
                });
            } else if (!this.state.journalLoaded) {
                // New journal - disable loading animation
                this.setState({
                    ...this.state,
                    parks: this.addCheckedPropertyToParks(),
                    isLoading: false
                })
            }
        }
        if (event.type == 'NavBarButtonPress') {
            if (event.id == 'done') {
                this.handleDone();
            } 
        }
    }

    // add checked property to parks object for state
    addCheckedPropertyToParks = (selectedParks = []) => {
        let parks = [];

        // Get parks from park realm
        const realmParks = parkRealm.objects('Park');

        // If selected parks, create an array of their ID's
        const selectedParksArray = [];
        if (selectedParks.length > 0) {
            selectedParks.forEach((park) => {
                selectedParksArray.push(park.id);
            });
        }

        // create new array of parks and add checked property for each park
        realmParks.forEach((park) => {
            // if park exists in selectedParksArray, checked is true
            if (selectedParksArray.length > 0) {
                if (selectedParksArray.includes(park.id)) {
                    park.checked = true;
                } else {
                    park.checked = false;
                }
            } else {
                park.checked = false;
            }

            parks.push(park);
        });           

        return parks;        
    }

    // Navbar styling
    componentDidMount() {
        this.props.navigator.setStyle({
            navBarNoBorder: false
        })
    }

    // loads journal data into state and flags isEdit true
    loadJournalIntoState= (journal) => {
        if (journal) {
            this.setState({
                ...this.state,
                parks: this.addCheckedPropertyToParks(journal.parks),
                formValues: {
                    id: journal.id,
                    name: journal.name,
                    startDate: journal.startDate,
                    endDate: journal.endDate,
                    parks: journal.parks,
                    photo: journal.photo,
                    createdDate: journal.dateCreated,
                    owner: journal.owner                                                             
                },
                journalLoaded: true,
                isLoading: false,
                isEdit: true
            });

        }
    }

    // loads current user object into state if exists
    updateCurrentUserInState = (user) => {
        if (user) {
            this.setState({
                ...this.state,
                currentUser: user
            });
        } else {
            this.setState({
                ...this.state,
                currentUser: null
            });
        }
    }

    // launch sign in modal
    onSignInPress = () => {
        this.props.navigator.showModal({
            screen: 'vacationjournalios.SignIn',
            title: 'Sign In',
            animated: true
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

    // photo delete press event
    onPhotoDeletePress = () => {
        // display confirm prompt, user must type CONFIRM to delete photo
        AlertIOS.prompt(
            'Confirm Delete',
            'Are you sure you want to delete the journal image?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    onPress: () => this.handleDeletePhoto()
                }
            ]
        );
    }

    // handle photo delete
    handleDeletePhoto = () => {
        this.setState({
            formValues: {
                ...this.state.formValues,
                photo: ''
            }
        });
    }

    // handle journal save event
    handleDone = () => {
        // update selected parks in state
        this.updateSelectedParks();

        // Check if ready to submit
        const ready = this.readyForSubmit(this.state.formValues);

        if(ready) {
            // start loading animation
            this.setState({
                ...this.state,
                isLoading: true
            });

            // Prep values for realm save
            const submitValues = this.prepareValuesForDB(this.state.formValues);

            // save journal to realm
            saveJournal(submitValues, this.state.isEdit).then((journal) => {
                // Success - stop animation
                this.setState({
                    ...this.state,
                    isLoading: false
                });
                // Navigate back to journal screen
                this.props.navigator.push({
                    screen: 'vacationjournalios.Journal',
                    title: journal.name,
                    animated: true,
                    animationType: 'fade'
                });
            }).catch((error) => {
                // Failed - stop animation
                this.setState({
                    ...this.state,
                    isLoading: false
                });
            });
        } else {
            AlertIOS.alert('Not ready to submit. Check form for errors.');
        }        
    }

    // Updated selected parks in state
    updateSelectedParks = () => {
        let parksError = (this.state.formErrors.parks !== '') ? this.state.formErrors.parks : '';
        let selectedParks = (this.state.formErrors.parks.length !== 0) ? this.state.formValues.parks : [];

        // loop through parks in state and if checked is true, add to selectedParks array
        this.state.parks.forEach((park) => {
            if (park.checked) {
                selectedParks.push(park);
            }
        });

        // if parks exist in selectedparks array, clear parks error message
        if (selectedParks.length > 0) {
            parksError = '';
        }

        // Send selected parks array to formValues
        this.setState({
            formValues: {
                ...this.state.formValues,
                parks: selectedParks
            },
            formErrors: {
                ...this.state.formErrors,
                parks: parksError
            }
        });
    }

    // prep return values for realm
    prepareValuesForDB = (values) => {
        // Create return object
        let returnValues = {
            id: '',
            name: '',
            startDate: '',
            endDate: '',
            parks: [],
            photo: '',
            owner: '',
            createdDate: '',
        };

        // use existing journal id if exists, otherwise create new id
        returnValues.id = (values.id !== '') ? values.id : uuid.v4();

        returnValues.name = values.name;
        returnValues.startDate = new Date(values.startDate);
        returnValues.endDate = new Date(values.endDate);
        returnValues.parks = values.parks;
        returnValues.photo = values.photo;
        returnValues.owner = (values.owner !== '') ? values.owner : this.state.currentUser.id;
        returnValues.createdDate = (values.createdDate !== '') ? values.createdDate : new Date();

        return returnValues;
    }

    // Check if form is ready for submit and return true/false
    readyForSubmit = (values) => {
        let ready = true;
        let nameError = (this.state.formErrors.name !== '') ? this.state.formErrors.name : '';
        let dateError = (this.state.formErrors.date !== '') ? this.state.formErrors.date : '';
        let parksError = (this.state.formErrors.parks !== '') ? this.state.formErrors.parks : '';

        // Check that required formValues have a value, if value missing update error message and return false
        if (values.name === '') {
            nameError = 'Please enter a journal name.';
            ready = false;
        }

        if (values.startDate === '') {
            dateError = 'Please enter a start and end date for journal.';
            ready = false;
        }

        if (values.endDate === '') {
            dateError = 'Please enter a start and end date for journal.';
            ready = false;
        }

        if (values.parks.length === 0) {
            parksError = 'Please select at least one park for journal.'
            ready = false;
        }

        // check for an error messages and return false if found
        if (nameError !== '' || dateError !== '' || parksError !== '') {
            ready = false;
        }

        // update form errors in state
        this.setState({
            formErrors: {
                ...this.state.formErrors,
                name: nameError,
                date: dateError,
                parks: parksError
            }
        })

        return ready;
    }

    // Render Validation Error component
    renderError = (error) => {
        return (
            <FormValidationMessage>
                {error}
            </FormValidationMessage>            
        );
    }

    // handle name change
    handleNameChange = (value) => {
        let nameError = '';

        // Check input for errors, if found set error message
        if (!value) {
            nameError = 'Please enter a journal name.';
        }

        // Set state and error messages
        this.setState({ 
            formValues: {
                ...this.state.formValues, 
                name: value
            },
            formErrors: {
                ...this.state.formErrors,
                name: nameError
            }
        });
    }

    // handle description change
    handleDescriptionChange = (value) => {
        this.setState({
            formValues: {
                ...this.state.formValues,
                description: value
            }
        });
    }
    
    // handle start date change
    handleStartDateChange = (date) => {
        let dateError = '';

        // Check input for errors, if found set error message
        if (!date) {
            dateError = 'Please enter a start and end date.';
        }

        // Ensure start date is not after end date
        if (this.state.formValues.endDate !== '') {
            if (date > this.state.formValues.endDate) {
                dateError = 'Start date cant be after end date.';
            }
        }

        // set state and error messages
        this.setState({
            formValues: {
                ...this.state.formValues,
                startDate: date
            },
            formErrors: {
                ...this.state.formErrors,
                date: dateError
            }
        })
    }

    // handle date change
    handleEndDateChange = (date) => {
        let dateError = '';

        // Check input for errors, if found set error message
        if (!date) {
            dateError = 'Please enter a start and end date.';
        }

        // Ensure end date is not before start date
        if (this.state.formValues.startDate !== '') {
            if (date < this.state.formValues.startDate) {
                dateError = 'End date cant be before start date.';
            }
        }

        // set state and error messages
        this.setState({
            formValues: {
                ...this.state.formValues,
                endDate: date
            },
            formErrors: {
                ...this.state.formErrors,
                date: dateError
            }
        })
    }

    // render switch row item
    renderItem = ({ item, index }) => {
        return (
            <View style={styles.checkboxItems}>
                <Switch                
                    onValueChange={() => {
                        // create new parks object (tricks component into rerendering)
                        let newParks = [ ...this.state.parks ];
                        // flip checked for selected park
                        newParks[index] = { ...newParks[index], checked: !this.state.parks[index].checked };
                        // update parks object in state
                        this.setState({
                            ...this.state,
                            parks: newParks
                        });                  
                    }}
                    value={this.state.parks[index].checked}
                    onTintColor={'#387EF7'}
                    tintColor={'#e9e9e9'}
                />
                <Text style={styles.checkBoxItemText}>{item.name}</Text>
            </View>
        )
    };

    // render camera button for triggering camera modal
    renderCameraButton = () => {
        return (
            <TouchableOpacity
                onPress={() => { this.toggleCameraModal(); }} 
            >
                <View style={styles.photo}>
                    <Icon style={{ fontSize: 80, color: '#FFFFFF' }} name="ios-camera" /> 
                </View>
            </TouchableOpacity>
        );
    }

    // render photo image
    renderPhoto = (photo) => {
        return (
            <TouchableOpacity
                onLongPress={() => { this.onPhotoDeletePress(); }} 
            >
                <View style={styles.photo}>
                    <Image 
                        style={{ width: 300, height: 300 }}
                        resizeMode={'cover'}
                        source={{uri: `data:image/png;base64,${photo}`}} 
                    />
                </View>
            </TouchableOpacity>
        );
    }

    render() {
        // Loading Mickey Graphic
        if (this.state.isLoading) {
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

        // Check if errors exist in state.formErrors
        const nameError = (this.state.formErrors.name !== '') ? this.renderError(this.state.formErrors.name) : null;
        const dateError = (this.state.formErrors.date !== '') ? this.renderError(this.state.formErrors.date) : null;
        const parksError = (this.state.formErrors.parks !== '') ? this.renderError(this.state.formErrors.parks) : null;
    
        // Check if photo exists, otherwise render camera button
        const photo = (this.state.formValues.photo !== '') 
        ? this.renderPhoto(this.state.formValues.photo) 
        : this.renderCameraButton()

        return (
            <KeyboardAwareScrollView style={styles.container}>
                <View style={styles.form}>
                    {nameError}
                    <TextInput 
                        style={styles.input}
                        onChangeText={this.handleNameChange}
                        placeholder='Enter journal name'
                        value={this.state.formValues.name}
                        placeholderTextColor={'#444444'}
                    />
                    <View style={styles.photoSection}>
                        {photo}
                    </View>
                    <TextInput 
                        style={styles.descriptionInput}
                        multiline={true}
                        numberOfLines={2}
                        maxLength={400}
                        onChangeText={this.handleDescriptionChange}
                        placeholder='Enter journal description'
                        value={this.state.formValues.description}
                        placeholderTextColor={'#444444'}
                    />
                    {dateError}
                    <View style={styles.datePickers}>
                        <DatePicker
                            style={styles.datepickerStart}
                            date={this.state.formValues.startDate}
                            mode="date"
                            placeholder="Select Start Date"
                            format="MM/DD/YYYY"
                            confirmBtnText="Ok"
                            cancelBtnText="Cancel"
                            onDateChange={this.handleStartDateChange}
                            showIcon={false}
                            customStyles={{
                                dateInput: {
                                    borderRadius: 5
                                },
                                btnTextConfirm: {
                                    color: '#387EF7'
                                },
                                placeholderText: {
                                    color: '#444444'
                                },
                                dateText: {
                                    color: '#000000'
                                }
                            }} 
                        />
                        <DatePicker
                            style={styles.datepickerEnd}
                            date={this.state.formValues.endDate}
                            mode="date"
                            placeholder="Select End Date"
                            format="MM/DD/YYYY"
                            confirmBtnText="Ok"
                            cancelBtnText="Cancel"
                            onDateChange={this.handleEndDateChange}
                            showIcon={false}
                            customStyles={{
                                dateInput: {
                                    borderRadius: 5
                                },
                                btnTextConfirm: {
                                    color: '#387EF7'
                                },
                                placeholderText: {
                                    color: '#444444'
                                },
                                dateText: {
                                    color: '#000000'
                                }
                            }} 
                        />
                    </View>
                    {parksError}
                    <FlatList
                        data={this.state.parks}
                        renderItem={this.renderItem}
                        keyExtractor={item => item.id} 
                    />
                </View>

                <CameraModal 
                    quality={'.5'}
                    savePhoto={this.savePhoto}
                    visible={this.state.cameraModalVisible}
                    toggleCameraModal={this.toggleCameraModal}
                />
            </KeyboardAwareScrollView> 
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1
    },
    form: {
        margin: 15
    },
    input: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#AAAAAA'
    },
    
    photoSection: {
        padding: 15
    },
    photo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    descriptionInput: {
        backgroundColor: '#AAAAAA',
        padding: 5,
        borderRadius: 5,
        height: 75,
        marginBottom: 15
    },
    datePickers: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },
    datepickerStart: {
        backgroundColor: '#AAAAAA'
    },
    datepickerEnd: {
        backgroundColor: '#AAAAAA'
    },
    checkboxItems: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5
    },
    checkBoxItemText: {
        color: '#AAAAAA',
        marginLeft: 5
    }
})

export default EditJournal;